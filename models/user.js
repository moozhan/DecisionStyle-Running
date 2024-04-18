const mongoose = require('mongoose');
const experiment = require("../models/experiment");


const userSchema = new mongoose.Schema({
    auth0Id: {type: String, required: true, unique: true},
    username: { type: String, required: true, unique: true},
    email: { type: String, required: true, unique: true },
    experiments: [experiment]
});

module.exports = mongoose.model('User', userSchema);
