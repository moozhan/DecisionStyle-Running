const mongoose = require('mongoose');
const Experiment = require("../models/experiment");
// const Indecision = require("../models/indecision");


const userSchema = new mongoose.Schema({
    auth0Id: {type: String, required: true, unique: true},
    // username: { type: String, required: true, unique: true},
    // email: { type: String, required: true, unique: true },
    exp_id: {type: Number, required: false, unique: false},
    indecision: {type: Array, default: []},
    userdetails: {type: Array, default: []},
    experiments: {type: Array, default: []},
    date_added: { type: Date, default: Date.now } // Add this line
});

module.exports = mongoose.model('User', userSchema);
