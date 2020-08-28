const User = require('../models/user');
const Token = require('../models/token');
const { sendEmail } = require('../utils/index');
const { image } = require('../config/cloudinay');

// @route POST api/auth/register
// @desc Register user
// @access Public
exports.register = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (user) return res.status(401).json({ msg: 'Email exist' });

        const newUser = new User({ ...req.body, role: "basic" });

        const user_ = await newUser.save();

        await sendVerificationEmail(user_, req, res);
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};


// @route POST /api/auth/login
// @desc Login user
// @access Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ msg: 'Email is not exist' });

        if (!user.comparePassword(password)) return res.status(401).json({ msg: 'Invalid email or password' });

        if (!user.isVerified) return res.status(401).json({ type: 'not-verified', msg: 'Your account is not verified' });

        res.status(200).json({ token: user.generateJwt(), user: user });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


// @route GET/api/verify/:token
// @desc Verify token
// @access Public
exports.verify = async (req, res) => {
  if(req.params.token) return res.status(400).json({ msg: 'We were unable to find a user for this token'});
  
  try {
      const token = await Token.findOne({ token: req.params.token });

      if(!token) return res.status(400).json({ msg: 'We were unable to find a user for this token'});

      User.findOne({ _id: token.userId }, (err, user) => {
          if(!user) return res.status(400).json({ msg: 'This user has already been verified' });

          if(user.isVerified) return res.status(400).json({ msg: 'This user has already been verified'});

          user.isVerified = true;
          user.save(err => {
              if(err) return res.status(500).json({msg: err.message});

              res.status(200).send('This account has been verified. Please log in');
          });
      });
  } catch (error) {
      res.status(500).json({ msg: error.message });
  }
};


// @route POST api/resend
// @desv Resend Verification Token 
// @access Public
exports.resendToken = async (req, res) => {
    try {
        const {email} = req.body;

        const user = await User.findOne(email);

        if(!user) return res.status(401).json({ msg: 'Email exist'});

        if(user.isVerified) return res.status(400).json({ msg: 'This account has been verified. Please log in'});

        await sendVerificationEmail(user, req, res);
    } catch (error) {
        res.status(500).json({ msg: err.message });
    }
};


const sendVerificationEmail = async (user, req, res) => {
    try {
        const token = user.generateVerificationToken();

        await token.save();

        let subject = 'Account Verification Token';
        let to = user.email;
        let from = process.env.FROM_EMAIL;
        let link = "http://" + req.headers.host + "/api/auth/verify/" + token.token;
        let html = `<p>Hi ${user.username}</p><br/><p>Please click on the following <a href="${link}>link</a> to verify your account</p>
        <br/><p>If you did not request this, please ignore this email.</p>`;

        await sendEmail({to, from, subject, html});

        res.status(200).json({ msg: 'A verification email has been sent to ' + user.email + '.'});
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};