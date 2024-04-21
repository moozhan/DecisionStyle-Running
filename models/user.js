const mongoose = require('mongoose');
// const Experiment = require("../models/experiment");
// const Indecision = require("../models/indecision");


const userSchema = new mongoose.Schema({
    auth0Id: {type: String, required: true, unique: true},
    // username: { type: String, required: true, unique: true},
    // email: { type: String, required: true, unique: true },
    // experiments: [{logJson: String}],
    indecision: {
        0: {type: Number, default: 3},
        1: { type: Number, default: 3},
        2: { type: Number, default: 3},
        3: { type: Number, default: 3},
        4: { type: Number, default: 3},
        5: { type: Number, default: 3},
        6: { type: Number, default: 3},
        7: { type: Number, default: 3},
        8: { type: Number, default: 3},
        9: { type: Number, default: 3},
        10: { type: Number, default: 3},
        11: { type: Number, default: 3},
        12: { type: Number, default: 3},
        13: { type: Number, default: 3},
        14: { type: Number, default: 3},
        15: { type: Number, default: 3},
    }
});

module.exports = mongoose.model('User', userSchema);