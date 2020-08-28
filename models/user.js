const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const Token = require('./token');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: 'Email is required',
        unique: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: false,
        index: true,
        sparse: true
    },
    password: {
        type: String,
        required: 'Your password is required',
        max: 100
    },
    firstName: {
        type: String,
        required: 'First name is required',
        max: 100
    },
    lastName : {
        type: String,
        required: 'Last name is required',
        max: '100'
    },
    bio: {
        type: String,
        required: false,
        max: 255
    },
    profileImage: {
        type: String,
        required: false,
        max: 255
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String,
        required: false
    },
    resetPasswordExpires: {
        type: Date,
        required: false
    }
}, {timestamps: true});

UserSchema.pre('save', (next) => {
    const user = this;

    if(!user.isModified('password')) return next();

    bcrypt.genSalt(10, (err, salt) => {
        if(err) return next(err);

        bcrypt.hash(user.password, salt, (err, hash) => {
            if(err) return next(err);

            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = password => {
    return bcrypt.compareSync(password,this.password);
};

UserSchema.methods.generateJWT = () => {
    const today = new Date();

    const expirationDate = new Date(today);
    expirationDate.setDate(todat.getDate() + 60);

    let payload = {
        id: this._id,
        email: this.email,
        username: this.username,
        firstName: this.firstName,
        lastName: this.lastName
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: parseInt(expirationDate.getTime() / 1000, 10)
    });
};

UserSchema.methods.generatePasswordReset = () => {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000;
};

UserSchema.methods.generateVerificationToken = () => {
    let payload = {
        userId: this._id,
        token: crypto.randomBytes(20).toString('hex')
    };

    return new Token(payload);
};

module.exports = mongoose.model('User', UserSchema);

