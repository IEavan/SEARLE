/**
 * Transforms raw results into human-readable text.
 */

// Examples of requests that may be recieved:

/**
 * REFERENCE INPUT
 *  RESULT {
 *    intent: "...",
 *    params: {
 *      stockLookupType: "price" / "open" / "high" / "low" / "absolute_change"...
 *      timePeriod: '',
 *      entityName: '', [This is unresolved entity name].
 *    },
 *    value: '',
 *    entity: ''
 *  }
 */

// DEPENDENCIES.
const responseTemplates = require('../../config/responseTemplate.json');
const format = require('string-template');

// Module entry point.
module.exports = (result) => {

  // Check that result is not empty.
  if (!result || !result.params || !result.intent || !result.value || !result.entity)
    return null;

  // If the language transformer fails, it will at least output the raw value
  // with no human-readable transforming. (Worst case, but better than an error).
  var output = result.value;

  // Check to see that we have a mapping in the responseTemplate json.
  var template = responseTemplate[result.intent];
  if (!template) return null;
  if (!template.mainParam) return null; // No main parameter mapping to get granular templates.
  if (!result[template.mainParam]) return null; // Result does not contain main parameter.

  // If the intent is mapped, then we should extract the parameters and fill
  // in the template slots.
  substitutableParams = {};

  // Based on the main parameter (stockLookupType in the case of stock Lookup, get
  // the list of templates that will be further divided upon based on auxiliary parameters
  // such as price, volume, high, low, etc.)
  var templateString = template[template.mainParam][result.params[template.mainParam]];

  // Get all substituable parameters.
  var validParams = getValidParamsFromTemplate(templateString);

  // For each validParam, traverse the result object until it is found. Map this to
  // the corresponding value and attach to the substitutableParams object.
  validParams.forEach(param => {

  });

  // Handle timePeriod defaults.

  // Structure substitutableParams for stockLookup.
  // switch (result.intent) {
  //   case 'stockLookup':
  //
  //     var templateString = template.type[result.params.stockLookupType];
  //
  //     // Fetch all valid substitutable parameters. (remember timeframe defaults).s
  //
  //
  //     // Grab the template corresponding to the stockLookupType, and fill in
  //     // each parameter accordingly.
  //     output = format(template.type[result.params.stockLookupType], {
  //
  //     });
  //     break;
  //   default:
  //     break;
  // }
}

// Given a template string, returns an array of valid parameters that the template
// string can accept.
function getValidParamsFromTemplate(templateString){
  return templateString.match(/[^{\}]+(?=})/g);
}

// Depth - first traversal of the object, in search of the given parameter label.
function objDFS(obj, label){

  console.log('currently in ', obj);

  if (obj.hasOwnProperty(label)) {
    console.log("Found : ", obj[label]);
    return obj[label];
  }

  var keys = Object.keys(obj);

  for (var i = 0; i < keys.length; i++){
    console.log('selecting key ' + keys[i]);
    obj = objDFS(obj[keys[i]], label);
    if (obj && obj.hasOwnProperty(label)) return obj[label];
  }

  console.log("nothing found in ", obj);
}


function log(msg){
  log(`LANGUAGE TRANSFORMER | ${msg}`);
}
