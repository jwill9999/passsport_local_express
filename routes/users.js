var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var User = require('../models/usersDB');

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res, next){
	req.flash({message:'You are logged in'});
	res.render('profile',{message:'You are logged in'});
});


function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg','You are not logged in');
		res.redirect('/login');
	}
}

module.exports = router;
