/**
 *  Data Fetch interface for SEARLE.
 *
 *  Orchestrates retrieval and output of elementary requests.
 */

// DEPENDENCIES
const nodePyInt = require(require('path').resolve(__dirname, '../analysis/nodePyInt'));
const pyScriptsPath = require('path').resolve(__dirname, '../analysis/');
const request = require('request');
const cheerio = require('cheerio');
const Data = require('./data');

var data = new Data();

module.exports = function Fetch() {

  // entity template: (follows for all methods below)
  // entity arguments must be resolved before being passed here.

  // entity = {
  //   name: 'name',
  //   symbol: '...', (null for grouping)
  //   type: 'grouping', 'company' // Grouping and sector mean the same thing. Entire FTSE 100 would fall under this.
  // }

  // News lookup request.
  this.getNews = (entity, ops) => {

    // ops template:

    // ops = {
    //   type: 'general', 'positive-only', 'negative-only',
    //   time-period: {
    //      start: { Date }
    //      end: { Date }
    //   } (no date filter by default, gets most recent available),
    //   attachSentimentForEach: true (def), false,
    //   attachSentimentForAll: true (def), false,
    //   summariseEach: true (def), false,
    //   summariseAll: false (def), true, // Summarise all scraped articles to give an overview.
    //   positiveCount: 1 (def), ...,
    //   negativeCount: 1 (def), ...,
    // }

    // Extension: 'insight' mode could run a pre-query to deterine the overall sentiment,
    // then look for specifically positive, or specifically negative sentiment articles
    // based off of this. (e.g. if <50% sentiment for an entity, return 3 negative articles
    // to help derive insight)

  }

  // [Extension] Sentiment lookup. Similar to news requests, but has wider range of sources
  // to scrape e.g. Twitter, social media, etc. Would faciliate requests like 'How do people feel
  // about tesla?'. A more 'real-time' kind of sentiment analysis, as opposed
  // to just analysing sentiment of articles.
  this.getSentiment = (entity, ops) => {

    // ops template

    // ops = {
    //   sources: {
    //     socialMedia: true (def), false,
    //     newsMedia: false (def), true,
    //   }
    // }

    // output template

    // output = {
    //   sentiment: x%,
    //   sources: ['Twitter', 'Reddit', 'Forum', ...]
    // }

  }

  // Perform a stock lookup.
  //  Can either be current spot price, open / close, high / low, volume (24 hr default),
  //  or unit / percentage change.
  this.stockLookup = (entity, ops) => {

    // ops template

    // ops = {
    //     symbol: entity,
    //     type: 'current' (def), 'open', 'close', 'high', 'low', 'percentageChange', 'unitChange'
    // }

    console.log(`Recieved fetch: ${entity}`);

    const pyStockLookup = nodePyInt(`${pyScriptsPath}/node_interface.py`, null, {cwd: pyScriptsPath});

    return pyStockLookup({
      request_type: "get_current_attribute",
      ticker: entity,
      attribute: (ops && ops.type ? ops.type : 'price') // Select price by default.
    }).then(result => {
      console.log(result);
      if (!result || result === 'None\n') return Promise.reject(`Could not lookup ${entity}.`);
      return result;
    });

  }

  // Perform a stock lookup.
  //  Can either be current spot price, open / close, high / low, volume (24 hr default),
  //  or unit / percentage change.
  this.sectorLookup = (entity, ops) => {

    // ops template

    // ops = {
    //     symbol: entity,
    //     type: 'current' (def), 'open', 'close', 'high', 'low', 'percentageChange', 'unitChange'
    // }

    console.log(`Recieved fetch: ${entity}`);

    const pyStockLookup = nodePyInt(`${pyScriptsPath}/node_interface.py`, null, {cwd: pyScriptsPath});

    return pyStockLookup({
      request_type: "get_current_attribute",
      ticker: entity,
      attribute: (ops && ops.type ? ops.type : 'price') // Select price by default.
    }).then(result => {
      console.log(result);
      if (!result || result === 'None\n') return Promise.reject(`Could not lookup ${entity}.`);
      return result;
    });

  }

  // Trade volume request.
  this.getTradeVolume = (entity, ops) => {

    // ops template

    // ops = {
    //     time-period: {
    //       start: { Date }
    //       end: { Date }
    //     } (def last 24 hours), // This will unlikely be changed.
    //     type: 'current' (def), 'percentageChange', 'unitChange'
    // }
    //
  }

  // Get list of companies currently listed on the FTSE 100, including
  // symbols & sector names.
  this.getFTSE = (ops) => {

    // ops template

    // ops = {
    //   limit: 20 (def),
    //   target: 'fallers', 'risers',
    // }

  }

  log(`Loaded.`);

}

function log(msg){
  console.log(`DATA FETCH | ${msg}`);
}
