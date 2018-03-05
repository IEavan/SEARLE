/**
 *  News Lookup module.
 *
 *  Takes in a company name and resolves this to a symbol, then looks up the
 *  top 3 articles from stockmarketwire for the given company, returning
 *  the results to the user.
 */

 // DEPENDENCIES
 const resolveEntity = require('../resolve/resolveEntity');
 const Fetch = require('../data/fetch');

// Module entry point
module.exports = (params) => {

  // We need to return the promise here so that we can reject if the resolveEntity
  // is not of type 'company' (since those are the only entity types which are
  // supported by news lookups).
  return new Promise((resolve, reject) => {

    // Instantiate fetch object.
    var fetch = new Fetch();

    var articleCount = params.articleCount;
    var entityName = params.entityName;

    if (!entityName) return reject("I need a company name in order to fetch news.");

    // Params are companyName and articleCount.

    // Set default articleCount to 3.
    if (!articleCount) articleCount = 3;


    // Resolve company name into symbol.
    resolveEntity(entityName, resolvedEntity => {

      if (resolvedEntity.entityType !== 'company')
        return reject("Companies are only supported for news lookups at the moment. Try asking me for news about a company you are interested in.");

      // Once we have the resolved entity we can run the news lookup query.
      fetch.getNews(resolvedEntity.symbol, articleCount).then(res => {

        // Language transformer expects array results to be of the format
        // {
        //  result: []
        // }
        // So we must prepare the results as such.
        // res.result = res.result.value;

        // Return results, with results embedded into the rich-text field.
        return resolve(
          {
            ...resolvedEntity,
            ...params,
            ...res,
            richText: {
              // Embed article type rich text response, which will be relayed
              // through the payload into the front end.s
              article: res.result.value,

              // Attatch a suggestion to the rich text field that will be recognised
              // byt the front end.
              suggestion: [`Get me the spot price of ${resolvedEntity.name}`]
            }
          }
        );

      });

    });


  });




}
