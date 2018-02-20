/**
 *  SEARLE CORE ENGINE
 *
 *  Recieves requests from the Webhook server and orchestrates data retreival,
 *  processing and filtering.
 */

// TODO: UTIL FUNCTIONS e.g. responding to unknown requests; help commands,
// explaining what each command can do, etc.

// DEPENDENCIES
const stockLookup = require('./functions/stockLookup');

// Mapping of intent names into discrete functions which delegate task of fulfilling
// requets. If some intent is not mapped, a default 'helper' message will be relayed
// to the user. TODO: Implement full error handling method.
const actionMap = {

  'stockLookup': (params, callback) => stockLookup(params, callback),
  'newsLookup': null,
  'volumeLookup': null

};

// Module entry point.
module.exports = function Core() {

  log(`Initiated.`);


  this.fulfill = function(intent, params, callback){

    // Just fulfill raw for now.
    this.fulfillRaw(intent, params, (rawResponse) => {

      // NOTE: NEED TO CONSIDER WHERE RICH TEXT PAYLOADS WILL FALL UNDER.

      // Prepare response into human-readable string for output.
      this.prepareResponse(rawResponse, (readyResponse) => {
        return callback(readyResponse);
      });
    });

  };

  // Fulfill (raw) request (no human-readable transforming).
  this.fulfillRaw = function(intent, params, callback){

    // Check that intent is valid.
    if (!actionMap[intent])
      return callback({error: "Sorry! I didn't understand that. Type 'help' or 'what can you do' for info on what I can help you with!"})

    // Forward result of intent map to fulfillment callback.s
    return actionMap[intent](params, callback);

  };

  // Prepares response for human-readable output.
  this.prepareResponse = function(rawResponse){



  };

}

function log(msg){
  console.log(`[CORE] | ${msg}`);
}
