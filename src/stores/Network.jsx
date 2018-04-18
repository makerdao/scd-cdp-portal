import { observable, decorate } from "mobx"
import * as Blockchain from "../blockchainHandler";

class NetworkStore {
  accounts = [];
  defaultAccount = null;
  isConnected = false;
  latestBlock = null;
  network = "";
  outOfSync = true;

  checkNetwork = initContracts => {
    return new Promise((resolve, reject) => {
      let isConnected = null;
      Blockchain.getNode().then(r => {
        isConnected = true;
        Blockchain.getBlock('latest').then(res => {
          if (typeof(res) === 'undefined') {
            console.debug('YIKES! getBlock returned undefined!');
          }
          if (res.number >= this.latestBlock) {
            this.latestBlock = res.number;
            this.outOfSync = ((new Date().getTime() / 1000) - res.timestamp) > 600;
          } else {
            // XXX MetaMask frequently returns old blocks
            // https://github.com/MetaMask/metamask-plugin/issues/504
            console.debug('Skipping old block');
          }
        });
        // because you have another then after this.
        // The best way to handle is to return isConnect;
        return null;
      }, () => {
        isConnected = false;
      }).then(() => {
        if (this.isConnected !== isConnected) {
          if (isConnected === true) {
            let network = false;
            Blockchain.getBlock(0).then(res => {
              switch (res.hash) {
                case '0xa3c565fc15c7478862d50ccd6561e3c06b24cc509bf388941c25ea985ce32cb9':
                  network = 'kovan';
                  break;
                case '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3':
                  network = 'main';
                  break;
                default:
                  console.log('setting network to private');
                  console.log('res.hash:', res.hash);
                  network = 'private';
              }
              if (this.network !== network) {
                this.network = network;
                this.isConnected = true;
                this.latestBlock = 0;
                resolve('reloadContracts')
              } else {
                resolve(null);
              }
            }, () => {
              if (this.network !== network) {
                this.network = network;
                this.isConnected = true;
                this.latestBlock = 0;
                resolve('reloadContracts')
              } else {
                resolve(null);
              }
            });
          } else {
            this.isConnected = isConnected;
            this.network = false;
            this.latestBlock = 0;
            resolve(null)
          }
        }
      }, e => reject(e));
    });
  }

  checkAccounts = () => {
    return new Promise((resolve, reject) => {
      Blockchain.getAccounts().then(accounts => {
        this.accounts = accounts;
        const oldDefaultAccount = this.defaultAccount;
        this.defaultAccount = accounts[0];
        Blockchain.setDefaultAccount(this.defaultAccount);
        if (this.network && oldDefaultAccount !== this.defaultAccount) {
          resolve('reloadContracts');
        } else {
          resolve(null);
        }
      }, e => reject(e));
    });
  }
}

decorate(NetworkStore, {
  accounts: observable,
  defaultAccount: observable,
  isConnected: observable,
  latestBlock: observable,
  network: observable,
  outOfSync: observable,
});

const store = new NetworkStore();
export default store;
