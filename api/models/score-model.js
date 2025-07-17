const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Score Schema
const ScoreSchema = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    totalCorrectAnswers: { 
        type: Number, 
        required: true,
        default: 0,
        min: 0
    },
    totalWrongAnswers: { 
        type: Number, 
        required: true,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Score', ScoreSchema);