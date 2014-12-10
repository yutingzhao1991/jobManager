
//
// This is the builder to compile job config json to folder .builder
//

console.log('start run builder ...')

var fs = require('fs')
var utils = require('../common/utils')

var JOB_TEMPLATE = '' + fs.readFileSync(__dirname + '/resources/job_template.tmpl')
if (!JOB_TEMPLATE) {
    console.error('read template error')
    return
}

var buildJob = function (jobName, config) {
    console.log('start build job : ', jobName, ' with config ', JSON.stringify(config))
    var tasks = config.tasks
    var jobCommandList = [], task, command
    for (var i = 0; i < tasks.length; i ++) {
        task = tasks[i]
        command = require('../plugins/' + task.plugin)(task.config)
        console.log(command)
        if (command) {
            jobCommandList.push(command)
        }
    }
    var jobShell = JOB_TEMPLATE
        .replace('{job_name}', jobName)
        .replace('{job_command_list}', jobCommandList.join(';').replace(/\"/g, '\\\"'))
    fs.writeFile(__dirname + '/../_jobs/' + jobName + '.sh', jobShell, function (err) {
        if (err) {
            console.error('write job ', jobName, ' failed. ', err)
        }
    })
}

utils.getAllJobsConfig(function (jobs) {
    for (var i = 0; i < jobs.length; i ++) {
        buildJob(jobs[i].jobName, jobs[i].config)
    }
})