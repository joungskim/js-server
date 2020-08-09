const mongoose = require('mongoose');
const userImageURLSchema = new mongoose.Schema({
    URL: {
        type: URL,
        required: true,
    },
    userID: {
        type: String,
        required: true,
        min: 1,
        max: 255
    },
    description: {
        type: String,
        min: 1,
        max: 255
    },
    date: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('userImageURL', userImageURLSchema);