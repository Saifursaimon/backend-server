const express = require('express');
const router = express.Router();
const { verifyPin } = require('../controllers/pinController');

router.post('/', verifyPin);

module.exports = router;
