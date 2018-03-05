/**
 *  Interface for predicting the next intent for the user.
 */

 // DEPENDENCIES
 const resolveEntity = require('../resolve/resolveEntity');
 const Fetch = require('../data/fetch');

// Module entry point
module.exports = () => {

  // Get the predicted intent.
  var fetch = new Fetch();

  return new Promise((resolve, reject) => {

    return resolve(fetch.getPredictedIntent());

  });

}
