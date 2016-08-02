const assert = require('chai').assert;
const ruleCategorizer = require('../ruleCategorizer');
// Setup contains fixtures for faked clients and rules
const setup = require('./setup');

describe('ruleCategorizer', function() {
    it('should correctly categorize all rules', function() {
	return ruleCategorizer.categorizeClientRules(
	    setup.clients,
	    setup.rules
	)
	    .then(function(realOutput) {
		// Only the first 3 clients are _real_ clients that the user
		// cares about. We want our output to skip the 4th one.
		assert.deepEqual(setup.clients.slice(0, 3), realOutput.clients);
		// The rules should be sent back as they are
		assert.deepEqual(setup.rules, realOutput.rules);
		// The output, after being categorized, should match how the
		// predefined `applicable` clients we set for each rule
		realOutput.categorized.forEach(function(ruleObj) {
		    // Only one rule will have the ID we're looking for,
		    // so we can filter it and use the first one
		    let fixedRuleObj = setup.rules.filter(function(fixedRule) {
			return fixedRule.id === ruleObj.ruleID;
		    })[0];
		    // Make sure that it's been categorized as we expected
		    assert.deepEqual(fixedRuleObj.applicable, ruleObj.clients);
		});
	    });
    });
});
