# auth0-client-rules
A Node.js app which uses Auth0's [Management APIv2](https://auth0.com/docs/api/management/v2) to list all clients / apps and which [rules](https://auth0.com/docs/rules) apply to them.

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

# How it works

On a high-level, the way this works is as follows:
- It makes requests to the Management API to get all clients and all rules for a certain user.
- It uses a [Babel plugin](https://github.com/AmaanC/babel-plugin-transform-auth0-rule) to transform the Rule's function into a function that, when executed, will return `true` if any special code was run for the specific client being tested
- The transformed function is evaluated with spoofed values for `context.clientName` and `context.clientID` filled from the Auth0 API's response.
- All the results are aggregated and categorized, and shown to the user.
- ???
- Profit!