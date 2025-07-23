const UserModel = require("../models/user-model");
const QuestionModel = require("../models/question-model");
const ScoreModel = require("../models/score-model");
const StoreModel = require("../models/store-model");
const responseFormatter = require("../utils/responseFormatter");

async function uploadQuestion(req, res, next) {
  try {
    const { sections } = req.body;
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return responseFormatter(400, "sections array is required", null, res);
    }
    for (const section of sections) {
      if (
        !section.section ||
        !section.role ||
        !section.section_no ||
        !section.questions ||
        !Array.isArray(section.questions)
      ) {
        return responseFormatter(
          400,
          "Each section must have section, role, section_no, and questions (array)",
          null,
          res
        );
      }
    }
    const docs = await QuestionModel.insertMany(sections);
    return responseFormatter(
      201,
      "Questions uploaded successfully",
      { questions: docs },
      res
    );
  } catch (err) {
    next(err);
  }
}

async function getSectionsByUserRole(req, res, next) {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return responseFormatter(400, "user_id is required", null, res);
    }
    const user = await UserModel.findById((_id = user_id));
    if (!user) {
      return responseFormatter(404, "User not found", null, res);
    }
    const role = user.role;
    const sections = await QuestionModel.find({ role }).select(
      "section section_no -_id"
    );
    return responseFormatter(
      200,
      "Sections fetched successfully",
      { sections },
      res
    );
  } catch (err) {
    next(err);
  }
}

async function getQuestionsByRoleAndSection(req, res, next) {
  try {
    const { role, section_no } = req.body;
    if (!role || !section_no) {
      return responseFormatter(
        400,
        "role and section_no are required",
        null,
        res
      );
    }
    const questions = await QuestionModel.find({ role, section_no });
    return responseFormatter(
      200,
      "Questions fetched successfully",
      { questions },
      res
    );
  } catch (err) {
    next(err);
  }
}

async function getUserSectionScores(req, res, next) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return responseFormatter(400, "userId is required", null, res);
    }
    const results = await ScoreModel.aggregate([
      { $match: { userId: require("mongoose").Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "questions",
          localField: "section_id",
          foreignField: "_id",
          as: "sectionDetails",
        },
      },
      { $unwind: "$sectionDetails" },
      {
        $project: {
          _id: 0,
          section_id: 1,
          totalCorrectAnswers: 1,
          totalWrongAnswers: 1,
          wrongQuestions: 1,
          section: "$sectionDetails.section",
          section_no: "$sectionDetails.section_no",
          role: "$sectionDetails.role",
        },
      },
    ]);
    return responseFormatter(
      200,
      "Section scores fetched successfully",
      { sectionScores: results },
      res
    );
  } catch (err) {
    next(err);
  }
}

async function submitSectionScore(req, res, next) {
  try {
    const { userId, section_id, answers } = req.body;
    if (!userId || !section_id || !Array.isArray(answers)) {
      return responseFormatter(
        400,
        "userId, section_id, and answers are required",
        null,
        res
      );
    }

    const totalCorrectAnswers = answers.filter((a) => a.isCorrect).length;
    const totalWrongAnswers = answers.length - totalCorrectAnswers;
    const wrongQuestions = answers
      .filter((a) => !a.isCorrect)
      .map((a) => ({ questionId: a.questionId }));

    await ScoreModel.findOneAndUpdate(
      { userId, section_id },
      { totalCorrectAnswers, totalWrongAnswers, wrongQuestions },
      { upsert: true, new: true }
    );

    return responseFormatter(200, "Score saved successfully", null, res);
  } catch (err) {
    next(err);
  }
}

async function getAssociatesScoresForManager(req, res, next) {
  try {
    const { managerId } = req.body;
    if (!managerId) {
      return responseFormatter(400, "managerId is required", null, res);
    }

    const mongoose = require("mongoose");
    const managerObjectId = mongoose.Types.ObjectId(managerId);

    const stores = await StoreModel.find({
      "assigned_users.managers": managerObjectId,
    });
    if (!stores.length) {
      return responseFormatter(
        404,
        "No stores found for this manager",
        null,
        res
      );
    }

    const associateIds = stores.flatMap(
      (store) => store.assigned_users.associates
    );
    if (!associateIds.length) {
      return responseFormatter(
        404,
        "No associates found for this manager",
        null,
        res
      );
    }

    const scores = await ScoreModel.aggregate([
      { $match: { userId: { $in: associateIds } } },
      {
        $project: {
          _id: 0,
          userId: 1,
          score: "$totalCorrectAnswers",
        },
      },
    ]);
    return responseFormatter(
      200,
      "Scores fetched successfully",
      { scores },
      res
    );
  } catch (err) {
    next(err);
  }
}

async function getScoreDetails(req, res, next) {
  try {
    const { storeId } = req.body;
    if (!storeId) {
      return responseFormatter(400, "storeId is required", null, res);
    }

    const store = await StoreModel.findById(storeId)
      .populate("assigned_users.managers", "name email role")
      .populate("assigned_users.associates", "name email role");
    if (!store) {
      return responseFormatter(404, "Store not found", null, res);
    }

    const users = [
      ...store.assigned_users.managers.map((u) => ({
        ...u.toObject(),
        role: "manager",
      })),
      ...store.assigned_users.associates.map((u) => ({
        ...u.toObject(),
        role: "associate",
      })),
    ];

    const mongoose = require("mongoose");
    const userIds = users.map((u) => u._id);

    const scores = await ScoreModel.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $lookup: {
          from: "questions",
          localField: "section_id",
          foreignField: "_id",
          as: "sectionDetails",
        },
      },
      { $unwind: "$sectionDetails" },
      {
        $project: {
          userId: 1,
          section_id: 1,
          section: "$sectionDetails.section",
          section_no: "$sectionDetails.section_no",
          score: "$totalCorrectAnswers",
        },
      },
    ]);

    const userScores = {};
    scores.forEach((s) => {
      if (!userScores[s.userId]) userScores[s.userId] = [];
      userScores[s.userId].push({
        section_id: s.section_id,
        section: s.section,
        section_no: s.section_no,
        score: s.score,
      });
    });

    const result = users.map((u) => ({
      userId: u._id,
      name: u.name,
      role: u.role,
      sections: userScores[u._id] || [],
    }));

    return responseFormatter(
      200,
      "Score details fetched successfully",
      { users: result },
      res
    );
  } catch (err) {
    next(err);
  }
}

async function assignStoresToUser(req, res, next) {
  try {
    const { userId, assigned_stores } = req.body;

    if (
      !userId ||
      !Array.isArray(assigned_stores) ||
      assigned_stores.length === 0
    ) {
      return responseFormatter(
        400,
        "userId and assigned_stores (array) are required.",
        null,
        res
      );
    }

    // Update the user's assigned_stores field
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { assigned_stores } },
      { new: true }
    );

    if (!user) {
      return responseFormatter(404, "User not found.", null, res);
    }

    // Add user to each store's associates array
    const storeService = require("../services/store-service");
    await Promise.all(
      assigned_stores.map((storeId) =>
        storeService.addUserToStore(storeId, userId)
      )
    );

    return responseFormatter(
      200,
      "Stores assigned to user successfully.",
      { user },
      res
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadQuestion,
  getSectionsByUserRole,
  getQuestionsByRoleAndSection,
  getUserSectionScores,
  submitSectionScore,
  getAssociatesScoresForManager,
  getScoreDetails,
  assignStoresToUser,
};
