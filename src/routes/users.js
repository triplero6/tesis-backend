const express = require('express');
const router = express.Router();

const pool = require('../database');

router.post('/upload', (req,res) => {
    console.log(req.user.id);
});

module.exports = router;