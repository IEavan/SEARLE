/**
 * Transforms raw results into human-readable text.
 */

// Examples of requests that may be recieved:

/**
 * REFERENCE INPUT
 *  RESULT {
 *    intent: "...",
 *    ltID: "...",
 *    params: {
 *      stockLookupType: "price" / "open" / "high" / "low" / "absolute_change"...
 *      timePeriod: '',
 *      entityName: '', [This is unresolved entity name].
 *    },
 *    value: '',
 *    name: ''
 *  }
 */

// DEPENDENCIES.
const responseTemplate = require('../../config/responseTemplate.json');
const format = require('string-template');

// Main function.
const transform = (result) => {

  var params = objectDFS(result, 'params');
  var ltID = objectDFS(result, 'ltID');

  // If no ltID is defined, use the intent a a default ltID.
  if (!ltID) ltID = objectDFS(result, 'intent');
  var value  = objectDFS(result, 'value');
  if (!value) value = objectDFS(result, 'results');
  var name = objectDFS(result, 'name');

  log(`ltID: ${ltID}`);

  // Check that result is not empty.
  if (!result || !params || !ltID || !value || !name){
    log(`Missing crucial parameter for transformation. \nResult: ${result}, Params: ${params}, ltID: ${ltID}, Value: ${value}, Name: ${name}.`);
    return null;
  }

  // If the language transformer fails, it will at least output the raw value
  // with no human-readable transforming. (Worst case, but better than an error).
  var output = value;

  // Check to see that we have a mapping in the responseTemplate json.
  var template = responseTemplate[ltID];

  if (!template) {
    log(`No template found for ${ltID}.`);
    return null;
  }

  // No main parameter mapping to get granular templates.
  if (template.mainParam) return subByMainParam(result, template);

  // If no main param found, naively substitute object's properties to the
  // parameters in the template with DFS.
  if (!template.type) return naiveSubstitution(result, template);

  // Check to see if the template is of type list.
  if (template.type && template.type == 'list') return listSubstitution(result, result.result.result, template, ltID);


}

// Module entry point.
module.exports = transform;

// Substitute a list of results, containing a header and templateString which is repeatedly
// used for each item.
function listSubstitution(result, list, template, ltID){

  if (!template.pre || !template.listItem) {
    log(`No pre (header) or list entry found for ${ltID}.`);
    return null;
  }

  // Essentially naive substitution for each result element.
  var header = naiveSubstitution(result, template.pre);

  // For each list element, naivelySubstitute.
  var body = "";

  list.forEach(item => {body += '\n' + naiveSubstitution(item, template.listItem)});

  var end = "";

  if (template.end) end = naiveSubstitution(result, template.end);

  return header + '\n' + body + (end ? '\n' + end : '');

}

// Perform substitution based off of some main parameter (e.g. spot price, volume, etc).
function subByMainParam(result, template){

    // Get the main param from the object.
    log(`Searching result object for ${template.mainParam}`);
    var mainParamVal = objectDFS(result, template.mainParam);

    if (!mainParamVal){
      log(`No entry in ${ltID} for main parameter ${template.mainParam}.`);
      return null;
    } // Result does not contain main parameter.

    // Based on the main parameter (stockLookupType in the case of stock Lookup, get
    // the list of templates that will be further divided upon based on auxiliary parameters
    // such as price, volume, high, low, etc.)
    var templateString = template[template.mainParam][mainParamVal];
    var defaults = template.defaults ? template.defaults: null;

    return naiveSubstitution(result, templateString, defaults);


}

// Naively substitute the template paramters with matching values from associated
// keys in the result object, found with DFS traversal.
function naiveSubstitution(result, templateString, defaults){

  // If the ltID is mapped, then we should extract the parameters and fill
  // in the template slots.
  substitutableParams = {};

  // Template string could be an array. If this is the case, choose a random
  // entry. EXTENSION IDEA: Settings for this (disable randomness, or alter likelihood
  // of certain responses over others).
  if (Array.isArray(templateString))
    templateString = templateString[Math.floor(Math.random() * templateString.length)];

  log('template string ', templateString);

  // Get all substituable parameters.
  var validParams = getValidParamsFromTemplate(templateString);

  // console.log('Valid Params ', validParams);

  // For each validParam, traverse the result object until it is found. Map this to
  // the corresponding value and attach to the substitutableParams object.
  validParams.forEach(param => {
    var foundValue = objectDFS(result, param);
    // If parameter is found, attach it to the substitutableParams object.
    if (foundValue) substitutableParams[param] = foundValue;
  });

  // console.log('Current substitutableParams ', substitutableParams);

  // Handle defaults.
  substitutableParams = subDefaults(validParams, result, substitutableParams, defaults);

  // Round all numerical values to 2d.p. at most (if not an integer).
  substitutableParams = roundValues(substitutableParams);

  // Format string and return transformed response if all goes well.
  var formattedString = format(templateString, substitutableParams);
  if (formattedString) return formattedString;

  // In the worst case (no formatted string), return the raw result value.
  return value;

}

