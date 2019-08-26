const fs = require('fs');
const path = require('path');
const shelljs = require('shelljs');

const logger = require('./utils/logger.js').createLogger('DomainAcmeIssue::Issue');

// use acme.sh in docker image.
function buildIssueDockerCommand(options) {
  let { AcmePath, Domain, DnsMode, EnvParams, EccMode = false, AliasDomain = undefined} = options;

  AcmePath = path.resolve(AcmePath);

  // bind local acme path
  let dockerCommand = `docker run --rm -i -v ${AcmePath}:/acme.sh`
  
  // add env params
  for(let key in EnvParams) {
    dockerCommand += ` -e ${key}="${EnvParams[key]}" `
  }

  // docker image name
  dockerCommand += ` neilpang/acme.sh`;

  // mode 'issue'
  dockerCommand += ` --issue`;

  // issue domain
  dockerCommand += ` -d ${Domain}`;

  // set dns mode
  dockerCommand += ` --dns ${DnsMode}`;

  // if ecc mode
  if(EccMode) { dockerCommand += ` -k ec-256`; }

  // if alias mode
  if(AliasDomain) { dockerCommand += ` --challenge-alias ${AliasDomain}`; }

  logger.debug("buildIssueDockerCommand -> dockerCommand", dockerCommand);
  return dockerCommand;
}

// run docker for issue certificate.
function runAcmeDocker(options, debug = false) {
  let result = { status: false, renew: false, message: ''};
  let acme = shelljs.exec(buildIssueDockerCommand(options), { silent: debug ? false : true });

  if(acme.stderr != '') {
    result.message = acme.stderr;
    return result;
  }

  if(/Cert success/g.test(acme.stdout)) {
    result.status = true;
    result.renew = true;
    result.message = "Cert success";
    return result;
  }

  let skip = /(Skip, Next renewal time is: .+)\n/g.exec(acme.stdout);
  if(skip && skip[1]) {
    result.status = true;
    result.message = skip[1];
    return result;
  }

  result.message = stdout;
  return result;
}

// get cert infomation. it depend acme bind path.
function getCertInfomation(acmePath, domain, ecc = false) {
  let certPath, keyPath, infoPath = "";
  
  if(!ecc) {
    certPath = path.resolve(acmePath, domain, `${domain}.cer`);
    keyPath = path.resolve(acmePath, domain, `${domain}.key`);
    infoPath = path.resolve(acmePath, domain, `${domain}.conf`);
  } else {
    certPath = path.resolve(acmePath, `${domain}_ecc`, `${domain}.cer`);
    keyPath = path.resolve(acmePath, `${domain}_ecc`, `${domain}.key`);
    infoPath = path.resolve(acmePath, `${domain}_ecc`, `${domain}.conf`);
  }

  let Cert = fs.readFileSync(certPath).toString('ascii');
  let Key = fs.readFileSync(keyPath).toString('ascii');
  let info = fs.readFileSync(infoPath).toString('ascii');

  let CreateTime = /Le_CertCreateTime='([0-9]+)'/g.exec(info);
  if(CreateTime && CreateTime[1]) {
    CreateTime = Number(CreateTime[1] + 000);
  } else {
    CreateTime = Date.now();
  }

  let result = {
    CreateTime, Cert, Key
  };

  logger.debug("getCertInfomation -> result", result);
  return result;
}

async function runRenewScript(task) {
  logger.debug("runRenewScript -> task", task);

  let renew = [];
  if(task.EccMode) {
    if(!task.EccRenew || task.EccRenew instanceof Array || task.EccRenew.length === 0) {
      return;
    } else {
      renew = task.EccRenew;
    }
  } else {
    if(!task.Renew || task.Renew instanceof Array || task.Renew.length === 0) {
      return;
    } else {
      renew = task.Renew;
    }
  }
  
  try {
    for(let item of renew) {
      if(typeof item === 'string') {
        logger.info("Run renew script", `Script: ${item}, ECC: ${option.EccMode}`);
        await require(`./renew-script/${item}.js`).run(option, item);
      } else {
        logger.info("Run renew script", `Script: ${item.script}, ECC: ${option.EccMode}`);
        await require(`./renew-script/${item.script}.js`).run(option, item);
      }
    }
  } catch (error) {
    logger.error("runRenewScript", item, error);
  }
}

async function run(tasks, options = {}) {
  let { debug = false, forceRenew = false, forceRunRenewScript = false } = options;
  
  for(let task of tasks) {
    let result = "";
    let CertInfo = {};

    logger.info("Issue Certificate", `Domain: ${task.Domain}, CertType: RSA`);
    result = runAcmeDocker(task, debug);
    logger.info("Issue Result", `Status: ${result.status}, Renew: ${result.renew}, Message: ${result.message}`);
    
    if(result.renew || forceRunRenewScript || forceRenew) {
      CertInfo = getCertInfomation(task.AcmePath, task.Domain);
      logger.debug("run::CertInfo", CertInfo);
      await runRenewScript({ ...task, CertInfo });
    }

    logger.info("Issue Certificate", `Domain: ${task.Domain}, CertType: ECC`);
    CertInfo = runAcmeDocker({...task, EccMode: true }, debug);
    logger.info("Issue Result", `Status: ${result.status}, Renew: ${result.renew}, Message: ${result.message}`);

    if(result.renew || forceRunRenewScript || forceRenew) {
      CertInfo = getCertInfomation(task.AcmePath, task.Domain, true);
      logger.debug("run::CertInfo", CertInfo);
      await runRenewScript({ ...task, CertInfo, EccMode: true });
    }
  }
}

module.exports = {
  run
}