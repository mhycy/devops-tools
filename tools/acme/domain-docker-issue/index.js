const Ali_Key = "<key>";
const Ali_Secret = "<secret>";
const AliasDomain = "mahodou.com";
const AcmePath = "/etc/acme";

const AliCDN_Key = "<key>";
const AliCDN_Secret = "<secret>";

const tasks = [
  {
    AcmePath, DnsMode: 'dns_ali', EnvParams: { Ali_Key, Ali_Secret },
    Domain: "*.mahodou.com", 
    Renew: [
    //  "nginx"
    ],
    EccRenew: [
      "nginx"
    ]
  },
  {
    AcmePath, DnsMode: 'dns_ali', EnvParams: { Ali_Key, Ali_Secret },
    Domain: "*.0v0.fun", AliasDomain,
    Renew: [
      //  "nginx"
      {
        script: "alicloud-cdn",
        CdnKey: AliCDN_Key,
        CdnSecret: AliCDN_Secret,
        SubDomain: [
          "img.0v0.fun",
          "static.0v0.fun",
        ]
      }
    ],
    EccRenew: [
      "nginx"
    ]
  },
  {
    AcmePath, DnsMode: 'dns_ali', EnvParams: { Ali_Key, Ali_Secret },
    Domain: "*.owo.ac", AliasDomain, 
    Renew: [
      //  "nginx"
    ],
    EccRenew: [
      "nginx"
    ]
  },
  {
    AcmePath, DnsMode: 'dns_ali', EnvParams: { Ali_Key, Ali_Secret },
    Domain: "*.mhycy.me", AliasDomain, 
    Renew: [
      //  "nginx"
    ],
    EccRenew: [
      "nginx"
    ]
  }
]

const Logger = require('./src/utils/logger.js');
Logger.setGlobalLevel(Logger.LEVEL.DEBUG);
const logger = Logger.createLogger('DomainAcmeIssue::Index');

const Issue = require('./src/issue');
(async () => {
  await Issue.run(tasks, {
    debug: false,
    forceRunRenewScript: false,
    forceRenew: true
  });
})()