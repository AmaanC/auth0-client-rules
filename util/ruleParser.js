const ManagementClient = require('auth0').ManagementClient;
const Promise = require('bluebird');
const Sandbox = require('sandbox');
const babel = require('babel-core');

const AUTH0_APIV2_TOKEN = process.env.AUTH0_APIV2_TOKEN;
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const ruleParser = {};

const management = new ManagementClient({
    token: AUTH0_APIV2_TOKEN,
    domain: AUTH0_DOMAIN
});

/* Simply uses the Auth0 Management APIv2 to fetch all clients and rules
 * Returns a Promise
 */
ruleParser.getClientsAndRules = function() {
    return Promise.all([management.getClients(), management.getRules()]);
};

/* Takes the API's responses for clients and rules as input and tries to
 * figure out which rules apply to which clients.
 * On a high level, this is done by using Babel to transform the Rule
 * code to a function that strips everything that isn't needed and
 * that can be actually executed with different spoofed `context`
 * objects in order to detect which clients it applies to.
 * The modified test code is run in a sandbox and the result is
 * stored and categorized into an array that looks like the following:
 * [
 *     {
 *         clientName: 'Foo',
 *         clientID: 'xyzasdnmxk',
 *         rules: [{name: 'Whitelist for..', id: 'foobar123'}, ...]
 *     },
 *     ...
 * ]
 */
ruleParser.categorizeClientRules = function(clients, rules) {
    const s = new Sandbox();
    // Build fake context objects that contain valid clientName's and
    // clientID's for the modified Rule script to use
    const fakeContexts = clients.map(function(client) {
	return {
	    clientName: client.name,
	    clientID: client.client_id
	};
    });
    
    for (let curRule of rules) {
	// Transform the code to something that will return `true` if
	// any "special code" was executed for the client we passed
	// and `false` otherwise
	let newRuleCode = babel.transform('(' + curRule.script + ')', {
	    plugins: ['../babel-rule/src/index.js']
	}).code;
	
	let testCode = `
	 (function() {
	     let applicableClients = [];
	     let rule = ${newRuleCode}
	     let fakeContexts = ${JSON.stringify(fakeContexts)};
	     fakeContexts.forEach(function(context) {
		 if (rule({}, context, function() {})) {
		     applicableClients.push(context);
		 }
	     });
	     return applicableClients;
	 })();
	`;

	s.run(testCode, function(output) {
	    console.log(output);
	});
    }
};

module.exports = ruleParser;


ruleParser.getClientsAndRules()
    .then(function([clients, rules]) {
	ruleParser.categorizeClientRules(clients, rules);
    })
    .then(function(categorizedArray) {
	console.log(categorizedArray);
    });
