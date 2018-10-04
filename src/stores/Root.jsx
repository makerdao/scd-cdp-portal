// Stores
import DialogStore from "./Dialog";
import NetworkStore from "./Network";
import ProfileStore from "./Profile";
import SystemStore from "./System";
import TransactionsStore from "./Transactions";
import ContentStore from "./Content";

// Utils
import * as blockchain from "../utils/blockchain";
import * as daisystem from "../utils/dai-system";
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

  setInterval = () => {
    this.timeVariablesInterval = setInterval(() => {
      this.system.setAggregatedValues();
      this.profile.setEthBalanceFromChain();
      this.transactions.setStandardGasPrice();
    }, 5000);
  }

  setPendingTxInterval = () => {
    this.pendingTxInterval = setInterval(() => {
      this.transactions.checkPendingTransactions();
    }, 10000);
  }

  _loadContracts = () => {
    const setUpPromises = [daisystem.getContracts(), blockchain.getProxy(this.network.defaultAccount)];
    Promise.all(setUpPromises).then(r => {
      if (this.transactions.setLatestBlock(r[0][0].toNumber()) && r[0] && r[1] && isAddress(r[0][1]) && isAddress(r[0][2]) && isAddress(r[1])) {
        this.profile.setEthBalanceFromChain();

        // Set profile proxy and system contracts
        this.profile.setProxy(r[1]);
        this.system.init(r[0][1], r[0][2], r[0][3], r[0][4], r[0][5], r[0][6], r[0][7], r[0][8], r[0][9], r[0][10], r[0][11], r[0][12]);
        this.network.stopLoadingAddress();

        this.transactions.setStandardGasPrice();

        // Intervals
        this.setInterval();
        this.setPendingTxInterval();
      } else {
        console.log(`Error loading contracts (latest block ${this.transactions.latestBlock}, request one: ${r[0][0].toNumber()}, trying again...`);
        setTimeout(this._loadContracts, 2000);
      }
    }, () => {
      console.log(`Error loading contracts, trying again...`);
      setTimeout(this._loadContracts, 2000);
    });
  }

  loadContracts = () => {
    if (this.network.network && !this.network.stopIntervals) {
      blockchain.resetFilters(true);
      if (typeof this.timeVariablesInterval !== "undefined") clearInterval(this.timeVariablesInterval);
      if (typeof this.nonTimeVariablesInterval !== "undefined") clearInterval(this.nonTimeVariablesInterval);
      if (typeof this.pendingTxInterval !== "undefined") clearInterval(this.pendingTxInterval);
      this.system.reset();

      // Check actual block number from 3 different requests
      const blockPromises = [];
      for (let i = 0; i < 3; i++) {
        blockPromises.push(blockchain.getBlockNumber());
      }

      Promise.all(blockPromises).then(r => {
        r.forEach(block => this.transactions.setLatestBlock(block));

        blockchain.loadObject("proxyregistry", settings.chain[this.network.network].proxyRegistry, "proxyRegistry");
        blockchain.loadObject("saivaluesaggregator", settings.chain[this.network.network].saiValuesAggregator, "saiValuesAggregator");

        this._loadContracts();
      })
    }
  }
}

const store = new RootStore();
export default store;
