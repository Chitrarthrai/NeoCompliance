const tokenService = require('../services/token-service');
const userService = require('../services/user-service');
const ErrorHandler = require('../utils/error-handler');
const {TokenExpiredError} = require('jsonwebtoken');

const auth = async (req,res,next) =>
{
    let accessToken = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        accessToken = req.headers.authorization.split(' ')[1];
    }
    const refreshToken = req.cookies.refreshToken;
    if (!accessToken) return next(ErrorHandler.unAuthorized());
    try{
        const userData = await tokenService.verifyAccessToken(accessToken);
        if(!userData)
            throw new Error(ErrorHandler.unAuthorized());
        req.user= userData;
    }
    catch(e)
    {
        if(e instanceof TokenExpiredError)
        {
            if(!refreshToken) return next(ErrorHandler.unAuthorized());
                const userData = await tokenService.verifyRefreshToken(refreshToken);
                const {_id,email,username,role} = userData;
                const token = await tokenService.findRefreshToken(_id,refreshToken);
                if(!token) return next(ErrorHandler.unAuthorized());
                const payload = {
                    _id,
                    email,
                    username,
                    role
                }
                const {accessToken: newAccessToken,refreshToken: newRefreshToken} = tokenService.generateToken(payload);
                await tokenService.updateRefreshToken(_id,refreshToken,newRefreshToken);
                const user = await userService.findUser({email});
                if(user.status!='active') return next(ErrorHandler.unAuthorized('There is a problem with your account, Please contact to the admin'));
                req.user = user;
                req.cookies.accessToken = newAccessToken;
                req.cookies.refreshToken = newRefreshToken;
                res.cookie('accessToken',newAccessToken,{
                    maxAge:1000*60*60*24*30,
                })
                res.cookie('refreshToken',newRefreshToken,{
                    maxAge:1000*60*60*24*30,
                })
                    return next();
            }
        else
            return next(ErrorHandler.unAuthorized());
    }
    next();
}

const authRole = (roles) =>
{
    return (req,res,next)=>
    {
        if(!roles.includes(req.user.role))
            return next(ErrorHandler.notAllowed());
        next();
    }
}

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
};

module.exports ={
    auth,
    authRole,
    isAdmin
}