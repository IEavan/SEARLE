/**
 *  Handles post-processing for enrichment of requests.
 *
 *  Inspects the likelihood of a given request and suggests to fetch more
 *  information if the likelihood is low.
 *
 */

// DEPENDENCIES
const transform = require('../resolve/languageTransformer');

// Module entry point.
module.exports = (request) => {

  // This will contain any notes we want to add (e.g. if a spot price is very high or very low,
  // this is where it will be reported to the user).
  var enrichmentNote = "";
  var suggestions = [];

  // Iterate through all the results, and check to see if any of them have a lieklihood field.
  var results = request.results;

  // For each result, check to see if there is a lieklihood field.
  results.forEach(result => {

    var likelihood = objectDFS(result, 'likelihood');

    // If there is a likelihood field, and it is less than 0.5, we need to
    // report this to the user and suggest a news lookup.
    if (likelihood && likelihood < 0.5) {
      // enrichmentNote += "\n" + transform({ltId: 'significantValue', ...result});
      enrichmentNote = "\n That's quite a significant change for " + result.value.ticker + "."
    }

  });

};

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
