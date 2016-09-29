var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var User = require('../models/usersDB');


/////////////// Home Page /////////////////

router.get('/', function(req, res, next) {
	res.render('index', {
		title: 'Passport Local'		
	});
});


//////////////// Signup Page /////////////////

router.get('/signup', function(req, res, next) {
	res.render('signup');
});


/////////////// New User Created //////////////

router.post('/signup', function(req, res, next) {
	//express validation variables
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Express Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if (errors) {
		res.render('signup', {
			errors: errors

		});
		return;
	} else {
		var newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password
		});

		User.createUser(newUser, function(err, user) {
			if (err) throw err;
			console.log(user);
		});
		req.flash('success', '<h2>You are registered and can now login</h2>');

		res.redirect('/login');

	}
});


//////////////// Login Page /////////////////

router.get('/login', function(req, res, next) {
	res.render('login');
});

////////////// check Login details //////////////

router.post('/login',
	passport.authenticate('local', {
		successRedirect: '/profile',
		failureRedirect: '/login',
		failureFlash: true
	}),
	function(req, res, next) {
		req.flash('success', '<h2>You are logged In Successfully</h2>');
		res.redirect('profile');
	});




/////////////// Profile page once logged in only ////////////////

router.get('/profile', ensureAuthenticated, function(req, res, next) {
	res.render('profile', {
		title: 'Welcome to your Profile',
		message: 'This is your profile page'
	});
});

///////////////// logout //////////////////////

router.get('/logout', function(req, res){
	req.logout();

	req.flash('info', '<h2>You are logged out</h2>');

	res.redirect('/login');
});
	


///////////// Authentication ///////////////////////

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('info','<h2>You are not logged in</h2>');
		res.redirect('/login');
	}
}


//////////////// local strategy ///////////////////////

passport.use(new LocalStrategy(
	function(username, password, done) {
		User.getUserByUsername(username, function(err, user) {
			if (err) throw err;
			if (!user) {
				return done(null, false, {
					message: 'Unknown User'
				});
			}

			User.comparePassword(password, user.password, function(err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, {
						message: 'Invalid password'
					});
				}
			});
		});
	}));

//////////////// serialization /////////////////////// 

passport.serializeUser(function(user, done) {
	done(null, user.id);
});


//////////////// deserialization //////////////////////

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

module.exports = router;