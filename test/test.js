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
const numberOfRandomTickers = config.testing.numberOfRandomTickers
if (!numberOfRandomTickers) numberOfRandomTickers = 5;
if (!likelihoodThreshold) likelihoodThreshold = 0.5;
const listings = require(require('path').resolve(__dirname, "../modules/data/FTSEListings"));

var fetch = new Fetch();



describe('Live AI', () => {

    describe('Significant Change in Spot Price', () => {

      var randomSymbols = [];
      while(randomSymbols.length < numberOfRandomTickers)
        randomSymbols.push(listings.ticker[Math.floor(Math.random() * listings.ticker.length)]);

      randomSymbols.forEach(symbol => {
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
