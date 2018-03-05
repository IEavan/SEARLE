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
const predictIntent = require('./functions/predictIntent');
const postProcessHandler = require('./functions/postProcessHandler');

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
    this.fulfillRaw(request, (fulfilledRawRequest) => {

      // NOTE: NEED TO CONSIDER WHERE RICH TEXT PAYLOADS WILL FALL UNDER.
      if (process.env.DEBUG){
        console.log("Fulfilled Raw Request: ", fulfilledRawRequest);
      }

      // TODO: Enrichment flow will take place here.
      this.enrichRequest(fulfilledRawRequest, (enrichedRequest) => {
          // Prepare response into human-readable string for output.
          this.prepareResponse(enrichedRequest, (readyResponse) => {
            return callback(readyResponse);
          });
      });

      // console.log(`------------- RAW RESPONSE --------------`, updatedRequest, `------------- END RESPONSE --------------`);


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

  // After raw request has been fulfilled, enrich the request by analysing the
  // likelihood of a given result and attaching suggestions that will be
  // displayed on the front end.
  this.enrichRequest = function(fulfilledRawRequest, callback){

    // Obtain suggestions which we will embed into the rich text payload.
    predictIntent().then(predictedIntentObj => {


      // Attach the suggestions to the rich text payload of the fulfilledRawRequest object.
      if (!fulfilledRawRequest.data) fulfilledRawRequest.data = { suggestion: []};
      if (!fulfilledRawRequest.data.suggestion) fulfilledRawRequest.data.suggestion = [];
      fulfilledRawRequest.data.suggestion.push(transform({params: {}, ltID: "suggestion", ...predictedIntentObj.result}));

      // Once we have obtained the suggested intents (from prediction), we need
      // to inspect the response from the fulfilledRawRequest method to see
      // if any of the results have a 'likelihood' of <0.5. If this is the case,
      // we add a note and a suggestion to look up news for that particular entity.
      postProcessHandler(fulfilledRawRequest, postProcessed => {

        // Relay the enriched response with suggestions back for transforming.
        return callback(postProcessed);

      });

    });

  }

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
    request.results.forEach((result, i) => {

      // TEMP: Make result into an object if not already.
      if (typeof result !== 'object') result = {value: result};

      // Send request object to transformer as if it only had a single result
      // attached to it.
      var {results, ...singleResRequest} = request;
      singleResRequest.result = result;

      var spacing = (i !== 0 ? "\n\n" : "");
      outputString += spacing + transform(singleResRequest);

      // Rich text must have a 'type' field that can be used to discriminate
      // between different content types on the front - end. In the case
      // where we have multiple results, they will all be 'merged' into the
      // same payload. Where results have the same 'type' field, then the
      // results inside that field will be merged.

      // Suggestions may be supported at this level too.
      if (result.richText) request = attachRichText(request, result.richText);

    });

    // Add rich-text payload (Extension).
    //


    // Relay response into callback for now.
    return callback({text: outputString, data: request.data});

  };

}

// The data field in the response object will contain the rich text payloads,
// this function handles adding the richText payloads from each individual 'result'
// component that could exist as part of the fulfilment control flow, and adds it to
// the global 'data' field at the highlest level in the JSON response object, because
// although we could in theory have multiple results each with their own richText payloads,
// a single response is being sent, which must contain all the richText data merged
// into a single payload to be handled by the front end logic.
function attachRichText(request, richText){

  // Check to see if the request object has a data field already.
  if (!request.data) request.data = {};

  // Check to see if any of the properties of richText are already contained in
  // the request.data object, and if they are, merge them.
  Object.keys(richText).forEach(key => {

    // If the request object already contains the property, then we need to
    // merge the two.
    if (request.data[key]) {

      // If the property is an array, simply concatenate the two.
      // TODO: Check for duplicates!
        if (Array.isArray(request.data[key])) {
          request.data[key] = request.data[key].concat(richText[key]);
        }
        else
          // If it is *not* an array, attempt to merge the two objects.
          request.data[key] = {...request.data[key], ...richText[key]};

    } else {
      // If the property does not already exist in the request object, simply
      // add it.
      request.data[key] = richText[key];
    }
  });

  // Return the merged object.
  return request;

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
