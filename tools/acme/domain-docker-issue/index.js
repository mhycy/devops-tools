const shelljs = require('shelljs');
const Docker = require('dockerode');

const docker = new Docker({socketPath: '/var/run/docker.sock'});

/*
mkdir acme

# 签发RSA证书
docker run --rm -it -v acme:/acme.sh -e CX_Key="XXXXX" -e CX_Secret="XXXXX"  neilpang/acme.sh --issue --dns dns_cx -d '*.mahodou.com'

# 签发ECC证书, ECC证书会在域名路径后面添加 _ecc 后缀
docker run --rm -it -v acme:/acme.sh -e CX_Key="XXXXX" -e CX_Secret="XXXXX"  neilpang/acme.sh --issue -k ec-256 --dns dns_cx -d '*.mahodou.com'
*/

async function runAcmeDocker() {
    docker.createContainer({
        Image: 'ubuntu',
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: ['/bin/bash', '-c', 'tail -f /var/log/dmesg'],
        OpenStdin: false,
        StdinOnce: false
      }).then(function(container) {
        return container.start();
      }).then(function(container) {
        return container.resize({
          h: process.stdout.rows,
          w: process.stdout.columns
        });
      }).then(function(container) {
        return container.stop();
      }).then(function(container) {
        return container.remove();
      }).then(function(data) {
        console.log('container removed');
      }).catch(function(err) {
        console.log(err);
      });
}


(async () => {
    await runAcmeDocker();
})()