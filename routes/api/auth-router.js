const express = require('express');
const {validateBody} = require("../../decorators");
const {userSignUpSchema, userSignInSchema} = require("../../models/User");
const {isEmptyBody, authenticate, upload} = require("../../middlewares");
const authController = require('../../controllers/authController');


const userSignUpValidate = validateBody(userSignUpSchema);
const userSignInValidate = validateBody(userSignInSchema);
const authRouter = express.Router();

authRouter.post('/signup', isEmptyBody, userSignUpValidate, authController.signUp);
authRouter.post('/signin', isEmptyBody, userSignInValidate, authController.signIn);
authRouter.get('/current', authenticate, authController.getCurrent);
authRouter.post('/signout', authenticate, authController.signOut );
authRouter.patch('/current', authenticate, authController.updateSubscription);
authRouter.patch('/avatars', authenticate, upload.single('avatar'), authController.updateAvatar);

module.exports = authRouter;