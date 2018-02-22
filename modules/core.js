/**
 *  SEARLE CORE ENGINE
 *
 *  Recieves requests from the Webhook server and orchestrates data retreival,
 *  processing and filtering.
 */

// TODO: UTIL FUNCTIONS e.g. responding to unknown requests; help commands,


// DEPENDENCIES
const stockLookup = require('./functions/stockLookup');
const transform = require('./resolve/languageTransformer');

// Mapping of intent names into discrete functions which delegate task of fulfilling
// requets. If some intent is not mapped, a default 'helper' message will be relayed
// to the user. TODO: Implement full error handling method.
const actionMap = {

  'stockLookup': (params) => {
    // Return stockLookup as a promise.
    return stockLookup(params);
  },
  'newsLookup': null

};

// Module entry point.
module.exports = function Core() {

  log(`Initiated.`);


  /**
   * REFERENCE
   *  intent: 'stockLookup', 'newsLookup'.
   *  params: {
   *   timePeriod: '',
   *   stockLookupType: 'price',
   *   entityName: '3i group',
   *
   *   }
   */

  this.fulfill = function(intent, params, callback){

    // Just fulfill raw for now.
    this.fulfillRaw(intent, params, (rawResponse) => {

      // NOTE: NEED TO CONSIDER WHERE RICH TEXT PAYLOADS WILL FALL UNDER.

      // TODO: Enrichment flow will take place here.
      // this.enrichRequest(<rawResponse>)

      // Prepare response into human-readable string for output.
      this.prepareResponse(rawResponse, {intent: intent, params: params}, (readyResponse) => {
        return callback(readyResponse);
      });
    });

  };

  // Basic fulfilment of request. This does not include any enrichment or
  // human-readable transforming.
  this.fulfillRaw = function(intent, params, callback){

    // Check that intent is valid.
    if (!actionMap[intent])
      // Here a follow up intent should be made to the help command.
      return callback({error: "Sorry! I didn't understand that. Type 'help' or 'what can you do' for info on what I can help you with!"})

    // Forward result of intent map to fulfillment callback.s
    return actionMap[intent](params).then(result => {
      return callback(result);
    })
    // Catch any errors.
    .catch(err => {
      return callback(err);
    });

  };

  // Takes a raw fulfilled request (just values, and details of original intenet /
  // request) and transforms it to be human-readable. [COMMON TRANSLATION LAYER]
  //  E.g.
  //  { result: 3 , entity: "Barclays PLT" } --> "Barclays has a value of 3.".
  this.prepareResponse = function(rawResponse, callback){

    // It may be desirable to have different 'components' of an outgoing response.
    // E.g., we may have the 'elementary' request as one component, some comment on
    // the significance of the request as another component, perhaps a suggestion as another component,
    // and so on. This may require that we split up the rawResponse object into
    // an array which contains discrete request 'components' that can each be
    // transformed with string templates into human-readable responses depending
    // on their properties.

    var outputString = "";

    // Make each result component human-readable.
    rawResponse.results.forEach(result => {
      outputString += transform(result);
    });

    // Add rich-text payload (Extension).



    // Relay response into callback for now.
    return callback({text: rawResponse});

  };

}

function log(msg){
  console.log(`[CORE] | ${msg}`);
}
