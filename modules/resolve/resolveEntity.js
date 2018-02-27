/**
 *  Resolves entity into either groupings (sectors or whole FTSE 100) or company
 *  name and stock symbol.
 */

// DEPENDENCIES
const lookupSymbol = require('./lookupSymbol');
const lookupSector = require('./lookupSector');
const Data = require('../data/data');
const stringMatch = require('didyoumean2');

var data = new Data();

// Module entry point.
module.exports = (input, callback, ops) => {

  // ops template

  // Can specify if entity is a company, or grouping beforehand. Otherwise a guess
  // is made.
  // ops = {
  //   type: 'company', 'grouping'
  // }

  // Obtain a fresh copy of the FTSEListings.
  data.getFTSEListings().then(listings => {

    // First conduct a 'strict' match, that is, only tolerate changes in casing.



    // Do a match against everything, then break it down to see where it came
    // from.
    var resolveableEntities = ['ftse 100', 'ftse', 'index']
                              .concat(listings['ftse sector'])
                              .concat(listings['company'])
                              .concat(listings['ticker']);

    var matched = stringMatch(input, resolveableEntities);

    // Check to see if the FTSE100 as a whole was queried.
    if (["ftse 100", "ftse", "index"].indexOf(matched) !== -1)
    return callback({name: 'FTSE 100', entityType: 'ftse'});

    // Check to see if match came from sectors.
    if (listings['ftse sector'].indexOf(matched) !== -1)
      return callback({name: matched, entityType: 'sector'});

    // Check to see if match came from companies.
    if (listings['company'].indexOf(matched) !== -1)
      return callback({name: matched, symbol: listings.lookup.company[matched].ticker, entityType: 'company'});

    // Check to see if match came from symbols.
    if (listings['ticker'].indexOf(matched) !== -1)
      return callback({name: listings.lookup.ticker[matched].company, symbol: matched, entityType: 'company'});

    // If the above stricter methods fail, attempt to resolve the input with
    // Yahoo! Finance's query API.
    lookupSymbol(input, (lookupResult) => {

      // TODO: Ensure that the symbol is within the list of FTSE 100 companies.

      // Append information about the type of successful lookup that was made.
      if (lookupResult) lookupResult.entityType = 'company';

      // Pass result to callback.
      if (callback) return callback(lookupResult);

      return log(`No callback defined for lookupSymbol('${input}').`);

    });

  });

}

function log(msg){
  console.log(`RESOLVE ENTITY | ${msg}`);
}
