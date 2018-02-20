/**
 *  Stock lookup module.
 *
 *  Resolves financial entity name into either a stock ticker symbol &
 *  full company name, sector name, or entire FTSE 100.
 */

// DEPENDENCIES
const resolveEntity = require('../resolve/resolveEntity');

// Module entry point.
module.exports = (params) => {

  // Resolve financial entity name.
  return new Promise((resolve, reject) => {

    // Return extended stock name + symbol for now.

    // If no company name return error.
    if (!params.companyName) return reject(`In order to make a stock lookup, I need a company name!`)

    resolveEntity(params.companyName, (resolvedCompany) => {

      return resolve(`You want me to perform an ${params.stockLookupType} stock lookup on ${resolvedCompany.name} [${resolvedCompany.symbol}], correct?`);

    });

  });

}