// Substitute in any default values in our string template, where parameter values have
// not been specified.
function subDefaults(validParams, result, substitutableParams, defaults){

  // If the responseTemplate contians some timePeriod parameter which is not
  // mapped in the substitutableParams object, then we will add in the default
  // value declared in the responeTemplate file.
  validParams.forEach(param => {

    // console.log('Checking valid param default for ', param);

    // First we compare to see if there are any unmapped params.
    // Then we check if a 'defaults' property is defined in the responseTemplate for
    // the current ltID. If there is one, then we check to see if defaults exist for
    // the current parameter. If this is the case, then we want to get the default
    // value, and add it along with the param as a KVP to the substitutableParams
    // object.
    if (!substitutableParams[param] && defaults && defaults[param]){

      // console.log(param, ' has a default.');

      // Two options here; we know that for the stockLookup, the exact stockLookupType
      // is immediately used following the mainParam lookup for the responseTemplate.
      // We could simply leverage this to extract the timeframe default here, but
      // for generality and extension, it would be better to once again traverse the object
      // for all possible keys it contains (provided it is not that large, which holds true for
      // our purposes), and see if any match the keys in the template.defaults[param] object.
      // We simply just need to return the one that does (if there are any).

      // Get the list of default parameters that are supported in the template.
      var defaultParams = Object.keys(defaults[param]);

      // console.log('Supported default parameter values for ', param, ': ', template.defaults[param]);

      // Search the result object for matching values for any of the default parameters.
      var matchingParameter = objectDFSByVal(result, Object.keys(defaults[param]));

      // console.log('Found matching parameter ', matchingParameter);

      // If we have a matching parameter, grab the value from the template default
      // and add it to the substitutable params object.
      if (matchingParameter)
        substitutableParams[param] = defaults[param][matchingParameter];

    }

  });

  // Return substitutableParams with added substituted default values.
  return substitutableParams;

}

// Round off values to 2d.p. for readability.
function roundValues(params){

  Object.keys(params).forEach(key => {

    // Parse the number.
    var parsedNum = Number(params[key]);

    // If it is not an integer, it must be a float or double. If this is the case,
    // round it to 2 decimal places.
    if (!isNaN(parsedNum) && !Number.isInteger(parsedNum))
      params[key] = parsedNum.toFixed(2);
  });

  return params;

}

// Given a template string, returns an array of valid parameters that the template
// string can accept.
function getValidParamsFromTemplate(templateString){
  return templateString.match(/[^{\}]+(?=})/g);
}


/**
 * Depth - first traversal of the object, in search of the given parameter label.
 *
 * Accepts an object and a key (or key array) as parameters, return the corresponding value of
 * some nested element which corresponds to the key (or first key sequentially traversed),
 * or null if not found.
 *
 * @param  {[Object]} obj [Input Object to be traversed]
 * @param  {[String]} key [Key to be searched for]
 * @return {[Object]}     [Output value]
 */
 function objectDFS(obj, keys){

   // Convert any non-array 'keys' param into a singleton array.
   if (!Array.isArray(keys)) keys = [keys];

   // Return null if obj is not an Object.
   if (!obj || typeof obj !== "object") return null;

   // Return if we find any mapping of one of the keys passed to some key
   // at this current level of the object.
   for (var i = 0; i < keys.length; i++)
     if (obj.hasOwnProperty(keys[i])) return obj[keys[i]];


   // If we can't find it, we need to run a depth first search, visiting all the
   // 'nodes' of the object (keys) until we find the desired value mapped to the
   // key.
   var innerKeys = Object.keys(obj);

   // For each key value, run DFS.
   for (var i = 0; i < innerKeys.length; i++){
     var innerKey = innerKeys[i];
     // Should traverse to the deepest level of the object, and return the
     // desired key value if it exists.
     var result = objectDFS(obj[innerKey], keys);
     if (result) return result;
   }

 }

 // Similar to the above method. Returns any values from the passed 'vals' array
 // which match any values in the passed object.
 function objectDFSByVal(obj, vals){

   // Convert any non-array 'keys' param into a singleton array.
   if (!Array.isArray(vals)) vals = [vals];

   // Return null if obj is not an Object.
   if (!obj || typeof obj !== "object") return null;

   // Array of object values at the current level.
   var objVals = objectValues(obj);

   // Check if the value exists at this level.
   for (var i = 0; i < vals.length; i++)
     if (objVals.indexOf(vals[i]) !== -1) return vals[i];


   // If we can't find it, we need to run a depth first search, visiting all the
   // 'nodes' of the object (keys) until we find the desired value mapped to the
   // key.
   var innerKeys = Object.keys(obj);

   // For each key value, run DFS.
   for (var i = 0; i < innerKeys.length; i++){
     var innerKey = innerKeys[i];
     // Should traverse to the deepest level of the object, and return the
     // desired key value if it exists.
     var result = objectDFSByVal(obj[innerKey], vals);
     if (result) return result;
   }

 }

 // Return an array of the values associated with the object at the current level.
 function objectValues(object){
   var output = [];

   Object.keys(object).forEach(key => {
     output.push(object[key]);
   });

   return output;
 }

function log(msg){
  if (process.env.DEBUG) console.log(`LANGUAGE TRANSFORMER | ${msg}`);
}
