// Stores
import DialogStore from "./Dialog";
import NetworkStore from "./Network";
import ProfileStore from "./Profile";
import SystemStore from "./System";
import TransactionsStore from "./Transactions";
import ContentStore from "./Content";

// Utils
import * as blockchain from "../utils/blockchain";
import {isAddress} from "../utils/helpers";

// Settings
import * as settings from "../settings";

class RootStore {
  constructor() {
    this.dialog = new DialogStore(this);
    this.network = new NetworkStore(this);
    this.profile = new ProfileStore(this);
    this.system = new SystemStore(this);
    this.transactions = new TransactionsStore(this);
    this.content = new ContentStore(this);
  }

  setTimeVariablesInterval = () => {
    this.timeVariablesInterval = setInterval(() => {
      this.system.loadVariables(true);
      this.profile.getAccountBalance(this.network.network.defaultAccount);
      this.transactions.setStandardGasPrice();
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
    if (this.network.network && !this.network.stopIntervals) {
      blockchain.resetFilters(true);
      if (typeof this.timeVariablesInterval !== "undefined") clearInterval(this.timeVariablesInterval);
      if (typeof this.nonTimeVariablesInterval !== "undefined") clearInterval(this.nonTimeVariablesInterval);
      if (typeof this.pendingTxInterval !== "undefined") clearInterval(this.pendingTxInterval);
      this.system.reset();

      const topAddress = settings.chain[this.network.network].top;
      const proxyRegistryAddr = settings.chain[this.network.network].proxyRegistry;

      blockchain.loadObject("top", topAddress, "top");
      blockchain.loadObject("proxyregistry", proxyRegistryAddr, "proxyRegistry");

      const setUpPromises = [blockchain.getContractAddr("top", "tub"), blockchain.getContractAddr("top", "tap"), blockchain.getProxy(this.network.defaultAccount)];

      Promise.all(setUpPromises).then(r => {
        if (r[0] && r[1] && isAddress(r[0]) && isAddress(r[1])) {
          const setUpPromises2 = [blockchain.getContractAddr("tub", "vox"), blockchain.getContractAddr("tub", "pit")];

          Promise.all(setUpPromises2).then(r2 => {
            if (r2[0] && r2[1] && isAddress(r2[0]) && isAddress(r2[1])) {
              this.profile.getAccountBalance(this.network.defaultAccount);

              // Set profile proxy and system contracts
              this.profile.setProxy(r[2]);
              this.system.init(topAddress, r[0], r[1], r2[0], r2[1]);
              this.network.stopLoadingAddress();

              this.transactions.setStandardGasPrice();

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

const store = new RootStore();
export default store;
