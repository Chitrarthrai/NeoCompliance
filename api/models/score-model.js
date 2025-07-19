const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ScoreSchema = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    section_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Question',
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
    },
    wrongQuestions: [
        {
            questionId: {
                type: Number, 
                required: true
            },
            _id: false
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Score', ScoreSchema);