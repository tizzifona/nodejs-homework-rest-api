const {User} = require('../models/User');
const {HttpError, sendEmail} = require('../helpers');
const {ctrlWrapper} = require('../decorators/ctrlWraper');
const bcrypt = require ('bcryptjs');
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const gravatar = require("gravatar");
const Jimp = require("jimp");
const uniqid = require("uniqid");
const {JWT_SECRET, BASE_URL} = process.env;
const avatarsPath = path.resolve('public', 'avatars');


const signUp = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (user) {
        throw HttpError(409, `${email} already in use`)
    }

    const avatarURL = gravatar.url(email, { s: '250'});

    const hashPassword = await bcrypt.hash(password, 10);
    const verificationToken = uniqid();
    const newUser = await  User.create({...req.body, password: hashPassword, avatarURL, verificationToken});
    const verifyEmail = {
        to: email,
        subject: 'Please, verify your email!',
        html: `<a target='_blank' href='${BASE_URL}/api/auth/verify/${verificationToken}'>Click to verify your email</a>`
    }
    await sendEmail(verifyEmail);

    res.status(201).json({
        username: newUser.username,
        email: newUser.email,
        avatarURL: newUser.avatarURL
    })
}

const verify = async (req, res) => {
    const {verificationToken} = req.params;
    const user = await User.findOne({verificationToken});
    if (!user) {
        throw HttpError(404, 'User not found');
    }
    await User.findByIdAndUpdate(user._id, {$set: {verify: true}, $unset: {verificationToken: true}});
    res.json({
        message: 'Verification successful'
    });
}

const resendVerifyEmail= async (req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if (!user){
        throw HttpError(404, 'Email not found');
    }
    if (user.verify) {
        throw HttpError(400, 'Email already verified');
    }
    const verifyEmail = {
        to: email,
        subject: 'Please, verify your email!',
        html: `<a target='_blank' href='${BASE_URL}/api/auth/verify/${user.verificationToken}'>Click to verify your email</a>`
    }
    await sendEmail(verifyEmail);
    res.json({
        message: 'Verification email sent'
    })
}

const signIn = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
        throw HttpError(401, 'Email or password is wrong');
    }

    if (!user.verify) {
        throw HttpError(401, 'Email not verified')
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
    verify: ctrlWrapper(verify),
    resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
    signIn: ctrlWrapper(signIn),
    getCurrent: ctrlWrapper(getCurrent),
    signOut: ctrlWrapper(signOut),
    updateSubscription: ctrlWrapper(updateSubscription),
    updateAvatar: ctrlWrapper(updateAvatar)
}