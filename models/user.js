const mongoose = require('mongoose');
// const Experiment = require("../models/experiment");
// const Indecision = require("../models/indecision");


const userSchema = new mongoose.Schema({
    auth0Id: {type: String, required: true, unique: true},
    // username: { type: String, required: true, unique: true},
    // email: { type: String, required: true, unique: true },
    indecision: {type: Array, default: []},
    experiments: [{logJson: String}],
});

module.exports = mongoose.model('User', userSchema);