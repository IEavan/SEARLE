/**
 *  Handles post-processing for enrichment of requests.
 *
 *  Inspects the likelihood of a given request and suggests to fetch more
 *  information if the likelihood is low.
 *
 */

// DEPENDENCIES
const transform = require('../resolve/languageTransformer');
const config = require(require('path').resolve(__dirname, "../../config/config"))

// Module entry point.
module.exports = (request, callback) => {

  // Grab likelihoodThreshold from config, if not use 0.5 as a default.
  const likelihoodThreshold = (config.likelihoodThreshold ? config.likelihoodThreshold : 0.5);

  // Check to see if the request object has the data payload & suggestion property already.
  if (!request.data) request.data = {suggestion: []};
  if (!request.data.suggestion) request.data.suggestion = [];

  // Iterate through all the results, and check to see if any of them have a lieklihood field.
  var results = request.results;

  // For each result, check to see if there is a lieklihood field.
  results.forEach(result => {

    var resultLikelihood = objectDFS(result, 'likelihood');
    // Skip the current iteration if there is no likelihood property in the result.
    if (!resultLikelihood) return;

    // If there is a likelihood field, and it is less than 0.5, we construct a
    // 'fake' reult which will be appended to request.results. This will contain
    // the information on the nature of the change and how likely it is.
    // The languageTransformer will detect this and embed it in the response accordingly.
    // Addittionally, we must add an appropriate suggestion to fetch news to help
    // gain further insight if necessary.
    if (resultLikelihood < likelihoodThreshold) {

      console.log("Likelihood exceeds threshold for the current result: ", result);

      // TODO: determine if the change is positive, negative, or neutral.
      // Add the enrichment note & the desired suggestion to act on this.
      request.results.push({
        ...createEnrichmentNote(result, resultLikelihood),
        richText: {suggestion: [`Get news on ${result.name}.`]}
      });

    }

  });

  // Return the enriched object.
  if (!callback) return log(`Error. No callback defined for postProcessHandler.`);
  return callback(request);

}

// EnrichmentNotification which will be added to the end of the request.result array.
function createEnrichmentNote(result, likelihood, nature){

  return {
    ...result,
    ltID: "enrichmentNote",
    nature: (nature ? nature : "unspecified"),
    likelihood: (likelihood * 100) // Return likelihood as a percentage.
  }

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
