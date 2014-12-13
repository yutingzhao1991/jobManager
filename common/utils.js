var fs = require('fs')
var moment = require('moment')
var when = require('when')

exports.getAllJobsConfig = function () {
    var promise = when.promise(function (resolve, reject, notify) {
        var jobs = []
        var CONFIG_DIR = __dirname + '/../jobs'
        fs.readdir(CONFIG_DIR, function (err, files) {
            if (err) {
                reject(err)
                return
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
            resolve(jobs)
        })
    })
    return promise
}

exports.isPartitionLegal = function (frequency, partition) {
    console.log(frequency)
    console.log(partition)
    switch(frequency) {
        case 'monthly':
            return /^\d\d\d\d\/\d\d$/.test(partition)
        case 'daily':
            return /^\d\d\d\d\/\d\d\/\d\d$/.test(partition)
        case 'hourly':
            return /^\d\d\d\d\/\d\d\/\d\d\/\d\d$/.test(partition)
        case 'quarterly':
            return /^\d\d\d\d\/\d\d\/\d\d\/\d\d\/\d$/.test(partition)
    }
    return false
}

exports.getTimeByPartition = function (frequency, partition) {
    switch(frequency) {
        case 'monthly':
            return moment(partition, 'YYYY/MM').toDate()
        case 'daily':
            return moment(partition, 'YYYY/MM/DD').toDate()
        case 'hourly':
            return moment(partition, 'YYYY/MM/DD/HH').toDate()
        case 'quarterly':
            var p = partition.split('/')
            p[p.length - 1] = parseInt(p[p.length - 1]) * 15
            return moment(p.join('/'), 'YYYY/MM/DD/HH/mm').toDate()
    }
}

var getPartitionByTime = function (frequency, time) {
    switch(frequency) {
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

exports.getPartitionByTime = getPartitionByTime

exports.getNextPartitionTimeByTime = function (frequency, time) {
    var nextPatitionTime = moment(time)
    switch(frequency) {
        case 'monthly':
            nextPatitionTime.add(1, 'months')
            break
        case 'daily':
            nextPatitionTime.add(1, 'days')
            break
        case 'hourly':
            nextPatitionTime.add(1, 'hours')
            break
        case 'quarterly':
            nextPatitionTime.add(15, 'minutes')
            break
    }
    return nextPatitionTime.toDate()
}