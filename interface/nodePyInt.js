/**
 * Node interface for communicating with Python scripts.
 *
 * Takes arguments from the module entry point, then passes it to the
 * Python script through STDIN and relays the response from the scritpt's STDOUT
 * to an accumulating variable which is collected on close of the script by a
 * callback.
 *
 *  [1] "STDIN / STDOUT Documentation On Node",
 *  https://nodejs.org/api/child_process.html#child_process_child_process
 */

// Child process handles spawning new process instances.
const { spawn } = require('child_process');

var __DEBUG = false;

// Define module entry point.
module.exports = (path, data, args, ops) => {

  // Prepare args if empty.
  if (!args) args = [];

  // Return promise.
  return new Promise((resolve, reject) => {

      __DEBUG = ops && ops.debug ? ops.debug : false;

      // Spawn the child process.
      var pyProc = spawn((ops && ops.pythonCmd ? ops.pythonCmd : "python"), [path, ...args]);

      // Report initiation of script.
      log(`${path} spawned with args: ${args}`);

      // Inject data.
      if (data) pyProc.stdin.write(JSON.stringify(data));

      // Notify end of data write.
      if (data) pyProc.stdin.end();

      // On successful data output, resolve the Promise.s
      pyProc.stdout.on('data', (data) => {
        resolve(JSON.parse(data.toString('utf8')));
      });

      // On error, reject the promise.s
      pyProc.stdout.on('error', (err) => {
        reject(err);
      });

  });


}

function log(msg){
  if (__DEBUG) console.log(`nodePyInt | ${msg}`);
}
