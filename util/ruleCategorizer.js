const ManagementClient = require('auth0').ManagementClient;
const Promise = require('bluebird');
const Sandbox = require('sandbox');
const babel = require('babel-core');

const AUTH0_APIV2_TOKEN = process.env.AUTH0_APIV2_TOKEN;
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const ruleCategorizer = {};

const management = new ManagementClient({
    token: AUTH0_APIV2_TOKEN,
    domain: AUTH0_DOMAIN
});

/* Simply uses the Auth0 Management APIv2 to fetch all clients and rules
 * Returns a Promise
 */
ruleCategorizer.getClientsAndRules = function() {
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
 *         ruleName: 'Whitelist for..',
 *         ruleID: 'foobar123',
 *         clients: [{clientName: 'Foo', clientID: 'xyzasdnmxk'}, ...]
 *     },
 *     ...
 * ]
 */
ruleCategorizer.categorizeClientRules = function(clients, rules) {
    let categorizedArray = [];
    let remainingPromises = [];
    // Build fake context objects that contain valid clientName's and
    // clientID's for the modified Rule script to use
    const fakeContexts = clients.map(function(client) {
	return {
	    clientName: client.name,
	    clientID: client.client_id
	};
    });
    
    for (let curRule of rules) {
	let s = new Sandbox();

	// Transform the code to something that will return `true` if
	// any "special code" was executed for the client we passed
	// and `false` otherwise
	let newRuleCode = babel.transform('(' + curRule.script + ')', {
	    plugins: ['transform-auth0-rule']
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
	     postMessage(applicableClients);
	     return true;
	 })();
	`;

	let categorizedRuleObj = {
	    ruleName: curRule.name,
	    ruleID: curRule.id,
	    clients: undefined
	};
	remainingPromises.push(
	    new Promise(function(resolve, reject) {
		// First we'll attach a message handler for the sandboxed
		// code to be able to send us the list of clients, and then
		// we'll run it
		s.on('message', function(message) {
		    console.log('Message', message);
		    categorizedRuleObj.clients = message;
		    categorizedArray.push(categorizedRuleObj);
		    resolve();
		});
		
		s.run(testCode, function(output) {
		    // If something went wrong, we'll leave the rule as
		    // uncategorized. This will only happen if the transformed
		    // Rule tried to run code it couldn't. (For example, code
		    // from a require'd module or anything of that sort.)
		    if (output.result !== 'true') {
			categorizedRuleObj.clients = [];
			resolve();
		    }
		});
	    })
	);
    }
    return Promise.all(remainingPromises).then(function() {
	return categorizedArray;
    });
};

module.exports = ruleCategorizer;
