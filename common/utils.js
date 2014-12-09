var fs = require('fs')

exports.getAllJobsConfig = function (callback) {
    var jobs = []
    var CONFIG_DIR = __dirname + '/../jobs'
    fs.readdir(CONFIG_DIR, function (err, files) {
        if (err) {
            console.error('read job config error', err)
        } else {
            for (var i = 0; i < files.length; i ++) {
                var fileName = files[i]
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
