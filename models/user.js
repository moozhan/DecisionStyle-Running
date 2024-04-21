const mongoose = require('mongoose');
const Experiment = require("../models/experiment");
const Indecision = require("../models/indecision");


const userSchema = new mongoose.Schema({
    auth0Id: {type: String, required: true, unique: true},
    // username: { type: String, required: true, unique: true},
    // email: { type: String, required: true, unique: true },
    experiments: [{logJson: String}],
    indecision: {
        0: {type: Number},
        1: { type: Number},
        2: { type: Number},
        3: { type: Number},
        4: { type: Number},
        5: { type: Number},
        6: { type: Number},
        7: { type: Number},
        8: { type: Number},
        9: { type: Number},
        10: { type: Number},
        11: { type: Number},
        12: { type: Number},
        13: { type: Number},
        14: { type: Number},
        15: { type: Number},
    }
});

module.exports = mongoose.model('User', userSchema);