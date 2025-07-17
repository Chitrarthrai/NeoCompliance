const UserModel = require('../models/user-model');
const QuestionModel = require('../models/question-model');

async function uploadQuestion(req, res, next) {
    try {
        const { sections } = req.body;
        if (!sections || !Array.isArray(sections) || sections.length === 0) {
            return res.status(400).json({ success: false, message: 'sections array is required' });
        }
        for (const section of sections) {
            if (!section.section || !section.role || !section.section_no || !section.questions || !Array.isArray(section.questions)) {
                return res.status(400).json({ success: false, message: 'Each section must have section, role, section_no, and questions (array)' });
            }
        }
        const docs = await QuestionModel.insertMany(sections);
        res.status(201).json({ success: true, message: 'Questions uploaded successfully', questions: docs });
    } catch (err) {
        next(err);
    }
}

async function getSectionsByUserRole(req, res, next) {
    try {
        const { user_id } = req.body;
        if (!user_id) {
            return res.status(400).json({ success: false, message: 'user_id is required' });
        }
        const user = await UserModel.findById(_id= user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const role = user.role;
        const sections = await QuestionModel.find({ role }).select('section section_no -_id');
        res.json({ success: true, sections });
    } catch (err) {
        next(err);
    }
}

async function getQuestionsByRoleAndSection(req, res, next) {
    try {
        const { role, section_no } = req.body;
        if (!role || !section_no) {
            return res.status(400).json({ success: false, message: 'role and section_no are required' });
        }
        const questions = await QuestionModel.find({ role, section_no });
        res.json({ success: true, questions });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    uploadQuestion,
    getSectionsByUserRole,
    getQuestionsByRoleAndSection,
};
