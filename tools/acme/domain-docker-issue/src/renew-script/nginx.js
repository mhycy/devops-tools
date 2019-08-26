const shelljs = require('shelljs');
const logger = require('../utils/logger.js').createLogger("Renew::Nginx");

function reloadNginx(command) {
  let result = { status: false, message: ''};
  let cmdResult = "";
  if(!command) {
    cmdResult = shelljs.exec('/usr/sbin/service nginx force-reload');
  } else {
    cmdResult = shelljs.exec(command);
    logger.debug("reloadNginx", command);
  }
  
  if(cmdResult.stderr) {
    result.message = cmdResult.stderr.trim();
    return result;
  }
  
  result.status = true;
  return result;
}

module.exports = {
  run: function(taskInfo, renewInfo) {
    if(typeof renewInfo != 'string' && renewInfo.command) {
      return reloadNginx(command);
    } else {
      return reloadNginx();
    }
  }
};