const UserModel = require('../models/user-model');
const QuestionModel = require('../models/question-model');

exports.uploadQuestion = async (req, res, next) => {
    try {
        const { section, role, section_no, questions } = req.body;
        if (!section || !role || !section_no || !questions || !Array.isArray(questions)) {
            return res.status(400).json({ success: false, message: 'Missing or invalid fields in request body.' });
        }
        
        const questionDoc = new QuestionModel({ section, role, section_no, questions });
        await questionDoc.save();
        res.status(201).json({ success: true, message: 'Question uploaded successfully', question: questionDoc });
    } catch (err) {
        next(err);
    }
};

exports.getSectionsByUserRole = async (req, res, next) => {
    try {
        const { user_id } = req.body;
        if (!user_id) {
            return res.status(400).json({ success: false, message: 'user_id is required' });
        }
        const user = await UserModel.findById(user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const role = user.role;
        const sections = await QuestionModel.find({ role }).select('section section_no -_id');
        res.json({ success: true, sections });
    } catch (err) {
        next(err);
    }
};
