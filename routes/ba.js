const express = require("express");
const router = express.Router();

router.get('/ba', (req, res) => {
    res.render('ba');
})

module.exports = router;
