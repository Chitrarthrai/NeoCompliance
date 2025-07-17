const UserModel = require("../models/user-model");
const bcrypt = require("bcrypt");

class UserService {
  findUser = async (filter) => await UserModel.findOne(filter);

  verifyPassword = async (password, hashPassword) =>
    await bcrypt.compare(password, hashPassword);

  createUser = async (userData) => {
    const user = new UserModel(userData);
    return await user.save();
  };
}

module.exports = new UserService();