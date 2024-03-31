const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { promisify } = require('util');

const signToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    const token = signToken(newUser._id);

    res.status(200).json({
        status: 'Success',
        token,
        data: {
            newUser,
        },
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password'));
    }

    const user = await User.findOne({ email: email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password!', 400));
    }

    const token = signToken(user._id);

    res.status(200).json({
        status: 'Success',
        token,
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    // get the token
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else {
        return next(
            new AppError(
                'You are not logged in. Please login to get acccess',
                401
            )
        );
    }

    // verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // get the user using the token data
    const user = await User.findById(decoded.id);

    // verify the user
    if (!user) {
        return next(
            new AppError(
                'The user belongin to the token is no longer exist',
                401
            )
        );
    }

    // check if password has been changed after the token was issued
    if (user.changePasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                'User changed password recently. Please login again.',
                400
            )
        );
    }

    // grant access
    req.user = user;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have permission to perform this action',
                    400
                )
            );
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError('The email is not exist in our system', 401));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    next();
});
