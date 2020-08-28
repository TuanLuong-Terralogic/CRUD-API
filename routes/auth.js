const express = require('express');
const {check} = require('express-validator');

const Auth = require('../controllers/auth');
const Password = require('../controllers/password');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({msg: 'You are in the Auth Endpoint. Register or Login to test Authentication'});
});

router.post('/register', [
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('password').not().isEmpty().isLength({min: 8}).withMessage('Must be at least 8 characters long'),
    check('firstName').not().isEmpty().withMessage('Your firsr name is required'),
    check('lastName').not().isEmpty().withMessage('Your last name is required')
], validate, Auth.register);

router.post('/login', [
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('password').not().isEmpty()
], validate, Auth.login);


// Email Verification
router.get('/verify/:token', Auth.verify);
router.post('/resend', Auth.resendToken);

// Password Reset
router.post('/recover', [
    check('email').isEmail().withMessage('Enter a valid email address'),
], validate, Password.recover);

router.get('/reset/:token', Password.reset);

router.post('/reset/:token', [
    check('password').not().isEmpty().isLength({min: 8}).withMessage('Must be at least 8 characters long'),
    check('confirmPassword', 'Password does not match').custom((value, {req}) => (value === req.body.password))
], validate, Password.resetPassword);

module.exports = router;