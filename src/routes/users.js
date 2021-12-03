const express = require('express');
const router = express.Router();

const pool = require('../database');

router.post('/upload', (req,res) => {
    console.log(req.file);
});

module.exports = router;