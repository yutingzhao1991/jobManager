console.log('start scan logs file in folder _jobs')

var fs = require('fs')
var job = require('./job')
var utils = require('../common/utils')

var LAST_UPDATE_END = true
var LOG_DIR = __dirname + '/../_jobs'

var analyzeLog = function (content) {
    var result = null, item
    var detail = {}, temp
    var VAR_REG = /\{\{([\w\:]+)\}\}/g
    while ((result = VAR_REG.exec(content)) != null) {
        item = result[1].split('::')
        temp = detail
        for (var i = 0; i < item.length; i ++) {
            if (!temp[item[i]]) {
                temp[item[i]] = {}
            }
            temp = temp[item[i]]
        }
    }
    return detail
}

var updateJob = function (jobName, detail) {
    // TODO
    //job.updateJob()
}

var updateStatus = function () {
    if (!LAST_UPDATE_END) {
        return
    }
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
        console.log('get detail from log:', fileName, logDetail)
        updateJob(jobName, logDetail)
    }
}

var checkJobs = function () {
    job.getAllJobs(function (jobs) {
        for (var i = 0; i < jobs.length; i ++) {
            // TODO
            if (false /* should start new partition */) {

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
    }, 5000)
}

//setInterval(update, 10000)
update()