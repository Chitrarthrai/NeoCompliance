const UserModel = require("../models/user-model");
const bcrypt = require("bcrypt");

class UserService {
  findUser = async (filter) => await UserModel.findOne(filter);

  verifyPassword = async (password, hashPassword) =>
    await bcrypt.compare(password, hashPassword);

  createUser = async (req, res) => {
    try {
      const userData = req.body;
  
      if (!userData.name || !userData.email || !userData.password) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: name, email, or password",
        });
      }
  
      const user = new UserModel(userData);
  
      await user.save();
  
      return res.status(201).json({
        success: true,
        message: "User created successfully",
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