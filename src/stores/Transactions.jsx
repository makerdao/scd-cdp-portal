import {observable, decorate, computed} from "mobx";
import * as Blockchain from "../blockchainHandler";

import NetworkStore from "./Network";

import {etherscanTx, methodSig} from '../helpers';

const settings = require('../settings');

class TransactionsStore {
  registry = {};
  loading = {};
  cdpCreationTx = false;
  standardGasPrice = -1;
  priceModal = { open: false, title: null, func: null, params: null, options: {}, callbacks: null };

  get showCreatingCdpModal() {
    const txs = Object.keys(this.registry).filter(tx => this.registry[tx].cdpCreationTx);
    return txs.length > 0;
  }

  setStandardGasPrice = async () => {
    this.standardGasPrice = (await Blockchain.getGasPrice()).div(10**9).ceil().toNumber();
  }

  checkPendingTransactions = () => {
    Object.keys(this.registry).map(tx => {
      if (this.registry[tx].pending) {
        Blockchain.getTransactionReceipt(tx).then(r => {
          if (r !== null) {
            if (r.status === "0x1") {
              this.logTransactionConfirmed(tx);
            } else {
              this.logTransactionFailed(tx);
            }
          }
        })
      }
      return false;
    });
  }

  cleanCdpCreationProperty = tx => {
    const registry = {...this.registry};
    registry[tx].cdpCreationTx = false;
    this.registry = registry;
  }

  logRequestTransaction = (id, title, cdpCreationTx) => {
    this.cdpCreationTx = cdpCreationTx;
    const msgTemp = 'Waiting for transaction signature...';
    this.notificator.info(id, title, msgTemp, false);
  }

  closePriceModal = () => {
    this.lookForCleanCallBack(this.priceModal.callbacks);
    this.priceModal = { open: false, title: null, func: null, params: null, options: {}, callbacks: null };
  }

  sendTransaction = (title, func, params, options, callbacks) => {
    const cdpCreationTx = params[0] === settings.chain[NetworkStore.network].proxyRegistry || // This means it is calling to the createLockAndDraw
                          (typeof params[1] === 'string' && methodSig('lockAndDraw(address,uint256)') === params[1].substring(0, 10));
    const id = Math.random();
    this.logRequestTransaction(id, title, cdpCreationTx);
    func(...params, options, (e, tx) => this.log(e, tx, id, title, callbacks));
  }

  askPriceAndSend = (title, func, params, options, callbacks) => {
    if (NetworkStore.hw.active) { // If user is using HW, gas price modal will appear
      this.priceModal = { open: true, title, func, params, options, callbacks };
    } else {
      this.sendTransaction(title, func, params, options, callbacks);
    }
  }

  setPriceAndSend = gasPriceGwei => {
    const {func, params, options, title, callbacks} = {...this.priceModal};
    options.gasPrice = gasPriceGwei * 10 ** 9;
    this.priceModal = { open: false, title: null, func: null, params: null, options: {}, callbacks: null };
    this.sendTransaction(title, func, params, options, callbacks);
  }

  logPendingTransaction = (id, tx, title, callbacks = []) => {
    const msgTemp = 'Transaction TX was created. Waiting for confirmation...';
    const registry = {...this.registry};
    registry[tx] = {pending: true, title, callbacks, cdpCreationTx: this.cdpCreationTx};
    this.registry = registry;
    this.cdpCreationTx = false;
    console.log(msgTemp.replace('TX', tx));
    this.notificator.hideNotification(id);
    if (!this.registry[tx].cdpCreationTx) {
      this.notificator.info(tx, title, etherscanTx(NetworkStore.network, msgTemp.replace('TX', `${tx.substring(0,10)}...`), tx), false);
    }
  }

  logTransactionConfirmed = tx => {
    const msgTemp = 'Transaction TX was confirmed.';
    if (this.registry[tx] && this.registry[tx].pending) {
      const registry = {...this.registry};
      registry[tx].pending = false;
      this.registry = registry;
      console.log(msgTemp.replace('TX', tx));
      this.notificator.hideNotification(tx);
      if (!this.registry[tx].cdpCreationTx) {
        this.notificator.success(tx, this.registry[tx].title, etherscanTx(NetworkStore.network, msgTemp.replace('TX', `${tx.substring(0,10)}...`), tx), 6000);
      }
      if (typeof this.registry[tx].callbacks !== 'undefined' && this.registry[tx].callbacks.length > 0) {
        this.registry[tx].callbacks.forEach(callback => this.executeCallback(callback));
      }
    }
  }

  logTransactionFailed = tx => {
    const msgTemp = 'Transaction TX failed.';
    if (this.registry[tx]) {
      const registry = {...this.registry};
      registry[tx].pending = false;
      registry[tx].cdpCreationTx = false;
      this.registry = registry;
      console.log(msgTemp.replace('TX', tx));
      this.notificator.error(tx, this.registry[tx].title, msgTemp.replace('TX', `${tx.substring(0,10)}...`), 5000);
      this.lookForCleanCallBack(this.registry[tx].callbacks);
    }
  }

  logTransactionRejected = (id, title, callbacks = []) => {
    const msg = 'User denied transaction signature.';
    this.notificator.error(id, title, msg, 5000);
    this.lookForCleanCallBack(callbacks);
  }

  log = (e, tx, id, title, callbacks = []) => {
    if (!e) {
      this.logPendingTransaction(id, tx, title, callbacks);
    } else {
      this.logTransactionRejected(id, title, callbacks);
    }
  }

  addLoading = (method, param) => {
    const loading = {...this.loading};
    if (typeof loading[method] === 'undefined') loading[method] = {};
    loading[method][param] = true;
    this.loading = loading;
  }

  cleanLoading = (method, param) => {
    const loading = {...this.loading};
    loading[method][param] = false;
    this.loading = loading;
  }

  lookForCleanCallBack = (callbacks = []) => {
    callbacks.forEach(callback => {
      if (callback[0] === 'transactions/cleanLoading') {
        this.executeCallback(callback)
      }
      if (typeof callback[callback.length - 1] === 'object') {
        this.lookForCleanCallBack(callback[callback.length - 1]);
      }
    });
  }

  executeCallbacks = callbacks => {
    callbacks.forEach(callback => this.executeCallback(callback));
  }

  executeCallback = args => {
    let method = args.shift();
    // If the callback is to execute a getter function is better to wait as sometimes the new value is not uopdated instantly when the tx is confirmed
    const timeout = ['transactions/cleanLoading', 'system/setAllowance', 'system/checkAllowance', 'system/lockAndDraw', 'system/wipeAndFree', 'system/lock', 'system/draw', 'system/wipe', 'system/free', 'system/shut', 'system/give', 'system/migrateCDP', 'system/moveLegacyCDP'].indexOf(method) !== -1 ? 0 : 5000;
    setTimeout(() => {
      method = method.split('/');
      console.log('executeCallback', `${method[0]}.${method[1]}`, args);
      if (method[0] === 'transactions') {
        this[method[1]](...args);
      } else {
        this[method[0]][method[1]](...args);
      }
    }, timeout);
  }
}

decorate(TransactionsStore, {
  registry: observable,
  loading: observable,
  standardGasPrice: observable,
  priceModal: observable,
  showCreatingCdpModal: computed
});

const store = new TransactionsStore();
export default store;
