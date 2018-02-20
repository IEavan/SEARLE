/**
 *  Resolves entity into either groupings (sectors or whole FTSE 100) or company
 *  name and stock symbol.
 */

// DEPENDENCIES
const lookupSymbol = require('./lookupSymbol');
const lookupSector = require('./lookupSector');

// Module entry point.
module.exports = (input, callback, ops) => {

  // ops template

  // Can specify if entity is a company, or grouping beforehand. Otherwise a guess
  // is made.
  // ops = {
  //   type: 'company', 'grouping'
  // }

  // Sectors are checked first.
  //

  // Attempt to resolve input as a company first, with a corresponding code.s
  lookupSymbol(input, (lookupResult) => {

    // TODO: Ensure that the symbol is within the list of FTSE 100 companies.

    // Pass result to callback.
    return callback(lookupResult);

  });

}
