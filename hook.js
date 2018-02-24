/**
 * Experimental WEBHOOK test for DialogFlow, deployed on Heroku.
 *
 *  Webhooks are HTTP 'callbacks' that get called on specific events.
 *  When DialogFlow resolves an intent, it can 'figure out' what to respond by
 *  calling the Webhook and relaying the response to DialogFlow so that it can
 *  respond to the user.
 *
 */


// DEPENDENCIES
const express = require('express');
const bodyParser = require('body-parser');
const Core = require('./modules/core');

// Instantiate express instance.
const app = express();

// Instantiate instance of the core.
const core = new Core();

// Parsing for our webhook.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

/**
 * TODO: Handle the following error codes:
 * The service should be able to handle the following errors:

    400 Bad Request – The request was invalid or cannot be served.
    401 Unauthorized – The request requires user authentication.
    403 Forbidden – The server understood the request but refuses to take any further action or the access is not allowed.
    404 Not found – There is no resource behind the URI.
    500 Server fault – Internal Server Error.
    503 Service Unavailable – Internal Server Error.

 */


// Register a route.
app.post('/api/v1/', (req, res, err) => {

  var params = req.body.result.parameters;
  var action = req.body.result.action;
  var actionName = req.body.result.metadata.intentName;

  // Delegate request to be fulfilled.
  fulfill(action, params, (result) => {

    // Set appropriate headers.
    res.set('Content-Type', 'application/json');

    // Respond with fulfilled intent.
    res.json(result);

  });

  // Set appropriate headers.
  //
  // var responseText = `Hi! You want me to perform a ${actionName} on ${params.company_name}, correct?`;
  //
  // res.json({
  //   "speech": responseText,
  //    "displayText": responseText,
  //    "data": {},
  //    "contextOut": [],
  //    "source": "none"
  // });

});


// Delegate method for recieving intents and resolving them to discrete functions
// that will be executed.
const fulfill = (intent, params, callback) => {

  core.fulfill(intent, params, (result) => {

    // Attach speech & display text.
    callback({
      speech: (!result.error ? result.text : result.error),
      displayText: (!result.error ? result.text : result.error),
      data: {},
      contextOut: [],
      source: "Webhook"
    });

  });

}

// Start listening for requests.
app.listen(process.env.PORT || 3001);
console.log(`[SEARLE | WEBHOOK] Listening on ${process.env.port || 3001}`);
