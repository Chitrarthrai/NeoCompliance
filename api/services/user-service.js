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

  createUser = async (userData) => {
    try {
      if (!userData.name || !userData.email || !userData.password) {
        throw new Error("Missing required fields: name, email, or password");
      }

      let model = UserModel;

      const isInspector =
        userData.role === "inspector" || userData.userType === "inspector";
      if (isInspector) {
        model = InspectorModel;
      }

      const user = new model(userData);
      await user.save();

      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };
}

module.exports = new UserService();
