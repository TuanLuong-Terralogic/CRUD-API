const User = require('../models/user');
const { sendEmail } = require('../utils/index');

// @route POST api/auth/recover
// @desc Recover Password - Generates token and Send password reset email
// @access Public
exports.recover = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ msg: 'Email exist' });

        user.generatePasswordReset();

        await user.save();

        let subject = 'Password change request';
        let to = user.email;
        let from = process.env.FROM_EMAIL;
        let link = 'http://' + req.headers.host + '/api/auth/reset/' + user.resetPasswordToken;
        let html = `<p>Hi ${user.username}</p><br/>
        <p>Please click on this following <a href=${link}>link</a> to reset your password.</p>
        <br />
        <p>If you did not request this, please ignore this email and your password will remain unchanged</p>`;

        await sendEmail({ to, from, subject, html });

        res.status(200).json({ msg: 'A reset email has been sent to ' + user.email + '.' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// @route POST api/auth/reset
// @desc Reset Password - Validate password reset token  and shows the password reset view
// @access Public
exports.reset = async (req, res) => {
    try {
        const {token} = req.params;

        const user = await User.findOne({resetPasswordToken: token, resetPasswordExpires: {$gt: Date.now()}});

        res.render('reset', {user});
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


// @route POST api/auth/reset
// @desc Reset password
// @access Public
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({resetPasswordToken: token, resetPasswordExpires: {$gt: Date.now()}});

        if(!user) return res.status(401).json({ msg: 'Password reset token is invalid or has expired'});

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.isVerified = true;

        await user.save();

        let subject = 'Your password has been changed';
        let to = user.email;
        let from = process.env.FROM_EMAIL;
        let html = `<p>Hi ${user.username}</p><br/>
                    <p>This is a confirmation that the password for your account ${user.email} has just been changed successfully.</p>`;
        
        await sendEmail({to, from, subject, html});

        res.status(200).json({ msg: 'Your password has been changed' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};