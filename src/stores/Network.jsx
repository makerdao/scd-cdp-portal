// Libraries
import {observable} from "mobx";

// Utils
import * as blockchain from "../utils/blockchain";
import { getTransactionToastTitle } from "../utils/helpers";

// Settings
import * as settings from "../settings";

export default class NetworkStore {
  @observable stopIntervals = false;
  @observable loadingAddress = false;
  @observable accounts = [];
  @observable defaultAccount = null;
  @observable isConnected = false;
  @observable latestBlock = null;
  @observable network = "";
  @observable outOfSync = true;
  @observable hw = {active: false, showSelector: false, option: null, derivationPath: null, addresses: [], loading: false, error: null};
  @observable isHw = false;
  @observable downloadClient = false;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  startTransactionMonitor = () => {
    // TODO: Remove hooks or prevent this from being called more than once if wallet is changed

    // Transaction hooks to manage UI toasts etc
    window.maker.service('transactionManager').onNewTransaction(tx => {
      const metadata = tx.metadata;
      const contract = metadata && metadata.hasOwnProperty('contract') ? metadata.contract : '';
      const method = metadata && metadata.hasOwnProperty('method') ? metadata.method : '';

      // TODO: Use a better approach to generating random id
      const tempId = Math.random();
      const title = getTransactionToastTitle(tx.metadata);
      this.rootStore.transactions.logRequestTransaction(tempId, title, false);

      tx.onPending(tx => {
        console.debug(`Created transaction with hash: ${tx.hash()}`);
        this.rootStore.transactions.logPendingTransaction(tempId, tx.hash(), title);
      });
      tx.onMined(tx => {
        console.debug(`Mined tx ${tx.hash()}`);
        this.rootStore.transactions.logTransactionConfirmed(tx.hash());
        // if (method === 'approve') this.rootStore.transactions.cleanLoading("changeAllowance", contract.toLowerCase().replace("mkr", "gov"));
        if (method === 'approve') this.rootStore.system.setAllowanceFromChain(contract.toLowerCase().replace("mkr", "gov"));
      });
      tx.onError(err => {
        console.debug("Caught error:",err);
        this.rootStore.transactions.logTransactionRejected(tempId, title)
        // if (method === 'approve') this.rootStore.transactions.cleanLoading("changeAllowance", contract.toLowerCase().replace("mkr", "gov"));
        if (method === 'approve') this.rootStore.system.setAllowanceFromChain(contract.toLowerCase().replace("mkr", "gov"));
      });
    });
  }

  setNetwork = async () => {
    try {
      const result = await blockchain.checkNetwork(this.isConnected, this.network);
      Object.keys(result.data).forEach(key => { this[key] = result.data[key]; });
      if (!this.stopIntervals && result.status) {
        this.setAccount();
        if (!this.hw.active) {
          this.setAccountInterval = setInterval(this.setAccount, 1000);
        }
      }
    } catch(e) {
      console.log(e);
    }
  }

  stopNetwork = () => {
    this.stopIntervals = true;
    blockchain.stopProvider();
    clearInterval(this.setAccountInterval);
    clearInterval(this.setNetworkInterval);
    this.network = "";
    this.hw = {active: false, showSelector: false, option: null, derivationPath: null, addresses: [], loading: false, error: null};
    this.accounts = [];
    this.defaultAccount = null;
    this.isConnected = false;
    this.latestBlock = null;
    this.outOfSync = true;
    this.isHw = false;
  }

  setAccount = () => {
    blockchain.getAccounts().then(async accounts => {
      if (this.network && !this.hw.active && accounts && accounts[0] !== blockchain.getDefaultAccount()) {
        const account = await blockchain.getDefaultAccountByIndex(0);
        if (!this.stopIntervals) { // To avoid race condition
          blockchain.setDefaultAccount(account);
        }
      }
      if (!this.stopIntervals) { // To avoid race condition
        const oldDefaultAccount = this.defaultAccount;
        this.defaultAccount = blockchain.getDefaultAccount();
        if (this.defaultAccount && oldDefaultAccount !== this.defaultAccount) {
          this.rootStore.loadContracts();
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
      await blockchain.setWebClientProvider();
      this.setNetwork();
      this.setNetworkInterval = setInterval(this.setNetwork, 3000);
      this.startTransactionMonitor();
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
      await blockchain.setHWProvider(this.hw.option, settings.hwNetwork, `${this.hw.derivationPath.replace("m/", "")}/0`, 0, 50);
      const accounts = await blockchain.getAccounts();
      this.hw.addresses = accounts;
    } catch(e) {
      blockchain.stopProvider();
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
      blockchain.setDefaultAccount(account);
      this.setNetwork();
      this.setNetworkInterval = setInterval(this.setNetwork, 10000);
    } catch(e) {
      this.loadingAddress = false;
      this.hw.showSelector = true;
      this.hw.addressIndex = null;
      this.hw.addresses = [];
      blockchain.stopProvider();
      this.hw.error = `Error connecting ${this.hw.option}: ${e.message}`;
    }
  }
  //

  stopLoadingAddress = () => {
    this.loadingAddress = false;
  }
}
