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

// Instantiate express instance.
const app = express();

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
app.post('/api/v1/stock_price_lookup', (req, res, err) => {

  console.log(`Recieved: `, req.body);

  // Set appropriate headers.
  res.set('Content-Type', 'application/json');

  res.json({
    "speech": "HI I HAVE PRICING NOW",
     "displayText": "HI I HAVE PRICING NOW",
     "data": {},
     "contextOut": [],
     "source": "none"
  });

});

// Start listening for requests.
app.listen(process.env.PORT || 3001);
console.log(`[SEARLE | WEBHOOK] Listening on ${process.env.port || 3001}`);
