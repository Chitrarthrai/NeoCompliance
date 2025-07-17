const validator = require('validator');
const ErrorHandler = require('../utils/error-handler');
const userService = require('../services/user-service');
const tokenService = require('../services/token-service');
const UserDto = require('../dtos/user-dto');

class AuthController {
    login = async (req, res, next) => {
        const { email, password } = req.body;
        
        if (!email || !password) return next(ErrorHandler.badRequest());

        if (!validator.isEmail(email)) {
            return next(ErrorHandler.badRequest('Invalid Email Address'));
        }

        const user = await userService.findUser({ email });

        if (!user) {
            return next(ErrorHandler.badRequest('Invalid Email or Password'));
        }

        const { _id, name, username, email: dbEmail, password: hashPassword, type, status } = user;
        
       

        const isValid = await userService.verifyPassword(password, hashPassword);
        if (!isValid) {
            return next(ErrorHandler.badRequest('Invalid Email or Password'));
        }

        const payload = {
            _id,
            email: dbEmail,
            username,
            type
        };

        const { accessToken, refreshToken } = tokenService.generateToken(payload);

        await tokenService.storeRefreshToken(_id, refreshToken);
        
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
            httpOnly: true
        });
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
            httpOnly: true
        });

        res.json({ success: true, message: 'Login Successful', user: new UserDto(user) });
    };

    logout = async (req, res, next) => {
        const { refreshToken } = req.cookies;
        const { _id } = req.user;
        
        const response = await tokenService.removeRefreshToken(_id, refreshToken);
        
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        
        return (response.modifiedCount === 1) 
            ? res.json({ success: true, message: 'Logout Successfully' }) 
            : next(ErrorHandler.unAuthorized());
    };

    refresh = async (req, res, next) => {
        const { refreshToken: refreshTokenFromCookie } = req.cookies;
        
        if (!refreshTokenFromCookie) return next(ErrorHandler.unAuthorized());
        
        const userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
        const { _id, email, username, type } = userData;
        
        const token = await tokenService.findRefreshToken(_id, refreshTokenFromCookie);
        if (!token) {
            res.clearCookie('refreshToken');
            res.clearCookie('accessToken');
            return res.status(401).json({ success: false, message: 'Unauthorized Access' });
        }
        

        
        const payload = {
            _id,
            email,
            username,
            type
        };
        
        const { accessToken, refreshToken } = tokenService.generateToken(payload);
        
        await tokenService.updateRefreshToken(_id, refreshTokenFromCookie, refreshToken);
        
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });
        
        res.json({ success: true, message: 'Secure access has been granted', user: new UserDto(userData) });
    };

    createUser = async (req, res, next) => {
        try {
            const { name, email, password, role } = req.body;
            if (!name || !email || !password) {
                return next(ErrorHandler.badRequest('Name, email, and password are required.'));
            }
            if (!validator.isEmail(email)) {
                return next(ErrorHandler.badRequest('Invalid Email Address'));
            }
            if (password.length < 8) {
                return next(ErrorHandler.badRequest('Password must be at least 8 characters.'));
            }
            const existingUser = await userService.findUser({ email });
            if (existingUser) {
                return next(ErrorHandler.badRequest('Email already exists.'));
            }
            const user = await userService.createUser({ name, email, password, role });
            res.status(201).json({ success: true, message: 'User created successfully', user: new UserDto(user) });
        } catch (err) {
            next(err);
        }
    };
}

module.exports = new AuthController();