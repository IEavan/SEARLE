/**
 *  Stock lookup module.
 *
 *  Resolves financial entity name into either a stock ticker symbol &
 *  full company name, sector name, or entire FTSE 100.
 */

// DEPENDENCIES
const resolveEntity = require('../resolve/resolveEntity');
const Fetch = require('../data/fetch');

// Module entry point.
module.exports = (params) => {

  // Instantiate a new fetcher instance.
  var fetch = new Fetch();

  // Resolve financial entity name.
  return new Promise((resolve, reject) => {

    // Return extended stock name + symbol for now.

    // If no company name return error.
    if (!params.entityName) return reject(`In order to make a stock lookup, I need a company name!`)

    resolveEntity(params.entityName, (resolvedEntity) => {

      if (!resolvedEntity || !resolvedEntity.symbol) return reject(`Could not resolve financial entity.`);

      // Once financial entity resolved, perform the lookup, depending on the type of resolved entity,
      // this could be (3) types.
      //  (1) Company lookup
      //  (2) Sector lookup
      //  (3) Entire FTSE 100 lookup

      console.log(`Spot Price lookup for `, resolvedEntity, 'params: ', params);

      if (resolvedEntity.entityType === 'company')
        // Fetch and return the spot price for the resolved entity and given stockLookupType.
        // TODO: Proper error handling.
        return resolve(
          fetch.stockLookup(resolvedEntity.symbol, {type: params.stockLookupType}).then(val => {
            return Object.assign({value: val}, resolvedEntity);
          })
        );

      // Run a sector lookup. Keep in mind that this passes the entity name to the delegated
      // script, and not a symbol. Perhaps we should refactor and have .symbol be replaced
      // for .id? Since sectors could be identified with an ID as well?
      if (resolvedEntity.entityType === 'sector')
        return resolve(fetch.sectorLookup(resolvedEntity.name, {type: params.stockLookupType}).then(val => {
          return Object.assign({value: val}, resolvedEntity);
        })
      );


      // Handle unresolved entities.
      return reject(`Could not resolve financial entity.`);

    });

  });

}
