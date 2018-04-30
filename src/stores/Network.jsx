import { observable, decorate } from "mobx";
import * as Blockchain from "../blockchainHandler";

class NetworkStore {
  accounts = [];
  defaultAccount = null;
  isConnected = false;
  latestBlock = null;
  network = "";
  outOfSync = true;
  isHw = false;
  hw = { show: false, option: null, derivationPath: null, addresses: [], addressIndex: null };

  checkNetwork = () => {
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
        if (!this.isHw) {
          this.defaultAccount = accounts[0];
        }
        Blockchain.setDefaultAccount(this.defaultAccount);
        if (this.network && oldDefaultAccount !== this.defaultAccount) {
          resolve('reloadContracts');
        } else {
          resolve(null);
        }
      }, e => reject(e));
    });
  }

  showHW = option => {
    this.hw.option = option;
    this.hw.show = true;
  }

  loadHWAddresses = derivationPath => {
    this.hw.derivationPath = derivationPath;
    if (this.hw.option === 'ledger') {
      const id = Math.random();
      this.notificator.info(id, 'Connecting to Ledger', 'Getting addresses...', false);
      Blockchain.loadLedgerAddresses(derivationPath, 0).then(addresses => {
        this.hw.addresses = addresses;
        this.notificator.success(id, 'Ledger connected', 'Addresses were loaded', 4000);
      }, e => this.notificator.error(id, 'Error connecting Ledger', e.message, 4000));
    }
  }

  loadMoreHwAddresses = () => {
    if (this.hw.option === 'ledger') {
      const id = Math.random();
      this.notificator.info(id, 'Connecting to Ledger', 'Getting more addresses...', false);
      Blockchain.loadLedgerAddresses(this.hw.derivationPath, this.hw.addresses.length).then(addresses => {
        this.hw.addresses = this.hw.addresses.concat(addresses);
        this.notificator.success(id, 'Ledger connected', 'Addresses were loaded', 4000);
      }, e => this.notificator.error(id, 'Error connecting Ledger', e.message, 4000));
    }
  }

  selectHWAddress = address => {
    this.hw.addressIndex = this.hw.addresses.indexOf(address);
  }

  importAddress = () => {
    this.defaultAccount = this.hw.addresses[this.hw.addressIndex].toLowerCase();
    this.isHw = true;
    this.hw.show = false;
  }

  stopHw = async () => {
    this.defaultAccount = this.accounts[0];
    this.isHw = false;
  }
}

decorate(NetworkStore, {
  accounts: observable,
  defaultAccount: observable,
  isConnected: observable,
  latestBlock: observable,
  network: observable,
  outOfSync: observable,
  hw: observable,
  isHw: observable
});

const store = new NetworkStore();
export default store;
