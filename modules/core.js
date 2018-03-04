/**
 *  SEARLE CORE ENGINE
 *
 *  Recieves requests from the Webhook server and orchestrates data retreival,
 *  processing and filtering.
 */

// TODO: UTIL FUNCTIONS e.g. responding to unknown requests; help commands,


// DEPENDENCIES
const stockLookup = require('./functions/stockLookup');
const rafLookup = require('./functions/rafLookup');
const newsLookup = require('./functions/newsLookup');
const transform = require('./resolve/languageTransformer');

// Mapping of intent names into discrete functions which delegate task of fulfilling
// requets. If some intent is not mapped, a default 'helper' message will be relayed
// to the user. TODO: Implement full error handling method.
const actionMap = {

  'stockLookup': stockLookup,
  'rafLookup': rafLookup,
  'newsLookup': newsLookup

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

    // Prepare the request object which contains the details of the request,
    // relevant meta data, and a results array which will be used for transforming
    // and enrichment.
    var request = new Request(intent, params);

    // Perform a raw request fulfilment.
    this.fulfillRaw(request, (updatedRequest) => {

      // NOTE: NEED TO CONSIDER WHERE RICH TEXT PAYLOADS WILL FALL UNDER.

      // TODO: Enrichment flow will take place here.
      // this.enrichRequest(<rawResponse>)

      // console.log(`------------- RAW RESPONSE --------------`, updatedRequest, `------------- END RESPONSE --------------`);


      // Prepare response into human-readable string for output.
      this.prepareResponse(updatedRequest, (readyResponse) => {
        return callback(readyResponse);
      });
    });

  };

  // Basic fulfilment of request. This does not include any enrichment or
  // human-readable transforming.
  this.fulfillRaw = function(request, callback){

    // Check that intent is valid.
    if (!actionMap[request.intent])
      // Here a follow up intent should be made to the help command.
      return callback(new ErrorReport("Sorry! I didn't understand that. Type 'help' or 'what can you do' for info on what I can help you with!"));

    // Forward result of intent map to fulfillment callback.
    return actionMap[request.intent](request.params).then(results => {

      // Attach the result to the request object. If there are multiple results,
      // then push multiple results to the array.
      if (!Array.isArray(results)) results = [results];

      request.results = request.results.concat(results);

      // Send back the request object with newly attached result(s).
      return callback(request);
    })
    // Catch any errors.
    .catch(err => {
      console.log(`[CORE]| Error fulfilling raw request: `, request, 'Error: ', err);
      return callback(new ErrorReport(`I'm having trouble servicing your request at the moment. Details: ${err}`));
    });

  };

  // Takes a raw fulfilled request (just values, and details of original intenet /
  // request) and transforms it to be human-readable. [COMMON TRANSLATION LAYER]
  //  E.g.
  //  { result: 3 , entity: "Barclays PLT" } --> "Barclays has a value of 3.".
  this.prepareResponse = function(request, callback){

    log(`Preparing response.`);

    // It may be desirable to have different 'components' of an outgoing response.
    // E.g., we may have the 'elementary' request as one component, some comment on
    // the significance of the request as another component, perhaps a suggestion as another component,
    // and so on. This may require that we split up the rawResponse object into
    // an array which contains discrete request 'components' that can each be
    // transformed with string templates into human-readable responses depending
    // on their properties.

    var outputString = "";

    // Make each result component human-readable.
    request.results.forEach(result => {

      // TEMP: Make result into an object if not already.
      if (typeof result !== 'object') result = {value: result};

      // Send request object to transformer as if it only had a single result
      // attached to it.
      var {results, ...singleResRequest} = request;
      singleResRequest.result = result;

      outputString += transform(singleResRequest);

    });

    // Add rich-text payload (Extension).
    //
    console.log('preparedResponse data object ',request.data);


    // Relay response into callback for now.
    return callback({text: outputString, data: (request.data ? request.data : {})});

  };

}

// Conforms error message to expected language transformer structure.
function ErrorReport(reason, internal, type){
  this.results = [
    {
      intent: "error",
      params: {
        reason: "general",
        value: reason
      },
      name: (type ? type : "Error")
    }
  ];
}

// Request object. Contains relevant details on the request as well as metadata,
// and pre-requisites for storing multiple results.
function Request(intent, parameters, results){
  this.intent = intent;
  this.params = parameters;
  this.results = (results && Array.isArray(results) ? results : (results ? [results] : []));
}

function log(msg){
  console.log(`[CORE] | ${msg}`);
}
