const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        min: 4,
        max: 255
    },
    nameFirst: {
        type: String,
        required: true,
        min: 1,
        max: 255
    },
    nameMiddle: {
        type: String,
        min: 1,
        max: 255
    },
    nameLast: {
        type: String,
        required: true,
        min: 1,
        max: 255
    },
    email: {
        type: String,
        required: true,
        max: 255,
        min: 6
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 6
    },
    currentTenant: {
        type: Boolean,
    },
    owner: {
        type: Boolean,
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);