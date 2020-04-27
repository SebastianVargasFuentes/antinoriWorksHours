//in this lines are defined the objects to muse in this route, and a element named route is defined to navigate routes
const express = require('express');
const router = express.Router();

//in this case, the page is located in root ' / ', send a response with a message ' hello world '
router.get('/',(req,res) => {
    res.render('index');
});

//this element is the export of the router object
module.exports = router;