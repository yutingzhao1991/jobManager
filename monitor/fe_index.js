
//
// This is a web server to manager and monitor jobs.
//

console.log('start running monitor')



var express = require('express')
var app = express()
var config = require('../config.json')
var job = require('./job')
var ejs = require('ejs')
var path = require('path')
var operation = require('./operation')
var utils = require('../common/utils')

// static files forder
var staticDir = path.join(__dirname, 'public');
app.use('/public', express.static(staticDir));
app.set('views', path.join(__dirname, 'template'));
app.set('view engine', 'html');
app.engine('html', require('ejs-mate'));


app.get('/', function (req, res){
    job.getAllJobs(function (jobs) {
        res.render('index', {
            jobs: jobs
        })
    })
})

app.get('/start', function (req, res) {
    var jobName = req.query.job_name
    var startPartition = req.query.partition
    console.log('start job: ', jobName, ' partition', startPartition)
    job.getJob(jobName, function (job) {
        if (!job) {
            res.end('no such job')
            return
        }
        if (job.status == 'stop' || job.status == 'error' || job.status == 'failed') {
            job.status = 'waiting'
            job.start_time = new Date()
            if (startPartition) {
                job.current_partition_time = utils.getTimeByPartition(startPartition)
            } else {
                // start from 3 hours ago
                job.current_partition_time = new Date(Date.now() - 1000 * 60 * 60 * 3)
            }
            job.save()
        }
        res.redirect('/')
    })
})

app.get('/stop', function (req, res) {
    var jobName = req.query.job_name
    job.getJob(jobName, function (job) {
        if (!job) {
            res.end('no such job')
            return
        }
        operation.killJob(jobName)
        job.status = 'stop'
        job.save()
        res.redirect('/')
    })
})

app.listen(config.port)

console.log('monitor start at port:', config.port)
