/**
 * Resolves company names into stock ticker symbols.
 *
 */

const request = require('request');
const cheerio = require('cheerio');

const getQueryURL = (companyName) =>
  `http://autoc.finance.yahoo.com/autoc?query=` +
  `${companyName}` +
  `&lang=en-GB&region=UK`;


// Define module entry point.
module.exports = (name, cb) => {

  request.get(getQueryURL(name), (err, res, body) => {

    body = JSON.parse(body);

    // If there are no results, indicate query failure by returning a null.
    if (!body.ResultSet.Result || body.ResultSet.Result.length === 0)
      return cb(null);

    // Get first symbol & name from LSE, and strip trailing .L.
    var output = null;

    for (var item of body.ResultSet.Result){
      if (item && item.exch === 'LSE') {
        output = {
          name: item.name,
          symbol: item.symbol.replace(`.L`, ``)
        }
      }
    }

    return cb(output);

  });

}
