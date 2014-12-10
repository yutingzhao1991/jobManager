var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var JobSchema = new Schema({
    name: { type: String, index: true},
    pid: {type: String},
    start_time: { type: Date, default: Date.now },
    current_partition: { type: Date, default: Date.now },
    frequency: { type: String },
    latency: { type: Number, default: 0 },
    average_latency: { type: Number, default: 0 },
    average_processing_time: { type: Number, default: 0 },
    author: { type: String },
    status: {type: String }
});

mongoose.model('Job', JobSchema);