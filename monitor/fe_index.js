
//
// This is a web server to manager and monitor jobs.
//

console.log('start running monitor')

var express = require('express')
var app = express()
var config = require('../config.json')
var jobUtil = require('./job')
var path = require('path')
var operation = require('./operation')
var utils = require('../common/utils')
var when = require('when')
var moment = require('moment')

// static files forder
var staticDir = path.join(__dirname, 'public');
app.use('/public', express.static(staticDir));
app.set('views', path.join(__dirname, 'template'));
app.set('view engine', 'html');
app.engine('html', require('ejs-mate'));

app.get('/', function (req, res){
    jobUtil.getAllJobs().then(function (jobs) {
        res.render('index', {
            jobs: jobs,
            partition: utils.getPartitionByTime,
            formatTime: function (t) {
                return moment(t).format('YYYY-MM-DD HH:mm:ss')
            },
            formatDuration: function (t) {
                if (t < 100) {
                    return t + ' s'
                } else if (t < 6000) {
                    return t / 60 + ' m'
                } else {
                    return t / 60 / 60 + ' h'
                }
            }
        })
    }, function (err) {
        res.redirect('error?msg=' + err)
    })
})

app.get('/error', function (req, res) {
    res.render('error', {
        message: req.query.msg
    })
})

app.get('/start', function (req, res) {
    var jobName = req.query.job_name
    var startPartition = req.query.partition
    console.log('start job: ', jobName, ' partition', startPartition)
    jobUtil.getJob(jobName).then(function (job) {
        if (job.status == 'stop' ||
            job.status == 'error' ||
            job.status == 'failed' ||
            job.status == 'dead') {
            job.status = 'waiting'
            job.start_time = new Date()
            if (startPartition && !utils.isPartitionLegal(job.frequency, startPartition)) {
                res.redirect('error?msg=partition is illegal')
                return
            }
            if (startPartition) {
                job.current_partition_time = utils.getTimeByPartition(job.frequency, startPartition)
            }
            jobUtil.saveJob(job).then(function () {
                res.redirect('/')
            }, function (err) {
                res.redirect('error?msg=' + err)
            })
        } else {
            res.redirect('error?msg=job already started')
        }
    }, function (err) {
        res.redirect('error?msg=' + err)
    })
})

app.get('/stop', function (req, res) {
    var jobName = req.query.job_name
    jobUtil.getJob(jobName).then(function (job) {
        operation.killJob(jobName)
        job.status = 'stop'
        jobUtil.saveJob(job).then(function () {
            res.redirect('/')
        }, function () {
            res.render('error', err)
        })
    }, function (err) {
        res.redirect('error?msg=' + err)
    })
})

app.listen(config.port)

console.log('monitor start at port:', config.port)
