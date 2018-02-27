/**
 *  Local FTSE cache updater.
 *
 *  Periodically updates the FTSE cache every 15 minutes.
 */

// DEPENDENCIES
// Node-Python interface + reference to update data script.
const path = require('path');
const nodePyInt = require(path.resolve(__dirname, "../modules/analysis/nodePyInt"));
const {spawn} = require("child_process");
const config = require(path.resolve(__dirname, "../config/config"));

const pyScriptsPath = path.resolve(__dirname, "../modules/analysis");
const updateScript = nodePyInt(`${pyScriptsPath}/update_data.py`, null, {cwd: pyScriptsPath});

var interval = (config.updateInterval ? config.updateInterval : (60 * 1000 * 15));

log(`Updating every ${interval}ms.`);

update();
setInterval(() => {
  update();
}, interval);

// Add helper function for update so we can concisely add it outside of the interval for
// running the script on startup as well.
function update(){
  log(`Updating FTSE cache...`);
  updateScript().then(() => {
    log(`Updated.`);
  })
  .catch(err => {
    log(`Error updating cache. ${err}`);
  });
}

function log(msg){
  console.log(`UPDATE | ${msg}`);
}
