const RouterOS = require('@mhycy/routeros-client');
const AliyuDNS = require('@mhycy/aliyun-dns');

const RouterHost = "192.168.1.1";
const RouterUser = "admin";
const RouterPasswd = "password";
const RouterInterface = "pppoe-out1";

const AliAccessKey = "key";
const AliAccessSecret = "secret";

const Domain = "sub.example.com";
const Type = "A";

const DEBUG = true;

const routerClient = RouterOS.createClient({ host: RouterHost, debug: DEBUG });
const alidnsClient = AliyuDNS.createClient(AliAccessKey, AliAccessSecret, DEBUG);

async function loginRouterOS() {
    let result = await routerClient.login(RouterUser, RouterPasswd);
    if(result && result.status) {
        return true;
    } else {
        console.log("RouterOS login fail.");
        process.exit(0);
    }
}

async function getInterfaceAddress() {
    let interfaceInfo = await routerClient.command("/ip/address/print").equal("interface", RouterInterface).get();
    if(interfaceInfo.status && interfaceInfo.replies && interfaceInfo.replies.length) {
        let address = /([0-9.]+)/.exec(interfaceInfo.replies[0].address)[1];
        return address;
    } else {
        console.log(`Get interface address fail. (Interface: ${RouterInterface})`);
        process.exit(0);
    }
}

async function updateSubDomainAddress(address) {
    let result = await alidnsClient.UpdateRecordBySubDomain({
        SubDomain: Domain,
        Type,
        TargetValue: address
    });

    return result;
}

(async () => {
    try {
        await loginRouterOS();
        
        let address = await getInterfaceAddress();
        let result = await updateSubDomainAddress(address);
        
        if(result.Status && result.Message) {
            console.log(`Domain no need update. { Domain: ${Domain}, Address: ${address} }`);
        } else if(result.Status) {
            console.log(`Address update success. { Domain: ${Domain}, Address: ${address} }`);
        } else {
            console.log(`Address update fail, need debug.`);
        }

        routerClient.close();
    } catch(error) {
        console.error(error);
    }
})()