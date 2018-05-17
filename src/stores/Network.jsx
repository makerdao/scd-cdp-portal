import { observable, decorate } from "mobx";
import * as Blockchain from "../blockchainHandler";
import {setHWProvider, setWebClientProvider} from "../web3";
import {isAddress} from '../helpers';

const settings = require('../settings');

class NetworkStore {
  accounts = [];
  defaultAccount = null;
  isConnected = false;
  latestBlock = null;
  network = "";
  outOfSync = true;
  isHw = false;
  hw = {active: false, showModal: false, option: null, derivationPath: null, addresses: [], addressIndex: null};

  checkNetwork = () => {
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
              this.initNetwork(network);
            }
          }, () => {
            if (this.network !== network) {
              this.network = network;
              this.isConnected = true;
              this.latestBlock = 0;
              this.initNetwork(network);
            }
          });
        } else {
          this.isConnected = isConnected;
          this.network = false;
          this.latestBlock = 0;
        }
      }
    }, e => console.log(e));
  }

  initNetwork = newNetwork => {
    this.network = newNetwork;
    this.isConnected = true;
    this.latestBlock = 0;
    this.checkAccounts();
  }

  checkAccounts = () => {
    Blockchain.getAccounts().then(async accounts => {
      const oldDefaultAccount = this.defaultAccount;
      if (!this.hw.active && accounts && accounts[0] !== Blockchain.getDefaultAccount()) {
        await Blockchain.setDefaultAccountByIndex(0);
      }
      this.defaultAccount = Blockchain.getDefaultAccount();
      if (oldDefaultAccount !== this.defaultAccount) {
        this.loadContracts();
      }
    }, () => {});
  }

  // Web3 web client
  setWeb3WebClient = async () => {
    await setWebClientProvider();
    this.checkNetwork();
    this.checkAccountsInterval = setInterval(this.checkAccounts, 1000);
    this.checkNetworkInterval = setInterval(this.checkNetwork, 3000);
  }

  // Hardwallets
  showHW = option => {
    this.hw.option = option;
    this.hw.showModal = true;
  }

  loadHWAddresses = async (network, derivationPath = this.hw.derivationPath) => {
    this.hw.active = true;
    this.hw.derivationPath = derivationPath;
    const id = Math.random();
    try {
      this.notificator.info(id, `Connecting to ${this.hw.option}`, 'Getting addresses...', false);
      await setHWProvider(this.hw.option, network, `${derivationPath.replace('m/', '')}/0`, 0, this.hw.addresses.length + 5);
      const accounts = await Blockchain.getAccounts();
      this.hw.addresses = accounts;
      this.notificator.success(id, `${this.hw.option} connected`, 'Addresses were loaded', 4000);
    } catch(e) {
      this.notificator.error(id, `Error connecting ${this.hw.option}`, e.message, 4000);
    }
  }

  selectHWAddress = address => {
    this.hw.addressIndex = this.hw.addresses.indexOf(address);
  }

  importAddress = async () => {
    this.hw.showModal = false;
    await Blockchain.setDefaultAccountByIndex(this.hw.addressIndex);
    this.checkNetwork();
    this.checkAccountsInterval = setInterval(this.checkAccounts, 1000);
    this.checkNetworkInterval = setInterval(this.checkNetwork, 3000);
  }
  //

  setTimeVariablesInterval = () => {
    this.timeVariablesInterval = setInterval(() => {
      this.system.loadVariables(true);
      this.profile.getAccountBalance(this.network.defaultAccount);
    }, 5000);
  }

  setNonTimeVariablesInterval = () => {
    // This interval should not be necessary if we can rely on the events
    this.nonTimeVariablesInterval = setInterval(() => {
      this.system.loadVariables();
    }, 30000);
  }

  setPendingTxInterval = () => {
    this.pendingTxInterval = setInterval(() => {
      this.transactions.checkPendingTransactions();
    }, 10000);
  }

  loadContracts = () => {
    Blockchain.resetFilters(true);
    if (typeof this.timeVariablesInterval !== 'undefined') clearInterval(this.timeVariablesInterval);
    if (typeof this.nonTimeVariablesInterval !== 'undefined') clearInterval(this.nonTimeVariablesInterval);
    if (typeof this.pendingTxInterval !== 'undefined') clearInterval(this.pendingTxInterval);
    this.system.clear();

    const topAddress = settings.chain[this.network].top;
    const proxyRegistryAddr = settings.chain[this.network].proxyRegistry;

    Blockchain.loadObject('top', topAddress, 'top');
    Blockchain.loadObject('proxyregistry', proxyRegistryAddr, 'proxyRegistry');

    const setUpPromises = [Blockchain.getContractAddr('top', 'tub'), Blockchain.getContractAddr('top', 'tap'), Blockchain.getProxyAddress(this.defaultAccount)];

    Promise.all(setUpPromises).then(r => {
      if (r[0] && r[1] && isAddress(r[0]) && isAddress(r[1])) {
        const setUpPromises2 = [Blockchain.getContractAddr('tub', 'vox'), Blockchain.getContractAddr('tub', 'pit')];

        Promise.all(setUpPromises2).then(r2 => {
          if (r2[0] && r2[1] && isAddress(r2[0]) && isAddress(r2[1])) {
            this.profile.getAccountBalance(this.defaultAccount);

            // Set profile proxy and system contracts
            this.profile.setProxy(r[2])
            this.system.init(topAddress, r[0], r[1], r2[0], r2[1]);

            // Intervals
            this.setTimeVariablesInterval();
            this.setNonTimeVariablesInterval();
            this.setPendingTxInterval();
          } else {
            console.log('Error getting vox & pit');
          }
        }, () => console.log('Error getting vox & pit'));
      } else {
        console.log('Error getting tub, tap or proxy registry');
      }
    }, () => console.log('Error getting tub, tap or proxy registry'));
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
