// Libraries
import { observable, decorate } from "mobx";

// Stores
import ProfileStore from "./Profile";
import SystemStore from "./System";
import TransactionsStore from "./Transactions";

// Utils
import * as Blockchain from "../utils/blockchain-handler";
import {isAddress} from "../utils/helpers";

// Settings
import * as settings from "../settings";

class NetworkStore {
  stopIntervals = false;
  loadingAddress = false;
  accounts = [];
  defaultAccount = null;
  isConnected = false;
  latestBlock = null;
  network = "";
  outOfSync = true;
  isHw = false;
  hw = {active: false, showSelector: false, option: null, derivationPath: null, addresses: [], loading: false, error: null};
  downloadClient = false;

  checkNetwork = () => {
    let isConnected = null;
    Blockchain.getNode().then(r => {
      isConnected = true;
      Blockchain.getBlock("latest").then(res => {
        if (typeof(res) === "undefined") {
          console.debug("YIKES! getBlock returned undefined!");
        }
        if (res.number >= this.latestBlock) {
          this.latestBlock = res.number;
          this.outOfSync = ((new Date().getTime() / 1000) - res.timestamp) > 600;
        } else {
          // XXX MetaMask frequently returns old blocks
          // https://github.com/MetaMask/metamask-plugin/issues/504
          console.debug("Skipping old block");
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
              case "0xa3c565fc15c7478862d50ccd6561e3c06b24cc509bf388941c25ea985ce32cb9":
                network = "kovan";
                break;
              case "0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3":
                network = "main";
                break;
              default:
                console.log("setting network to private");
                console.log("res.hash:", res.hash);
                network = "private";
            }
            if (!this.stopIntervals // To avoid race condition
                && this.network !== network) {
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

  stopNetwork = () => {
    this.stopIntervals = true;
    Blockchain.stopProvider();
    clearInterval(this.checkAccountsInterval);
    clearInterval(this.checkNetworkInterval);
    this.network = "";
    this.hw = {active: false, showSelector: false, option: null, derivationPath: null, addresses: [], loading: false, error: null};
    this.accounts = [];
    this.defaultAccount = null;
    this.isConnected = false;
    this.latestBlock = null;
    this.outOfSync = true;
    this.isHw = false;
  }

  checkAccounts = () => {
    Blockchain.getAccounts().then(async accounts => {
      if (this.network && !this.hw.active && accounts && accounts[0] !== Blockchain.getDefaultAccount()) {
        const account = await Blockchain.getDefaultAccountByIndex(0);
        if (!this.stopIntervals) { // To avoid race condition
          Blockchain.setDefaultAccount(account);
        }
      }
      if (!this.stopIntervals) { // To avoid race condition
        const oldDefaultAccount = this.defaultAccount;
        this.defaultAccount = Blockchain.getDefaultAccount();
        if (this.defaultAccount && oldDefaultAccount !== this.defaultAccount) {
          this.loadContracts();
        }
        if (!this.defaultAccount) {
          this.loadingAddress = false;
        }
      }
    }, () => {});
  }

  // Web3 web client
  setWeb3WebClient = async () => {
    try {
      this.stopIntervals = false;
      this.loadingAddress = true;
      await Blockchain.setWebClientProvider();
      this.checkNetwork();
      this.checkAccountsInterval = setInterval(this.checkAccounts, 1000);
      this.checkNetworkInterval = setInterval(this.checkNetwork, 3000);
    } catch (e) {
      this.loadingAddress = false;
      this.downloadClient = true;
      console.log(e);
    }
  }

  // Hardwallets
  showHW = option => {
    this.hw.option = option;
    this.hw.showSelector = true;
    this.loadHWAddresses();
  }

  hideHw = () => {
    this.hw.active = false;
    this.hw.loading = false;
    this.hw.showSelector = false;
    this.hw.option = "";
    this.hw.derivationPath = false;
  }

  loadHWAddresses = async () => {
    this.hw.loading = true;
    this.hw.active = true;
    this.hw.error = false;
    this.hw.derivationPath = this.hw.option === "ledger" ? "m/44'/60'/0'" : "m/44'/60'/0'/0";
    try {
      await Blockchain.setHWProvider(this.hw.option, settings.hwNetwork, `${this.hw.derivationPath.replace("m/", "")}/0`, 0, 50);
      const accounts = await Blockchain.getAccounts();
      this.hw.addresses = accounts;
    } catch(e) {
      Blockchain.stopProvider();
      this.hw.error = `Error connecting ${this.hw.option}: ${e.message}`;
    } finally {
      this.hw.loading = false;
    }
  }

  importAddress = account => {
    try {
      this.stopIntervals = false;
      this.loadingAddress = true;
      this.hw.showSelector = false;
      Blockchain.setDefaultAccount(account);
      this.checkNetwork();
      this.checkAccountsInterval = setInterval(this.checkAccounts, 1000);
      this.checkNetworkInterval = setInterval(this.checkNetwork, 3000);
    } catch(e) {
      this.loadingAddress = false;
      this.hw.showSelector = true;
      this.hw.addressIndex = null;
      this.hw.addresses = [];
      Blockchain.stopProvider();
      this.hw.error = `Error connecting ${this.hw.option}: ${e.message}`;
    }
  }
  //

  setTimeVariablesInterval = () => {
    this.timeVariablesInterval = setInterval(() => {
      SystemStore.loadVariables(true);
      ProfileStore.getAccountBalance(this.network.defaultAccount);
      TransactionsStore.setStandardGasPrice();
    }, 5000);
  }

  setNonTimeVariablesInterval = () => {
    // This interval should not be necessary if we can rely on the events
    this.nonTimeVariablesInterval = setInterval(() => {
      SystemStore.loadVariables();
    }, 30000);
  }

  setPendingTxInterval = () => {
    this.pendingTxInterval = setInterval(() => {
      TransactionsStore.checkPendingTransactions();
    }, 10000);
  }

  loadContracts = () => {
    if (this.network && !this.stopIntervals) {
      Blockchain.resetFilters(true);
      if (typeof this.timeVariablesInterval !== "undefined") clearInterval(this.timeVariablesInterval);
      if (typeof this.nonTimeVariablesInterval !== "undefined") clearInterval(this.nonTimeVariablesInterval);
      if (typeof this.pendingTxInterval !== "undefined") clearInterval(this.pendingTxInterval);
      SystemStore.clear();

      const topAddress = settings.chain[this.network].top;
      const proxyRegistryAddr = settings.chain[this.network].proxyRegistry;

      Blockchain.loadObject("top", topAddress, "top");
      Blockchain.loadObject("proxyregistry", proxyRegistryAddr, "proxyRegistry");

      const setUpPromises = [Blockchain.getContractAddr("top", "tub"), Blockchain.getContractAddr("top", "tap"), Blockchain.getProxy(this.defaultAccount)];

      Promise.all(setUpPromises).then(r => {
        if (r[0] && r[1] && isAddress(r[0]) && isAddress(r[1])) {
          const setUpPromises2 = [Blockchain.getContractAddr("tub", "vox"), Blockchain.getContractAddr("tub", "pit")];

          Promise.all(setUpPromises2).then(r2 => {
            if (r2[0] && r2[1] && isAddress(r2[0]) && isAddress(r2[1])) {
              ProfileStore.getAccountBalance(this.defaultAccount);

              // Set profile proxy and system contracts
              ProfileStore.setProxy(r[2]);
              SystemStore.init(topAddress, r[0], r[1], r2[0], r2[1]);
              this.loadingAddress = false;

              TransactionsStore.setStandardGasPrice();

              // Intervals
              this.setTimeVariablesInterval();
              this.setNonTimeVariablesInterval();
              this.setPendingTxInterval();
            } else {
              console.log("Error getting vox & pit");
            }
          }, () => console.log("Error getting vox & pit"));
        } else {
          console.log("Error getting tub, tap or proxy registry");
        }
      }, () => console.log("Error getting tub, tap or proxy registry"));
    }
  }
}

decorate(NetworkStore, {
  stopIntervals: observable,
  loadingAddress: observable,
  accounts: observable,
  defaultAccount: observable,
  isConnected: observable,
  latestBlock: observable,
  network: observable,
  outOfSync: observable,
  hw: observable,
  isHw: observable,
  downloadClient: observable
});

const store = new NetworkStore();
export default store;
