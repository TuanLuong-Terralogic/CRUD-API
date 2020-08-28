const User = require('../models/user');
const {uploader, sendEmail} = require('../utils/index');
const user = require('../models/user');

// @route GET admin/user
// @desc Returns all users
// @access Public 
exports.index = async (req, res) => {
    const user = await User.find({});
    res.status(200).json({user});
};


// @route POST api/user
// @desc Add a new user 
// @access Public
exports.store = async (req, res) => {
    try {
        const {email} = req.body;

        const user = await User.findOne({email});

        if(user) return res.status(401).json({ msg: 'The email you have entered is already associated with another account. You can change this users role instead'});

        const password = '_' + Math.radndom().toString(36).substr(2, 9);
        const newUser = new User({...req.body, password});

        const user_ = await newUser.save();

        user_.generatePasswordReset();

        await user_.save();

        let domain = 'http://' + req.headers.host;
        let subject = 'New Account Created';
        let to = user.email;
        let from = process.env.FROM_EMAIL;
        let link = 'http://' + req.headers.host + '/api/auth/reset' + user.resetPasswordToken;
        let html = `<p>Hi ${user.username}</p><br/><p>A new account has been create for you on ${domain}. Please click on this following <a href='${link}'>link</a> to set your password and login</p>
        <br/><p>If you did not request this, please ignore this email</p>`;

        await sendEmail({to, from, subject, html});

        res.status(200).json({msg: 'An email has been sent to ' + user.email + '.'});
    } catch (error) {
        res.status(500).json({success: false, msg: error.message});
    }
};

// @route GET api/user/{id}
// @desc Returns a specific user 
// @access Public
exports.show = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.find(id);

        if(!user) return res.status(401).json({msg: 'User does not exist'});

        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
};


// @route PUT api/user/{id}
// @desc Update user details
// @access Public
exports.update = async (req, res) => {
    try {
        const update = req.body;
        const id = req.params.id;
        const userId = req.user._id;

        if(userId.toString() !== id.toString()) return res.status(401).json({msg: 'Sorry, you do not have permission to update this data'});

        const user = await User.findByIdAndUpdate(id, {$set: update}, {new: true});

        if(!req.file) return res.status(200).json({user, msg: 'User has been updated'});

        const result = await uploader(req);
        const user_ = await User.findByIdAndUpdate(id, {$set: update}, {$set: {profileImage: result.url}}, {new: true});

        if(!req.file) return res.status(200).json({user: user_, msg: 'User has been updated'});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
};

// @route DESTROY api/user/{id}
// @desc Delete user 
// @access Public
exports.destroy = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user._id;

        if(userId.toString() !== id.toString()) return res.status(401).json({msg: 'Sorry, you do not have permission to delete this data'});

        await User.findByIdAndDelete(id);
        res.status(200).json({msg: 'User has been deleted'});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
};