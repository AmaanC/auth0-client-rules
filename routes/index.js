var express = require('express');
var passport = require('passport');
var ruleCategorizer = require('../util/ruleCategorizer');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();

var env = {
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
};

router.get('/', ensureLoggedIn, function(req, res, next) {
    
    ruleCategorizer.getClientsAndRules()
	      .then(function([clients, rules]) {
	          return ruleCategorizer.categorizeClientRules(clients, rules);
	      })
	      .then(function(categorizedObj) {
	          res.render('index', {
		            title: 'Auth0 Client Rules',
		            categorizedObj: categorizedObj
	          });
	      })
	      .catch(function(err) {
	          res.json(err);
	      });
});

router.get('/login',
	         function(req, res){
	             res.render('login', { env: env });
	         });

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

router.get('/callback',
	         passport.authenticate('auth0', { failureRedirect: '/error' }),
	         function(req, res) {
	             res.redirect(req.session.returnTo || '/user');
	         });

router.get('/error', function(req, res) {
    res.render('error', {
	message: 'Login error. Your email may need to be whitelisted.',
	error: {
	    status: '',
	    stack: ''
	}
    });
});

module.exports = router;
