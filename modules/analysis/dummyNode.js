/**
 * Testing data exchange between NODE --> Python.
 *
 * This script parses a command line argument as a message, then passes it to the
 * Python script through STDIN and relays the response from the scritpt's STDOUT
 * to (this) console's STDOUT. *breathes*
 *
 *  [1] "STDIN / STDOUT Documentation On Node",
 *  https://nodejs.org/api/child_process.html#child_process_child_process
 */

// Child process handles spawning new process instances.
const { spawn } = require('child_process');

// Spawn pythonScript, creaitng a pipe for the STDIN, STDOUT and STDERR streams.
var pythonScript = spawn(`python3`, [`node_interface.py`]);

// Pipe each cmdline arg to the python process.
process.argv.slice(2, process.argv.length).forEach(arg => {
  pythonScript.stdin.write(JSON.stringify(arg));
});

pythonScript.stdin.end();

// Report passed arguments.
console.log(`[NODE]: ${process.argv[2]}`);

// Catch STDOUT from Python process.
pythonScript.stdout.on('data', (data) => {
  console.log(`[PYTHON]: ${data}`);
});

// Catch errors from Python process.
pythonScript.stdout.on('error', (err) => {
  console.log(`[PYTHON] | ERROR: ${err}`);
});

// Report end of script.
pythonScript.stdout.on('close', () => {
  console.log(`Python script closed.`)
});
