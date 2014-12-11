var fs = require('fs')
var moment = require('moment')

exports.getAllJobsConfig = function (callback) {
    var jobs = []
    var CONFIG_DIR = __dirname + '/../jobs'
    fs.readdir(CONFIG_DIR, function (err, files) {
        if (err) {
            console.error('read job config error', err)
        } else {
            for (var i = 0; i < files.length; i ++) {
                var fileName = files[i]
                if (!/\.json$/.test(fileName)) {
                    continue
                }
                var jobName = fileName.replace(/\.json$/, '')
                jobs.push({
                    jobName: jobName,
                    config: require(CONFIG_DIR + '/' + fileName)
                })
            }
        }
        callback(jobs)
    })
}

exports.getTimeByPartition = function (frequncy, patition) {
    // TODO partion check
    switch(frequncy) {
        case 'monthly':
            return moment(patition, 'YYYY/MM').toDate()
        case 'daily':
            return moment(patition, 'YYYY/MM/DD').toDate()
        case 'hourly':
            return moment(patition, 'YYYY/MM/DD/HH').toDate()
        case 'quarterly':
            var p = patition.split('/')
            p[p.length - 1] = parseInt(p[p.length - 1]) * 15
            return moment(p.join('/'), 'YYYY/MM/DD/MM').toDate()
    }
}

exports.getPartitionByTime = function (frequncy, time) {
    switch(frequncy) {
        case 'monthly':
            return moment(time).format('YYYY/MM')
        case 'daily':
            return moment(time).format('YYYY/MM/DD')
        case 'hourly':
            return moment(time).format('YYYY/MM/DD/HH')
        case 'quarterly':
            return moment(time).format('YYYY/MM/DD/HH') + '/' + Math.floor(time.getMinutes() / 15)
    }
}