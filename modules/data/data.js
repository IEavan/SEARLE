/**
 * Data Persistence Interface for SEARLE.
 */

const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

// Module entry point.
module.exports = function Data(){

  // Log user request.
  this.logUserRequest = () => {

  };

  // Fetch logged user requests.
  this.getUserRequests = (filter) => {

  };

  // Returns cached version of FTSE listing information
  this.getFTSEListings = () => {

    return new Promise((resolve, reject) => {

      fs.exists('./FTSEListings.json', exists => {
        if (!exists)
          this.updateFTSEListings().then(() => {
            return resolve(require('./FTSEListings'));
          });

          return resolve(require('./FTSEListings'));

      });



    });

  };

  this.updateFTSEListings = () => {

    var self = this;

    return new Promise((resolve, reject) => {

      // Get the newest FTSE listings off of Wikipedia and save to a JSON file.
      self.getLiveFTSEListings().then(data => {

        fs.writeFile('FTSEListings.json', JSON.stringify(data, null, 2), (err) => {
          if (err) return reject(err);
          log(`Updated FTSEListings cache.`);
          return resolve();
        });

      });

    });

  };

  this.getLiveFTSEListings = () => {

    return new Promise((resolve, reject) => {

      // Grab current FTSE list off wikipedia.
      request.get('https://en.wikipedia.org/wiki/FTSE_100_Index', (err, res, body) => {

        var $ = cheerio.load(body);

        // Parse table into array of objects containing the full name, symbol, and
        // sector it belongs too.
        var data = parseTable($);

        // Output object will serve as a lookup table. Any criteria (symbol, full name or
        // sector name can be used to retrieve corresponding information).
        var output = {
          lookup: {}
        };

        // For each key, create a property in the object that can be used to
        // retrieve all members (e.g. all companies, all sectors, or all symbols).
        data.forEach(item => {
          Object.keys(item).forEach(key => {
            if (!output[key]) output[key] = [];
            output[key].push(item[key]);

            // Now for each value (e.g. each company name, each symbol, each sector),
            // we will fill the output object with corresponding items that match this.
            // E.g. companies that fit in a particular sector, a symbol that matches to a particular
            // company name, etc.

            if (!output.lookup[key]) output.lookup[key] = {};

            // If no entry exists, we store the object on its own.
            if (!output.lookup[key][item[key]])
               return output.lookup[key][item[key]] = item;
            // If there is an entry already, then we could expect more values to
            // fit under the same key for the lookup, so we should nest the object
            // in an array and add the new item to this.
            else {

              // If the item is not an array, make it one and nest the old inside it.
              if (!Array.isArray(output.lookup[key][item[key]]))
                output.lookup[key][item[key]] = [output.lookup[key][item[key]]];

              // Push the new item to the array.
              output.lookup[key][item[key]].push(item);
            }

          });
        });

        return resolve(output);

      });

    });

  };

}


// UTILITY FUNCTIONS

// Parses the table into an array of object, where each table header is the key
// for the unique value in each object element in the array.
function parseTable($){

  var output = [];

  // Clean by removing all references.
  $('sup').remove();
  var headers = $($('#constituents tr')[0]).children('th');

  // Get object keys from table headers.
  var keys = [];
  for (var i = 0; i < headers.length; i++){
    keys.push($(headers[i]).text().toLowerCase());
  }

  // Iterate over every entry in the table.
  var rows =  $($('#constituents tr'));

  // Start from the second row so that we skip the first, which contains the
  // key information obtained earlier.
  for (var i = 1; i < rows.length; i++){
    var ci = {};
    var cells = $(rows[i]).children('td');
    for (var k = 0; k < cells.length; k++){
      ci[keys[k]] = $(cells[k]).text();
    }
    output.push(ci);
  }

  return output;

}

// UTILTIY FUNCTIONS

function log(msg){
  console.log(`DATA | ${msg}`);
}
