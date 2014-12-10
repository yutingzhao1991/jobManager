var config = require('../config.json')
var mongoose = require('mongoose')

mongoose.connect(config.db, function (err) {
    if (err) {
        console.error('connect to %s error: ', config.db, err.message);
        process.exit(1);
    }
});
require('./model/job.js')
var Job = mongoose.model('Job')
var utils = require('../common/utils')

var initJob = function (jobInfo) {
    Job.findOne({
        name: jobInfo.jobName
    }, function (err, job) {
        if (err) {
            console.errot(err)
            return
        }
        if (job) {
            // job already exist
            return
        }
        var newJob = new Job()
        newJob.name = jobInfo.jobName
        if (jobInfo.config) {
            newJob.frequency = jobInfo.config.frequency
            newJob.author = jobInfo.config.author
            newJob.status = 'dead'
        }
        newJob.save(function (err) {
            if (err) {
                console.error(err)
            }
        })
    })
}

exports.init = function () {
    utils.getAllJobsConfig(function (jobs) {
        for (var i = 0; i < jobs.length; i ++) {
            initJob(jobs[i])
        }
    })
}

exports.getAllJobs = function (callback) {
    console.log('init jobs')
    Job.find({}, function (err, jobs) {
        if (err) {
            console.error(err)
            callback([])
            return
        }
        callback(jobs)
    })
}

exports.updateJob = function (jobName, newData, callback) {
    Job.findOne({
        name: jobName
    }, function (err, job) {
        if (err) {
            console.error(err)
            callback(err)
            return
        }
        Job.name.status = newData.status
        Job.save(function (err) {
            if (err) {
                console.log(err)
                callback(err)
            } else {
                callback(null)
            }
        })
    })
}

exports.deleteJob = function (jobName, callback) {
    // TODO
}