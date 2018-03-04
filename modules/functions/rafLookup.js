/**
 *  Risers & Fallers lookup module.
 *
 *  Handles queries related to the risers & fallers of the FTSE 100 as a whole.
 */

// DEPENDENCIES
const resolveEntity = require('../resolve/resolveEntity');
const Fetch = require('../data/fetch');

// Module entry point.
module.exports = rafLookup;

function rafLookup(params){

  // Add an alias for stockLookupType.
  if (!params.attribute && params.SEARLE_stock_lookup_type) params.attribute = params.SEARLE_stock_lookup_type;
  if (!params.type && params.rafLookupType) params.type = params.rafLookupType;


  // Instatiate the fetch object.
  var fetch = new Fetch();

  // Parse quantity as an integer.
  params.quantity = parseInt(params.quantity);

  // If params.quantity not set, default to 5.
  if (!params.quantity || isNaN(params.quantity)) params.quantity = 5;


  // If params.type is not set, perform a composed request of fallers & risers.
  if (!params.type) {
    log('No params.type detected');
    return new Promise((resolve, reject) => {
      resolve(rafLookup({type: 'fallers', quantity: params.quantity, attribute: params.attribute}).then(fallers => {
        return rafLookup({type: 'risers', quantity: params.quantity, attribute: params.attribute}).then(risers => {
          return [{...params, ...risers}, {...params, ...fallers}];
        });
      }));
    });
  }

  // If stockLookupType not set, default to change.
  if (!params.attribute) params.attribute = 'change';

  if (params.attribute == 'change') {
    log('Change lookup type detected.');
      return new Promise((resolve, reject) => {
        return resolve(
          rafLookup({type: params.type, attribute: 'per_change', quantity: params.quantity})
          .then(perChangeResult => {
            return rafLookup({type: params.type, attribute: 'abs_change', quantity: params.quantity})
            .then(absChangeResult => {return composeResult(absChangeResult, perChangeResult, params)});
          })
        );
    });
  }

  return new Promise((resolve, reject) => {

    console.log('Core request.', params);

    return resolve(fetch.rafLookup({
      type: params.type,
      quantity: params.quantity,
      attribute: params.attribute
    }).then(fillCompanyInfo));

  });

}

// Takes in array of objects containing the ticker, and fills in the remaining
// details related to the company, by performing an entity resolution.
function fillCompanyInfo(data, filledCompanyInfo){

  // Rename data.result to data.value.
  // TODO: This is a temporary fix, change Python JSON response structure for RAF
  // to reflect this.
  if (!data.value) {
    data.value = data.result;
    delete data.result;
  }

  if (!filledCompanyInfo) filledCompanyInfo = [];

  return new Promise((resolve, reject) => {

    if (!data.value || data.value.length == 0) {
      data.value = filledCompanyInfo;

      return resolve(data);
    }

    var ci = data.value.shift();

    resolveEntity(ci.ticker, resolved => {
      filledCompanyInfo.push(Object.assign(ci, resolved));
      return resolve(fillCompanyInfo(data, filledCompanyInfo));
    });

  });

}

// Takes in result for absoluteChange, percentageChange, and the original
// parameters object, and composes the two results into a single result object.
function composeResult(absChangeResult, perChangeResult, params){

  absChangeResult.value.forEach((result, i) => {
    absChangeResult.value[i] = {
      ...result, value: `${result.value} (${perChangeResult.value[i].value.toFixed(2)})%`
    }
  });

  return {...absChangeResult, ...params}

}

function log(msg){
  if (process.env.DEBUG) console.log(`RAF LOOKUP | ${msg}`);
}
