const UserModel = require("../models/user-model");
const InspectorModel = require("../models/inspector-model");
const bcrypt = require("bcrypt");

class UserService {
  findUser = async (filter) => {
    let user = await UserModel.findOne(filter);
    if (!user) {
      user = await InspectorModel.findOne(filter);
      if (user) user._doc.userType = "inspector";
    } else {
      user._doc.userType = "user";
    }
    return user;
  };

  verifyPassword = async (password, hashPassword) => {
    return await bcrypt.compare(password, hashPassword);
  };

  createUser = async (req, res) => {
    try {
      const userData = req.body;

      if (!userData.name || !userData.email || !userData.password) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: name, email, or password",
        });
      }

      let model = UserModel;

      const isInspector =
        userData.role === "inspector" || userData.userType === "inspector";
      if (isInspector) {
        model = InspectorModel;
      }

      const user = new model(userData);
      await user.save();

      return res.status(201).json({
        success: true,
        message: `${isInspector ? "Inspector" : "User"} created successfully`,
        data: user,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the user",
        error: error.message,
      });
    }
  };
}

module.exports = new UserService();
