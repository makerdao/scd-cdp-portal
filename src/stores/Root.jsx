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

  setVariablesInterval = () => {
    this.interval = setInterval(() => {
      console.log("Interval");
      this.system.setAggregatedValues();
      this.transactions.setStandardGasPrice();
      this.transactions.checkPendingTransactions();
    }, 10000);
  }

  _loadContracts = () => {
    daisystem.getContracts(settings.chain[this.network.network].proxyRegistry, this.network.defaultAccount).then(r => {
      if (r && this.transactions.setLatestBlock(r[0].toNumber()) && r[1] && isAddress(r[1][0]) && isAddress(r[1][1])) {
        // Set profile proxy and system contracts
        this.profile.setProxy(r[2]);
        this.system.init(r[1][0], r[1][1], r[1][2], r[1][3], r[1][4], r[1][5], r[1][6], r[1][7], r[1][8], r[1][9], r[1][10], r[1][11]);
        this.network.stopLoadingAddress();
        this.transactions.setStandardGasPrice();

        this.setVariablesInterval();
      } else {
        console.log(`Error loading contracts (latest block ${this.transactions.latestBlock}, request one: ${r[0].toNumber()}, trying again...`);
        this.transactions.addAmountCheck();
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
      if (typeof this.interval !== "undefined") clearInterval(this.interval);
      this.system.reset();
      this.transactions.reset();

      // Check actual block number from 3 different requests (workaround to try to avoid outdated nodes behind load balancer)
      const blockPromises = [];
      for (let i = 0; i < 3; i++) {
        blockPromises.push(blockchain.getBlockNumber());
      }

      Promise.all(blockPromises).then(r => {
        r.forEach(block => this.transactions.setLatestBlock(block)); // Will set the maximum value

        blockchain.loadObject("proxyregistry", settings.chain[this.network.network].proxyRegistry, "proxyRegistry");
        blockchain.loadObject("saivaluesaggregator", settings.chain[this.network.network].saiValuesAggregator, "saiValuesAggregator");

        this._loadContracts();
      })
    }
  }
}

const store = new RootStore();
export default store;
