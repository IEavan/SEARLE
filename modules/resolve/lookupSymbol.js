/**
 * Resolves company names into stock ticker symbols.
 *
 */

const request = require('request');
const cheerio = require('cheerio');

const getQueryURL = (companyName) =>
  `http://d.yimg.com/autoc.finance.yahoo.com/autoc?query=` +
  `${companyName}` +
  `&region=1&lang=en&callback=YAHOO.Finance.SymbolSuggest.ssCallback`;


// Define module entry point.
module.exports = (name, cb) => {

  request.get(getQueryURL(name), (err, res, body) => {

    // Extract the JSON portion from the string.
    // Just matches for the first and last curly brace to ignore the weird text at the beginning.
    var coreResult =
      body.slice(body.indexOf('{'), body.length - body.split('').reverse().join('').indexOf('}'));

    body = JSON.parse(coreResult);

    // If there are no results, indicate query failure by returning a null.
    if (!body.ResultSet.Result || body.ResultSet.Result.length === 0)
      return cb(null);

    cb({
      symbol: body.ResultSet.Result[0].symbol,
      name: body.ResultSet.Result[0].name
    });

  });

}
