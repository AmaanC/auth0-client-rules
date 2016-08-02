
/* We're going to be testing ruleCategorizer.categorizeClientRules with
 * the following fake client and rule arrays and make sure it categorizes
 * them as we'd expect it to.
 */
const clients = [
    {
	'name': 'Enterprise Special',
	'client_id': 'foobar'
    },
    {
	'name': 'User app',
	'client_id': 'batman'
    },
    {
	'name': 'Watchamacallit',
	'client_id': 'hunter123'
    },
    {
	'name': 'All Application',
	'client_id': 'notrelevant',
	'global': 'true'
    }
];

/* An array of made up Rule objects. The `script` is a made up test scenario
 * and the `applicable` array under it indicates what we expect to see
 * for that rule, i.e. which clients we'd expect to "apply" to this script.
 */
const rules = [
    {
	'id': 'rul_1',
	'script': `
function(user, context, callback) {
    if (context.clientName === 'Watchamacallit' || context.clientID === 'batman') {
	console.log('Look at me, mom!');
	console.log('special!');
    }
    return callback(null, user, context);
}`,
	'applicable': [ { clientName: 'User app', clientID: 'batman' },
			{ clientName: 'Watchamacallit', clientID: 'hunter123' } ],
	'name': 'Whitelist for a Specific App',
    },
    {
	'id': 'rul_2',
	'script': `
function(usr, ctx, cb) {
    if (ctx.clientName === 'Watchamacallit' || ctx.clientID === 'batman') {
	console.log('Look at me, mom!');
	console.log('special!');
    }
    return cb(null, usr, ctx);
}`,
	'applicable': [ { clientName: 'User app', clientID: 'batman' },
			{ clientName: 'Watchamacallit', clientID: 'hunter123' } ],
	'name': 'Whtielist for a specific App with different param names',
    },
    {
	'id': 'rul_3',
	'script': `
function(usr, ctx, cb) {
    var allowed = ['Enterprise App', 'User app'];
    if (allowed.indexOf(ctx.clientName) > -1) {
	console.log('special!');
    }
    return cb(null, usr, ctx);
}`,
	'applicable': [ { clientName: 'User app', clientID: 'batman' } ],
	'name': 'Allow Access during weekdays for a specific App'
    },
    {
	'id': 'rul_4',
	'script': `
function(usr, ctx, cb) {
    var disallowed = ['Watchamacallit', 'User app'];
    if (disallowed.indexOf(ctx.clientName) > -1) {
	return cb(null, usr, ctx);
    }
    console.log('special!');
    return cb(null, usr, ctx);
}`,
	'applicable': [ { clientName: 'Enterprise Special', clientID: 'foobar' } ],
	'name': 'Allow Access during weekdays for a specific App'
    },
    {
	'id': 'rul_5',
	'script': `
function(usr, ctx, cb) {
    sendEmail();
    refreshToken();
    singSong('never gonna give you up! never gonna let you down!');
}`,
	'applicable': [
	    {
		"clientID": "foobar",
		"clientName": "Enterprise Special"
	    },
	    {
		"clientID": "batman",
		"clientName": "User app"
	    },
	    {
		"clientID": "hunter123",
		"clientName": "Watchamacallit"
	    }
	],
	'name': 'Rickroll People with a global rule'
    },
    {
	'id': 'rul_6',
	'script': `
function(usr, ctx, cb) {
    if (ctx['clientName'] === 'Watchamacallit') {
	console.log('This would be special. But we are only considering');
	console.log('simple use cases, and intentionally fail this.');
	console.log('Adding this case _would_ be simple, but it would create');
	console.log('an illusion of the app handling more than just the');
	console.log('simple typical use-cases.');
    }
    return cb(null, usr, ctx);
}`,
	'applicable': [
	    {
		"clientID": "foobar",
		"clientName": "Enterprise Special"
	    },
	    {
		"clientID": "batman",
		"clientName": "User app"
	    },
	    {
		"clientID": "hunter123",
		"clientName": "Watchamacallit"
	    }
	],
	'name': 'Target an app using a StringLiteral'
    },
    {
	'id': 'rul_7',
	'script': '(usr, ctx, cb) => (cb(null, usr, ctx))',
	// This rule does _nothing_ special, so it doesn't apply to any
	// clients. However, the reason it isn't applicable to any is because
	// it is not a simple use case and is therefore never really parsed.
	'applicable': [],
	'name': 'Arrow function callback'
    },
    {
	'id': 'rul_8',
	'script': '(usr, ctx, cb) => { console.log("Ooh"); return cb(null, usr, ctx) }',
	// This rule does something special, but it is _not_ a simple use
	// case, since it uses fat-arrow functions.
	'applicable': [],
	'name': 'Arrow function callback'
    },
    {
	'id': 'rul_9',
	'script': `
function(user, context, callback) {
    var someBoolean = true;
    if (someBoolean && context.clientName === 'Watchamacallit') {
	console.log('Special!');
    }
    else if (!someBoolean && context.clientName === 'User app') {
	console.log('Also special!');
    }
    return callback(null, user, context);
}
`,
	'applicable': [
	    {
		"clientID": "hunter123",
		"clientName": "Watchamacallit"
	    }
	],
	'name': 'Applicable client depends on variable'
    },
    {
	'id': 'rul_10',
	'script': `
function(user, context, callback) {
    var someBoolean = false;
    if (someBoolean && context.clientName === 'Watchamacallit') {
	console.log('Special!');
    }
    else if (!someBoolean && context.clientName === 'User app') {
	console.log('Also special!');
    }
    return callback(null, user, context);
}
`,
	'applicable': [
	    {
		"clientID": "batman",
		"clientName": "User app"
	    }
	],
	'name': 'Arrow function callback'
    }
];

module.exports = { clients, rules };
