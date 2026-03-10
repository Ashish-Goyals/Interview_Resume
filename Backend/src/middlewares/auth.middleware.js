
const jwt = require ('jsonwebtoken');
const blackListModel = require ('../models/blackList.model');


async function authUser(req,res,next){
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized, token not found'
        });
    }

    const isBlacklisted = await blackListModel.findOne({token});
    if (isBlacklisted) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized, token is blacklisted'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized, invalid token'
        });
    }
}

module.exports = {authUser};