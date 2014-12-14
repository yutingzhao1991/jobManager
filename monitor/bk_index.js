console.log('start scan logs file in folder _jobs')

var fs = require('fs')
var jobUtil = require('./job')
var utils = require('../common/utils')
var operation = require('./operation')
var when = require('when')
var alerter = require('./alerter')
var config = require('../config.json')

var LAST_UPDATE_END = true
var LOG_DIR = __dirname + '/../_jobs'

var jobsConfig = {}

var checkPidAlive = function (pid) {
    try {
        process.kill(pid, 0)
    } catch (err) {
        // no such pid alive
        return false
    }
    return true
}

var analyzeLog = function (content) {
    var result = null, item
    var detail = {}, temp
    var VAR_REG = /\{\{(.+)\}\}/g
    while ((result = VAR_REG.exec(content)) != null) {
        item = result[1].split('::')
        if (item.length >= 2) {
            detail[item[0]] = item[1]
        }
    }
    return detail
}

var updateJob = function (jobName, detail) {
    console.log('update job ', jobName)
    var promise = when.promise(function (resolve, reject, notify) {
        jobUtil.getJob(jobName).then(function (job) {
            if (job.status != 'processing') {
                // job was waiting, did not need update
                resolve()
                return
            }
            if (!detail['PARTITION']) {
                job.status = 'error'
                job.message = 'not find partition in log file'
                console.error(job.message)
            } else {
                var currentPartitionTime = job.current_partition_time
                if (!currentPartitionTime) {
                    console.warn('current partition time is null')
                } else {
                    var currentPartion = utils.getPartitionByTime(job.frequency, job.current_partition_time)
                    if (currentPartion != detail['PARTITION']) {
                        job.status = 'error'
                        job.message = 'partition in log (' +
                            detail['PARTITION'] +
                            ') not same with partition in mongo(' +
                            currentPartion + ')'
                        console.error(job.message)
                    } else {
                        if (detail['JOB'] == 'START') {
                            job.pid = detail['PID']
                            if (checkPidAlive(job.pid)) {
                                job.status = 'processing'
                            } else {
                                job.status = 'dead'
                                console.error('job dead :', jobName)
                            }
                        } else if (detail['JOB'] == 'FAILED') {
                            job.status = 'failed'
                        } else if (detail['JOB'] == 'SUCCESS') {
                            job.status = 'success'
                            if (detail['PROCESSING_TIME']) {
                                if (job.average_processing_time) {
                                    job.average_processing_time =
                                        Math.ceil((parseInt(detail['PROCESSING_TIME']) + job.average_processing_time) / 2)
                                } else {
                                    job.average_processing_time = parseInt(detail['PROCESSING_TIME'])
                                }
                            }
                            job.current_partition_time = utils.getNextPartitionTimeByTime(job.frequency, job.current_partition_time)
                        }
                    }
                }
            }
            job.save(function (err) {
                if (err) {
                    console.error('save job error ', jobName)
                    reject(err)
                    return
                }
                resolve(job)
            })
        }, function (err) {
            console.warn('not find job of log file ',  jobName)
            reject(err)
        })
    })
    return promise
}

var updateStatus = function () {
    var promise = when.promise(function (resolve, reject, notify) {
        console.log('start update startus')
        // this is a bkend process, we can use sync api
        var files = fs.readdirSync(LOG_DIR)
        if (!files) {
            reject(new Error('read log files error'))
            return
        }
        var ps = []
        for (var i = 0; i < files.length; i ++) {
            var fileName = files[i]
            if (!/\.log$/.test(fileName)) {
                continue
            }
            var jobName = fileName.replace(/\.log$/, '')
            var fileContent = "" + fs.readFileSync(LOG_DIR + '/' + fileName)
            if (!fileContent) {
                console.warn('file:', fileName, 'is empty')
                continue
            }
            var logDetail = analyzeLog(fileContent)
            // console.log('get detail from log:', fileName, logDetail)
            ps.push(updateJob(jobName, logDetail))
        }
        when.all(ps).then(function () {
            resolve()
        }, function (err) {
            reject(err)
        })
    })
    return promise
}

var shouldStartJob = function(job, jobsMap) {
    console.log('check job ', job.name)
    if (job.status != 'waiting' && job.status != 'success') {
        //console.log('status false')
        return false
    }
    var partition = utils.getPartitionByTime(job.frequency, job.current_partition_time)
    var nowPartition = utils.getPartitionByTime(job.frequency, new Date())
    if (partition >= nowPartition) {
        //console.log('now partition false')
        return false
    }
    if (!jobsConfig[job.name]) {
        console.warn('not find job config of :', job.name)
        return false
    }
    var dependencies = jobsConfig[job.name].dependencies
    var allDepReady = true
    var depJob, i, depPartion
    for (i = 0; i < dependencies.length; i ++) {
        depJob = jobsMap[dependencies[i].job]
        depPartion = utils.getPartitionByTime(job.frequency, depJob.current_partition_time)
        if (depPartion <= partition) {
            console.log(job.name, ' dependence ', depJob.name, ' not ready')
            allDepReady = false
            break
        }
    }
    return allDepReady
}

var checkJobs = function () {
    console.log('check jobs should start a new partition')
    var promise = when.promise(function (resolve, reject, notify) {
        jobUtil.getAllJobs().then(function (jobs) {
            var job
            var jobsMap = {}
            for (var i = 0; i < jobs.length; i ++) {
                job = jobs[i]
                jobsMap[job.name] = job
            }
            var ps = []
            for (var i = 0; i < jobs.length; i ++) {
                job = jobs[i]
                if (job.status == 'stop') {
                    continue
                }
                if (shouldStartJob(job, jobsMap)) {
                    operation.startJob(job, job.current_partition_time)
                    job.status = 'processing'
                } else {
                    job.status = 'waiting'
                }
                ps.push(jobUtil.saveJob(job))
            }
            when.all(ps).then(function () {
                resolve(jobs)
            }, function (err) {
                console.log(err)
                reject(err)
            })
        }, function (err) {
            reject(err)
        })
    })
    return promise
}

var runBackendProcess = function () {
    console.log('run backend process')
    updateStatus().then(function () {
        checkJobs().then(function (jobs) {
            setTimeout(function () {
                runBackendProcess()
            }, 10000)
        }, function (err) {
            console.error('check jobs error')
            console.log(err)
        })
    }, function (err) {
        console.error('bk server update job status failed', err)
    })
}

setInterval(function () {
    alerter.checkAndAlertJobs(jobs)
}, config.alertInterval * 1000)

when.all([jobUtil.init(), utils.getAllJobsConfig()]).then(function (result) {
    var jobs = result[1]
    for (var i = 0; i < jobs.length; i ++) {
        jobsConfig[jobs[i].jobName] = jobs[i].config
    }
    runBackendProcess()
}, function (err) {
    console.log('utils read all jobs config error')
    console.error(err)
})
