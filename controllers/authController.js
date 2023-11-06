const {User} = require('../models/User');
const {HttpError} = require('../helpers');
const {ctrlWrapper} = require('../decorators/ctrlWraper');
const bcrypt = require ('bcryptjs');
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const gravatar = require("gravatar");
const Jimp = require("jimp");
const {JWT_SECRET} = process.env;
const avatarsPath = path.resolve('public', 'avatars');

const signUp = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (user) {
        throw HttpError(409, `${email} already in use`)
    }

    const avatarURL = gravatar.url(email, { s: '250'});

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await  User.create({...req.body, password: hashPassword, avatarURL});

    res.status(201).json({
        username: newUser.username,
        email: newUser.email,
        avatarURL: newUser.avatarURL
    })
}

const signIn = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
        throw HttpError(401, 'Email or password is wrong');
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, 'Email or password is wrong');
    }
    const payload = {
        id: user._id,
    }
    const token = jwt.sign(payload, JWT_SECRET, {expiresIn: '23h'});
    await User.findByIdAndUpdate(user._id, {token})
    res.json({token,
        user: {
            username: user.username,
            email: user.email,
            subscription: user.subscription
        }})
}

const getCurrent = async (req, res) => {
    const {username, email, subscription} = req.user;
    res.json({
        username,
        email,
        subscription
    })
}

const signOut = async (req, res) => {
    const {_id}= req.user;
    await User.findByIdAndUpdate(_id, {token: ''});

    res.json({
        message: 'Signout successful!'
    })
}

const updateSubscription = async (req, res) => {
    const {_id} = req.user;
    const { subscription } = req.body;
    await User.findByIdAndUpdate(_id, { subscription });
    res.json({
        message: `Subscription has been changed successfully to ${subscription}`,
    });
};

const updateAvatar = async (req, res) => {
    const { _id } = req.user;
    const { path: tmpUpload, originalname } = req.file;
    const filename = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsPath, filename);
    await fs.promises.rename(tmpUpload, resultUpload);

    const avatarURL = path.join('avatars', filename);
    await User.findByIdAndUpdate(_id, { avatarURL });

    const avatar = await Jimp.read(resultUpload);
    await avatar.cover(250, 250).write(resultUpload);

    res.json({
        avatarURL,
    });
};

module.exports = {
    signUp: ctrlWrapper(signUp),
    signIn: ctrlWrapper(signIn),
    getCurrent: ctrlWrapper(getCurrent),
    signOut: ctrlWrapper(signOut),
    updateSubscription: ctrlWrapper(updateSubscription),
    updateAvatar: ctrlWrapper(updateAvatar)
}