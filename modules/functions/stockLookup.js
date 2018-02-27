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

    console.log('Performing stock lookup for ', params);

    resolveEntity(params.entityName, (resolvedEntity) => {

      if (!resolvedEntity) return reject(`Could not resolve financial entity.`);

      // Once financial entity resolved, perform the lookup, depending on the type of resolved entity,
      // this could be (3) types.
      //  (1) Company lookup
      //  (2) Sector lookup
      //  (3) Entire FTSE 100 lookup

      console.log(`Spot Price lookup for `, resolvedEntity, 'params: ', params);

      if (resolvedEntity.entityType === 'company' && resolvedEntity.symbol){

        // If no stockLookupType defined, set to 'price'.
        if (!params.stockLookupType) params.stockLookupType = 'price';

        // Handle 'change' stockLookupType differently. This is a composition of
        // 'absolute_change' as well as 'percentage_change', so the result needs
        // to reflect this. Will be achieved by simply performing two lookups and
        // aggregating the result.
        if (params.stockLookupType == 'change'){

          return resolve(fetch.stockLookup(resolvedEntity.symbol, {type: 'abs_change'}).then(absChangeResult => {

            // Perform the same query for percentage change.
            return fetch.stockLookup(resolvedEntity.symbol, {type: 'per_change'}).then(percentageChangeResult => {

              // Compose the two values and return the result.
              var composedResultValue = `${absChangeResult.result.value} (${percentageChangeResult.result.value}%)`;

              var composedObject = absChangeResult;

              // Used composed result value.
              composedObject.result.value = composedResultValue;

              // Collect all request attributes into an array for later inspection if need be.
              composedObject.request.attribute = [composedObject.request.attribute, percentageChangeResult.request.attribute];

              // Return the composedObject merged with the input resolvedEntity.
              return Object.assign(composedObject, resolvedEntity);

            });

          }));
        }

        // Fetch and return the spot price for the resolved entity and given stockLookupType.
        // TODO: Proper error handling.
        return resolve(
          fetch.stockLookup(resolvedEntity.symbol, {type: (params.stockLookupType)}).then(result => {
            return Object.assign(result, resolvedEntity);
          })
        );

      }

      // Run a sector / index-wide (ftse) lookup. Keep in mind that this passes the entity name to the delegated
      // script, and not a symbol.
      if (["sector", "ftse"].indexOf(resolvedEntity.entityType) !== -1 && resolvedEntity.name){

        // If no stockLookupType defined, set to 'price'.
        if (!params.stockLookupType) params.stockLookupType = 'price';

        return resolve(fetch.groupLookup(resolvedEntity.name, {type: 'abs_change'}).then(absChangeResult => {

          // Perform the same query for percentage change.
          return fetch.groupLookup(resolvedEntity.name, {type: 'per_change'}).then(percentageChangeResult => {

            // Compose the two values and return the result.
            var composedResultValue = `${absChangeResult.result.value} (${percentageChangeResult.result.value}%)`;

            var composedObject = absChangeResult;

            // Used composed result value.
            composedObject.result.value = composedResultValue;

            // Collect all request attributes into an array for later inspection if need be.
            composedObject.request.attribute = [composedObject.request.attribute, percentageChangeResult.request.attribute];

            // Return the composedObject merged with the input resolvedEntity.
            return Object.assign(composedObject, resolvedEntity);

          });

        }));

        return resolve(fetch.groupLookup(resolvedEntity, {type: params.stockLookupType}).then(res => {
          return Object.assign(res, resolvedEntity);
          })
        );
      }


      // Handle unresolved entities.
      return reject(`Could not resolve financial entity.`);

    });

  });

}
