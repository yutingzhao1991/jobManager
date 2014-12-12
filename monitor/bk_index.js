console.log('start scan logs file in folder _jobs')

var fs = require('fs')
var job = require('./job')
var utils = require('../common/utils')
var operation = require('./operation')

var LAST_UPDATE_END = true
var LOG_DIR = __dirname + '/../_jobs'

var jobsConfig = {}
utils.getAllJobsConfig(function (jobs) {
    for (var i = 0; i < jobs.length; i ++) {
        jobsConfig[jobs[i].jobName] = jobs[i].config
    }
})

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
    //job.updateJob()
    job.getJob(jobName, function (job) {
        if (!job) {
            console.warn('not find job of log file ',  jobName)
            return
        }
        if (job.status != 'processing') {
            // job was waiting, did not need update
            return
        }
        if (!detail['PARTITION']) {
            job.status = 'error'
            job.message = 'not find partition in log file'
            console.error(newJobData.message)
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
                        job.status = 'processing'
                        job.pid = detail['PID']
                    } else if (detail['JOB'] == 'FAILED') {
                        job.status = 'failed'
                    } else if (detail['JOB'] == 'SUCCESS') {
                        job.status = 'success'
                        job.current_partition_time = utils.getNextPartitionTimeByTime(job.frequency, job.current_partition_time)
                    }
                }
            }
        }
        job.save(function (err) {
            if (err) {
                console.error('save job error ', jobName)
            }
        })
    })
}

var updateStatus = function () {
    if (!LAST_UPDATE_END) {
        return
    }
    console.log('start update startus')
    var files = fs.readdirSync(LOG_DIR)
    if (!files) {
        console.warn('no log files')
        return
    }
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
        updateJob(jobName, logDetail)
    }
    setTimeout(function () {
        LAST_UPDATE_END = true
    }, 1000)
}

var shouldStartJob = function(job, jobsMap) {
    console.log('check job ', job.name)
    if (job.status != 'waiting' && job.status != 'success') {
        console.log('status false')
        return false
    }
    var partition = utils.getPartitionByTime(job.frequency, job.current_partition_time)
    var nowPartition = utils.getPartitionByTime(job.frequency, new Date())
    if (partition >= nowPartition) {
        console.log('now partition false')
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
    job.getAllJobs(function (jobs) {
        var job
        var jobsMap = {}
        for (var i = 0; i < jobs.length; i ++) {
            job = jobs[i]
            jobsMap[job.name] = job
        }
        for (var i = 0; i < jobs.length; i ++) {
            job = jobs[i]
            if (shouldStartJob(job, jobsMap)) {
                operation.startJob(job, job.current_partition_time)
                job.status = 'processing'
                job.save()
            }
            if (false /* should send alert email */) {

            }
        }
    })
}

var update = function () {
    updateStatus()
    setTimeout(function () {
        checkJobs()
    }, 10000)
}

setInterval(update, 10000)