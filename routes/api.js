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

// Important to restrict the API to only logged in users!
router.use(ensureLoggedIn);

router.get('/', function(req, res, next) {
    res.json({ 'error': 'No such API route.' });
});

router.get('/get_categories', function(req, res, next) {
    
    ruleCategorizer.getClientsAndRules()
	.then(function([clients, rules]) {
	    return ruleCategorizer.categorizeClientRules(clients, rules);
	})
	.then(function(categorizedArray) {
	    console.log(categorizedArray);
	    res.json(categorizedArray);
	})
	.catch(function(err) {
	    res.json(err);
	});

});


module.exports = router;
