const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        unique: true,
        minLength: [5, 'A name must be equal or more than 5 characters'],
        maxLength: ['50', 'A name must be equal or less than 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        trim: true,
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email address'],
    },
    role: {
        type: String,
        enum: ['admin', 'guide-lead', 'guide', 'user'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minLength: [8, 'A password must be at least 8 characters'],
        select: false,
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please provide a confirm password'],
        validate: {
            validator: function (val) {
                return val === this.password;
            },
            message: 'Passwords do not match',
        },
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;

    next();
});

userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if (!this.passwordChangeAt) {
        return false;
    }

    const changedTimeStamp = parseInt(
        this.passwordChangeAt.getTime() / 1000,
        10
    );

    return JWTTimestamp < changedTimeStamp;
};

userSchema.methods.createPasswordResetToken = function (next) {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

	// 10 minutes in milliseconds
	this.passwordResetExpires = Date.now() * 10 * 60 * 1000

	return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
