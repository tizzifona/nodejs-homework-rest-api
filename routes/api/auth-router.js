const express = require('express');
const {validateBody} = require("../../decorators");
const {userSignUpSchema, userSignInSchema, userEmailSchema} = require("../../models/User");
const {isEmptyBody, authenticate, upload} = require("../../middlewares");
const authController = require('../../controllers/authController');


const userSignUpValidate = validateBody(userSignUpSchema);
const userSignInValidate = validateBody(userSignInSchema);
const userEmailValidate = validateBody(userEmailSchema);
const authRouter = express.Router();

authRouter.post('/signup', isEmptyBody, userSignUpValidate, authController.signUp);
authRouter.get('/verify/:verificationToken', authController.verify);
authRouter.post('/verify', isEmptyBody, userEmailValidate, authController.resendVerifyEmail);
authRouter.post('/signin', isEmptyBody, userSignInValidate, authController.signIn);
authRouter.get('/current', authenticate, authController.getCurrent);
authRouter.post('/signout', authenticate, authController.signOut );
authRouter.patch('/current', authenticate, authController.updateSubscription);
authRouter.patch('/avatars', authenticate, upload.single('avatar'), authController.updateAvatar);

module.exports = authRouter;