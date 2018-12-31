var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SessionSchema   = new Schema({
    sessionkey: {type : String, required: true, unique: true},
    valid: {type : Boolean, required: true, unique: false},
    expires: {type : Number, required: false, unique: false},
    originIp: {type : String, required: true, unique: false}
});

module.exports = mongoose.model('Session', SessionSchema);