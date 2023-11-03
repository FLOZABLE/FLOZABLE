const fs = require('fs');

const logFile = fs.createWriteStream('err.log', {flags: 'a'});

function writeLog (err) {
  if (process.env.log === 'console') {
    console.log(err);
  } else {
    logFile.write(err);
  }
}
module.exports = {logFile, writeLog};