const {Schema} = require('mongoose');
const mongoose = require("mongoose");


const indecisionSchema = new mongoose.Schema({
    0: {type: Number, required: true},
    1: { type: Number, required: true},
    2: { type: Number, required: true},
    3: { type: Number, required: true},
    4: { type: Number, required: true},
    5: { type: Number, required: true},
    6: { type: Number, required: true},
    7: { type: Number, required: true},
    8: { type: Number, required: true},
    9: { type: Number, required: true},
    10: { type: Number, required: true},
    11: { type: Number, required: true},
    12: { type: Number, required: true},
    13: { type: Number, required: true},
    14: { type: Number, required: true},

});    

module.exports = mongoose.model('Indecision', indecisionSchema);