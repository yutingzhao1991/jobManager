//
// A base plugin for demo
// config: {
//  "file": "your python file"
// }

module.exports = function (config) {
    return 'python ' + config.file
}