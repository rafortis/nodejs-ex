var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LevelDefaultSchema   = new Schema({
    levelNumber: {type : String, required: true, unique: true},
    rows: {
        levelRows : [Schema.Types.Mixed],
        startRows: Schema.Types.Mixed,
        endRows: Schema.Types.Mixed
    },
    boatPaths: [Schema.Types.Mixed],
    cameraPath: [Schema.Types.Mixed],
    riverParts: [Schema.Types.Mixed],
    staticParts: [Schema.Types.Mixed],
    binsAvaliable: [Schema.Types.Mixed]
});

module.exports = mongoose.model('LevelDefault', LevelDefaultSchema);