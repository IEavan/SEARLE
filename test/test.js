/**
 *  Unit Testing framework for SEARLE.
 */

// DEPENDENCIES
const assert = require('assert');
const Fetch = require('../modules/data/fetch');
const {spawn} = require('child_process');
const path = require('path');
const config = require('../config/config');
const likelihoodThreshold = config.likelihoodThreshold;
if (!likelihoodThreshold) likelihoodThreshold = 0.5;
const listings = require(require('path').resolve(__dirname, "../modules/data/FTSEListings"));

// Get the number of test cases to produce.
var numTestCases = 5; // Use 5 by default.

var fetch = new Fetch();

var coreCompanyAttributes = ["price", "volume", "last_close", "high", "low", "market_cap", "abs_change", "per_change"];

describe("Functional Requirements", () => {
  coreCompanyAttributes.forEach(attribute => {
    describe(`Should return the ${attribute} of a given company on the FTSE 100.`, () => {
      randomElements(listings.ticker, numTestCases).forEach(symbol => {
        it(`Successfully looks up ${attribute} for ${symbol}.`, () => {
          return fetch.stockLookup(symbol, {type: attribute});
        });
      })
    });

    describe(`Should return the ${attribute} for a given sector on the FTSE 100.`, () => {
      randomElements(listings['ftse sector'], numTestCases).forEach(sector => {
        it(`Successfully looks up ${attribute} for ${sector}.`, () => {
          return fetch.groupLookup({entityType: 'sector', name: sector, type: attribute});
        });
      });
    });
  });

  describe("Should return news for a given company on the FTSE 100.", () => {
    randomElements(listings.ticker, numTestCases).forEach(symbol => {
      it(`Successfully retrieves news articles on ${symbol}.`, () => {
        return fetch.getNews(symbol);
      })
    });
  });

})



describe('Passive AI', () => {

    describe('Significant Change in Spot Price', () => {

      randomElements(listings.ticker, numTestCases).forEach(symbol => {
        it(`Should detect significant change in ${symbol}`, () => {
          return generateStockTestingData()
            .then(fetch.stockLookup(symbol, {testData: true}).then(result => {
            assert.equal(isUnlikely(result), true);
          }));
        })
      })
    })

});

// describe('Non-Functional Requirements', () => {
//   it("Response should be observed within 5 seconds", () => {
//     assert.equal(true, false);
//   })
// })

// Return a specified amount of random elements from the array passed.
function randomElements(array, limit){
  if (!limit) return array;

  var output = [];
  while (output.length < limit)
    output.push(array[Math.floor(Math.random() * array.length)]);

  return output;
}

function isUnlikely(response){
  return response.result.likelihood && (response.result.likelihood < likelihoodThreshold);
}

// Generate test data for a given stock symbol.
function generateStockTestingData(symbol){

  return new Promise((resolve, reject) => {

    // Compile the file first.
    var compileProc = spawn("javac", ["TestDataGenerator.java"], {cwd: path.resolve(__dirname, "../modules/analysis")});

    compileProc.on('close', () => {
      if (process.env.DEBUG) console.log("TEST | Compiled TestDataGenerator.java. Attempting to execute now.");

      var generatorProc = spawn("java", ["TestDataGenerator"], {cwd: path.resolve(__dirname, "../modules/analysis")});

      generatorProc.on('stdout', (data) => {
        if (process.env.DEBUG) console.log(`TEST | GeneratorProcess: ${data.toString()}`);
      });

      generatorProc.on('close', () => {
        if (process.env.DEBUG) console.log(`TEST | GeneratorProcess completed generating test data.`);
        return resolve();
      })
  });

  });

}
