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

    // Append information about the type of successful lookup that was made.
    if (lookupResult) lookupResult.entityType = 'company';

    // Pass result to callback.
    if (callback) return callback(lookupResult);

    return log(`No callback defined for lookupSymbol('${input}').`);

  });

}

function log(msg){
  console.log(`RESOLVE ENTITY | ${msg}`);
}
