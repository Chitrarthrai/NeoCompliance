const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    iscorrect: {
        type: Boolean,
        required: true
    }
});

const QuestionSchema = new Schema({
    section: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['associate', 'manager'],
    },
    section_no: {
        type: Number,
        required: true,
        min: 1
    },
    questions: [
        {
            id: {
                type: Number,
                required: true
            },
            question: {
                type: String,
                required: true
            },
            explanation: {
                type: String,
                required: true
            },
            answers: [AnswerSchema]
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', QuestionSchema);