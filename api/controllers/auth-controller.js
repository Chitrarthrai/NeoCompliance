const validator = require("validator");
const ErrorHandler = require("../utils/error-handler");
const userService = require("../services/user-service");
const tokenService = require("../services/token-service");
const storeService = require("../services/store-service");
const UserDto = require("../dtos/user-dto");

async function login(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) return next(ErrorHandler.badRequest());
  if (!validator.isEmail(email)) {
    return next(ErrorHandler.badRequest("Invalid Email Address"));
  }
  const user = await userService.findUser({ email });
  if (!user) {
    return next(ErrorHandler.badRequest("Invalid Email or Password"));
  }
  const {
    _id,
    name,
    username,
    email: dbEmail,
    password: hashPassword,
    role,
    status,
    userType,
  } = user;

  const payload = {
    _id,
    email: dbEmail,
    username,
    role,
    userType,
  };

  const { accessToken, refreshToken } = tokenService.generateToken(payload);
  await tokenService.storeRefreshToken(_id, refreshToken);
  res.cookie("accessToken", accessToken, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    httpOnly: true,
  });
  res.cookie("refreshToken", refreshToken, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    httpOnly: true,
  });
  console.log("Login user:", user);
  console.log("Login accessToken:", accessToken);
  console.log("Login refreshToken:", refreshToken);
  res.json({
    success: true,
    message: "Login Successful",
    user,
    accessToken,
    refreshToken,
  });
}

async function logout(req, res, next) {
  const { refreshToken } = req.cookies;
  const { _id } = req.user;
  const response = await tokenService.removeRefreshToken(_id, refreshToken);
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  return response.modifiedCount === 1
    ? res.json({ success: true, message: "Logout Successfully" })
    : next(ErrorHandler.unAuthorized());
}

async function refresh(req, res, next) {
  const { refreshToken: refreshTokenFromCookie } = req.cookies;
  if (!refreshTokenFromCookie) return next(ErrorHandler.unAuthorized());
  const userData = await tokenService.verifyRefreshToken(
    refreshTokenFromCookie
  );
  const { _id, email, username, role } = userData;
  const token = await tokenService.findRefreshToken(
    _id,
    refreshTokenFromCookie
  );
  if (!token) {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized Access" });
  }

  const payload = {
    _id,
    email,
    username,
    role,
    userType: user.userType,
  };

  const { accessToken, refreshToken } = tokenService.generateToken(payload);
  await tokenService.updateRefreshToken(
    _id,
    refreshTokenFromCookie,
    refreshToken
  );
  res.cookie("accessToken", accessToken, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    httpOnly: true,
  });
  res.cookie("refreshToken", refreshToken, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    httpOnly: true,
  });
  const user = await userService.findUser({ email });
  console.log("Refresh user:", user);
  console.log("Refresh accessToken:", accessToken);
  console.log("Refresh refreshToken:", refreshToken);
  res.json({
    success: true,
    message: "Secure access has been granted",
    user,
    accessToken,
    refreshToken,
  });
}

async function createUser(req, res, next) {
  try {
    const { name, email, password, role, assigned_stores } = req.body;

    if (!name || !email || !password) {
      return next(
        ErrorHandler.badRequest("Name, email, and password are required.")
      );
    }

    if (!validator.isEmail(email)) {
      return next(ErrorHandler.badRequest("Invalid Email Address"));
    }

    if (password.length < 8) {
      return next(
        ErrorHandler.badRequest("Password must be at least 8 characters.")
      );
    }
    if (role === "inspector") {
      return next(
        ErrorHandler.forbidden("Use dedicated route to create inspectors.")
      );
    }

    const existingUser = await userService.findUser({ email });
    if (existingUser) {
      return next(ErrorHandler.badRequest("Email already exists."));
    }

    const user = await userService.createUser({
      name,
      email,
      password,
      role,
      assigned_stores,
    });

    if (assigned_stores && assigned_stores.length > 0) {
      for (const storeId of assigned_stores) {
        await storeService.addUserToStore(storeId, user._id);
      }
    }

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: new UserDto(user),
    });
  } catch (err) {
    next(err);
  }
}

async function createInspector(req, res, next) {
  try {
    const admin = req.user;
    if (!admin || admin.role !== "manager") {
      return next(
        ErrorHandler.forbidden("Only managers can create inspectors.")
      );
    }

    const { name, email, password, assigned_stores } = req.body;

    if (!name || !email || !password) {
      return next(
        ErrorHandler.badRequest("Name, email, and password are required.")
      );
    }

    if (!validator.isEmail(email)) {
      return next(ErrorHandler.badRequest("Invalid Email Address"));
    }

    if (password.length < 8) {
      return next(
        ErrorHandler.badRequest("Password must be at least 8 characters.")
      );
    }

    const existingUser = await userService.findUser({ email });
    if (existingUser) {
      return next(ErrorHandler.badRequest("Email already exists."));
    }

    const inspector = await userService.createUser({
      name,
      email,
      password,
      assigned_stores,
      userType: "inspector",
    });

    if (assigned_stores && assigned_stores.length > 0) {
      for (const storeId of assigned_stores) {
        await storeService.addUserToStore(storeId, inspector._id);
      }
    }

    res.status(201).json({
      success: true,
      message: "Inspector created successfully",
      user: new UserDto(inspector),
    });
  } catch (err) {
    next(err);
  }
}

async function createAssociate(req, res, next) {
  try {
    const manager = req.user;

    if (!manager || manager.role !== "manager") {
      return next(
        ErrorHandler.forbidden("Only managers can create associates.")
      );
    }

    // Fetch the manager's full user document to get assigned_stores
    const managerDoc = await userService.findUser({ _id: manager._id });
    const assigned_stores = managerDoc.assigned_stores || [];

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(
        ErrorHandler.badRequest("Name, email, and password are required.")
      );
    }

    if (!validator.isEmail(email)) {
      return next(ErrorHandler.badRequest("Invalid Email Address"));
    }

    if (password.length < 8) {
      return next(
        ErrorHandler.badRequest("Password must be at least 8 characters.")
      );
    }

    const existingUser = await userService.findUser({ email });
    if (existingUser) {
      return next(ErrorHandler.badRequest("Email already exists."));
    }

    // Use the manager's assigned_stores for the associate
    const associate = await userService.createUser({
      name,
      email,
      password,
      role: "associate",
      assigned_stores,
    });

    if (assigned_stores.length > 0) {
      for (const storeId of assigned_stores) {
        await storeService.addUserToStore(storeId, associate._id);
      }
    }

    res.status(201).json({
      success: true,
      message: "Associate created successfully",
      user: new UserDto(associate),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  logout,
  refresh,
  createUser,
  createAssociate,
  createInspector,
};
