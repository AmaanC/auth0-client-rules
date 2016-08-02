
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
	    'name': 'Allow Access during weekdays for a specific App',
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
	    'name': 'Rickroll test viewer'
	}
    ];

    module.exports = { clients, rules };
