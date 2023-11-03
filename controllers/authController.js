const {User} = require('../models/User');
const {HttpError} = require('../helpers');
const {ctrlWrapper} = require('../decorators/ctrlWraper');
const bcrypt = require ('bcryptjs');
const jwt = require("jsonwebtoken");
const {JWT_SECRET} = process.env;

const signUp = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (user) {
        throw HttpError(409, `${email} already in use`)
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await  User.create({...req.body, password: hashPassword});

    res.status(201).json({
        username: newUser.username,
        email: newUser.email,
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

module.exports = {
    signUp: ctrlWrapper(signUp),
    signIn: ctrlWrapper(signIn),
    getCurrent: ctrlWrapper(getCurrent),
    signOut: ctrlWrapper(signOut),
    updateSubscription: ctrlWrapper(updateSubscription)
}