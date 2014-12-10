
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

job.init()

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
    res.send('start')
})

app.get('/stop', function (req, res) {
    var jobName = req.query.job_name
    var startPartition = req.query.partition
    console.log('start job: ', jobName, ' partition', startPartition)
    res.send('start')
})

app.listen(config.port)

console.log('monitor start at port:', config.port)
