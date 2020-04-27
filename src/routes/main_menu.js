//in this lines are defined the objects to muse in this route, and a element named route is defined to navigate routes
const express = require('express');
const router = express.Router();

const { isLoggedIn } = require('../lib/auth');

router.get('/main', isLoggedIn, (req,res) => {
    res.render('main_menu/menu');
});

//this element is the export of the router object
module.exports = router;