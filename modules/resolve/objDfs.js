/**
 * Testing script to traverse object structures much like a tree, looking for the
 * value associated with specific keys at some deeply-nested level. This would
 * help to keep JSON structure agnostic in a sense; provided there is some unique
 * key that we can reference, it can be found with this approach. ;)
 * @type {Object}
 */


var testObj = {
  "level1": {
    "level2": {
      "level3": {
        "desiredProperty": "desiredValue",
        "undesiredPropl3": "undesiredVall3"
      },
      "something else": true
    },
    "randomObj": {
      "randomProperty": "randomValue"
    },
    "randomNum": 211
  },
  "level11": {
    "boolean": true
  }
};

var resultTest = {
  intent: 'stockLookup',
  params: {
    stockLookupType: 'price',
    timePeriod: '',
    entityName: 'Google'
  },
  value: '1241',
  entity: 'Google'
};

/**
 * Accepts an object and a key as parameters, return the corresponding value of
 * some nested element which corresponds to the key, or null if not found.
 * @param  {[Object]} obj [Input Object to be traversed]
 * @param  {[String]} key [Key to be searched for]
 * @return {[Object]}     [Output value]
 */
function objectDFS(obj, key){

  if (!obj || typeof obj !== "object") return null;

  // Return key if we find it.
  if (obj.hasOwnProperty(key)) return obj[key];

  // If we can't find it, we need to run a depth first search, visiting all the
  // 'nodes' of the object (keys) until we find the desired value mapped to the
  // key.
  var keys = Object.keys(obj);

  // For each key value, run DFS.
  for (var i = 0; i < keys.length; i++){
    var innerKey = keys[i];
    // Should traverse to the deepest level of the object, and return the
    // desired key value if it exists.
    return objectDFS(obj[innerKey], key);
  }

}

// Similar to above, but instead accepts an array of keys, returning the first
// match found while traversing the Object by DFS, and a sequential search
// on the array and possible properties of the object at the current level.
function objectDFSArr(obj, keys){

  // Convert any non-array 'keys' param into a singleton array.
  if (!Array.isArray(keys)) keys = [keys];

  // Return null if obj is not an Object.
  if (!obj || typeof obj !== "object") return null;

  console.log(`Current object `, obj, ` key(s) `, keys);

  // Return if we find any mapping of one of the keys passed to some key
  // at this current level of the object.
  for (var i = 0; i < keys.length; i++){
    console.log(`Searching for ${keys[i]} at current level.`);
    if (obj.hasOwnProperty(keys[i])) return obj[keys[i]];
  }


  // If we can't find it, we need to run a depth first search, visiting all the
  // 'nodes' of the object (keys) until we find the desired value mapped to the
  // key.
  var innerKeys = Object.keys(obj);

  console.log('Inner keys ', innerKeys);

  // For each key value, run DFS.
  for (var i = 0; i < innerKeys.length; i++){
    var innerKey = innerKeys[i];
    console.log('Next key to traverse with ', innerKey);
    // Should traverse to the deepest level of the object, and return the
    // desired key value if it exists.
    console.log('Calling on object: ', obj[innerKey]);
    var intermediate = objectDFSArr(obj[innerKey], keys);
    if (intermediate) return intermediate;
  }

  return false;

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

console.log(objectDFSByVal(resultTest, 'price'));
