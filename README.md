# auth0-client-rules

A Node.js app which uses Auth0's [Management
APIv2](https://auth0.com/docs/api/management/v2) to list all clients /
apps and which [rules](https://auth0.com/docs/rules) apply to them.

# Things to know

This section lists assumptions being made by the project and certain
points about the functioning of the app.

The project tries to categorize Rules to see which Clients they apply
to. However, this will only work for simple use-cases, i.e. the Rule
needs to be a `FunctionDeclaration` of the following form:

    function(userParam, ctxParam, callbackParam) {
        // Your code here
    }

As seen, the parameters names _can_ change (from the default `user,
context, callback`). However, you **cannot** use, for example, a fat-arrow
function expression.

Furthermore, Rules will only be detected as applying to certain
clients correctly for simple use-cases such as:

    function(user, context, callback) {
        // Some setup code here, such as:
        var allowedClients = ['My App', 'Other App'];
        if (allowedClients.indexOf(context.clientName) > -1) {
            // My specific code here
        }
        return callback(null, user, context);
    }

Or

    function(user, context, callback) {
        // Some setup code here, such as:
        var disallowedClients = ['Bad App'];
        if (disallowedClients.indexOf(context.clientName) > -1) {
            return callback(null, user, context);
        }
        // Code for all clients other than 'Bad App'
        // Note that in this case, our categorizer would determine that
        // the rule applies for all clients _but_ 'Bad App'
    }

Note that to determine which clients apply, the code _actually
evaluates_ "dependencies".
For example, the following will only return `"My App"` as a client
that this Rule applies to:

    function(user, context, callback) {
        // This setup code is _actually_ evaluated in a sandbox
        var someBoolean = false;
        if (someBoolean && context.clientName === 'Some App') {
            console.log('Special!');
        }
        else if (!someBoolean && context.clientName === 'My App') {
            console.log('Also special!');
        }
        return callback(null, user, context);
    }

Anything apart from these simple use cases is not guaranteed to
work. More possible Rule cases are listed in `/util/test/setup.js`
under the `rules[X].script` property.

Also note that Rules which are deemed to not "apply" to any clients
are simply excluded entirely from the UI seen.

Disabled Rules are shown in gray.

# Setup
- Make sure you're running Node v6.3.0 (`node -v`)
 - If not, you can use [`nvm`](https://github.com/creationix/nvm/blob/master/README.markdown) to install it.
- Clone this repository using `git clone https://github.com/AmaanC/auth0-client-rules`
- `cd` into the directory (`cd auth0-client-rules`)
- Install dependencies with `npm install`
- [Create an Auth0 application for this project here](https://manage.auth0.com/#/applications)
 - Name it whatever you'd like
 - Select "Regular Web Application"
 - Browse to the `Settings` tab for the application (on the Auth0 Dashboard)
- Open the `.env` file in any text editor and fill in the values, copying them from the `Settings` tab
 - **Note:** The callback URL you enter here will also need to be updated in the `Settings` tab under **Allowed Callback URLs**
 - For the `AUTH0_APIV2_TOKEN` field, [visit the APIv2 Explorer](https://auth0.com/docs/api/management/v2) to generate your tokens. Make sure you're logged in, and then, in the dropdown, select:
    - `clients`, `read`, and click the arrow
    - `rules`, `read`, and click the arrow
    - Copy and paste the token value ([as seen in this screenshot](http://i.imgur.com/qg01LPO.png)) into the `.env` file
 - [Create a new Rule](https://manage.auth0.com/#/rules/new) for this application to "Whitelist for a Specific App" (and remember to modify the `context.clientName` check to the name you selected for this app, and remember to update the array of whitelisted user emails in the `whitelist` variable.
- Back on the command line, run `npm start` to start the app. You may want to set an environment variable `PORT` to determine what port the app is hosted on. By default, it will run on [localhost:3000](http://localhost:3000).
 - **Note:** If you do this, you will have to update the new callback URL in both, the settings tab, under **Allowed Callback URLs** and in the `.env` file

# How it works

On a high-level, the way this works is as follows:
- It makes requests to the Management API to get all clients and all rules for a certain user.
- It uses a [Babel plugin](https://github.com/AmaanC/babel-plugin-transform-auth0-rule) to transform the Rule's function into a function that, when executed, will return `true` if any special code was run for the specific client being tested
- The transformed function is evaluated with spoofed values for `context.clientName` and `context.clientID` filled from the Auth0 API's response.
- All the results are aggregated and categorized, and shown to the user.
- ???
- Profit!

# Screenshot

![Screenshot of the app](http://i.imgur.com/3DlPexN.png)