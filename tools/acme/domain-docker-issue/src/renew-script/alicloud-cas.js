const logger = require('../utils/logger.js').createLogger("Renew::AlicloudCAS");

// AliCloud CAS client;
const casClient = new AliyunPopCore({
  accessKeyId: AliCAS_Key,
  accessKeySecret: AliCAS_Secret,
  endpoint: 'https://cas.aliyuncs.com',
  apiVersion: '2018-07-13'
});
