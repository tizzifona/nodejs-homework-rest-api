const {HttpError} = require("../helpers");
const jwt = require("jsonwebtoken");
const {User} = require("../models/User");
const {JWT_SECRET} = process.env;

const authenticate = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return next(HttpError(401));
    }

    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer' || !token) {
        return next(HttpError(401));
    }

    try {
        const { id } = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(id);

        if (!user || !user.token) {
            throw HttpError(401);
        }
        req.user = user;
        next();
    } catch (error) {
        next(HttpError(401));
    }
}

module.exports = authenticate;