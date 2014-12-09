
//
// This is the builder to compile job config json to folder .builder
//

console.log('start run builder ...')

var utils = require('../common/utils')


var buildJob = function (jobName, config) {

}

utils.getAllJobsConfig(function (jobs) {
	for (var i = 0; i < jobs.length; i ++) {
		buildJob(jobs[i].jobName, jobs[i].config)
	}
})