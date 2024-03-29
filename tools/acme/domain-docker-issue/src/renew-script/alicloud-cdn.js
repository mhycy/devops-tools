
const AliyunPopCore = require('@alicloud/pop-core');
const logger = require('../utils/logger.js').createLogger("Renew::AlicloudCDN");

function updateCert(cdnKey, cdnSecret, options) {
  let { DomainName, ServerCertificateStatus = 'on', ForceSet = '1', CertName, ServerCertificate, PrivateKey, CertType = 'upload' } = options;

  return new Promise((resolve, reject) => {
      // AliCloud CDN client;
      let cdnClient = new AliyunPopCore({
          accessKeyId: cdnKey,
          accessKeySecret: cdnSecret,
          endpoint: 'http://cdn.aliyuncs.com',
          apiVersion: '2018-05-10'
      });

    cdnClient.request(
      'SetDomainServerCertificate',
      {
        DomainName,
        ServerCertificateStatus,
        ForceSet,
        CertName,
        ServerCertificate,
        PrivateKey,
        CertType 
      },
      { method: 'POST' }
    ).then((result) => {
      return resolve({
        status: true,
        ...result
      });
    }, (error) => {
      return resolve({
        status: false,
        message: error.message
      });
    })
  });
}

async function run(taskInfo, renewInfo) {
  let { CreateTime, Cert, Key } = taskInfo.CertInfo;
  let { CdnKey, CdnSecret, SubDomain } = renewInfo;

  for(let domain of SubDomain) {
    logger.info("Renew Certificate", `SubDomain: ${domain}`);
    let result = await updateCert(CdnKey, CdnSecret, {
      DomainName: domain,
      CertName: domain,
      ServerCertificate: Cert,
      PrivateKey: Key
    });
    logger.debug("Renew Certificate Result", result);
  }
}

module.exports = {
  run
}