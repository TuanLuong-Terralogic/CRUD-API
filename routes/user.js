const express = require('express');
const {check} = require('express-validator');
const multer = require('multer');

const User = require('../controllers/user');
const validate = require('../middleware/validate');

const router = express.Router();

const upload = multer().single('profileImage');

// INDEX
router.get('/', User.index);

// STORE
router.post('/', [
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('username').not().isEmpty().withMessage('Your username is required'),
    check('firstName').not().isEmpty().withMessage('Your first name is required'),
    check('lastName').not().isEmpty().withMessage('Your last name id required')
], validate, User.store);

// SHOW
router.get('/:id', User.show);

// UPDATE
router.put('/:id', upload, User.update);

// DELETE
router.delete('/:id', User.destroy);

module.exports = router;