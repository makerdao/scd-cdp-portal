import * as Blockchain from "../blockchainHandler";
import { etherscanTx } from '../helpers';

export function checkPendingTransactions() {
  const transactions = {...this.state.transactions};
  Object.keys(transactions).map(tx => {
    if (transactions[tx].pending) {
      Blockchain.getTransactionReceipt(tx).then(r => {
        if (r !== null) {
          if (r.logs.length === 0) {
            this.logTransactionFailed(tx);
          } else if (r.blockNumber)  {
            this.logTransactionConfirmed(tx);
          }
        }
      })
    }
    return false;
  });
}

export function logRequestTransaction(id, title) {
  const msgTemp = 'Waiting for transaction signature...';
  this.refs.notificator.info(id, title, msgTemp, false);
}

export function logPendingTransaction(id, tx, title, callbacks = []) {
  const msgTemp = 'Transaction TX was created. Waiting for confirmation...';
  const transactions = {...this.state.transactions};
  transactions[tx] = {pending: true, title, callbacks}
  this.setState({transactions});
  console.log(msgTemp.replace('TX', tx));
  this.refs.notificator.hideNotification(id);
  this.refs.notificator.info(tx, title, etherscanTx(this.state.network.network, msgTemp.replace('TX', `${tx.substring(0,10)}...`), tx), false);
}

export function logTransactionConfirmed(tx) {
  const msgTemp = 'Transaction TX was confirmed.';
  const transactions = {...this.state.transactions};
  if (transactions[tx] && transactions[tx].pending) {
    transactions[tx].pending = false;
    this.setState({transactions}, () => {
      console.log(msgTemp.replace('TX', tx));
      this.refs.notificator.hideNotification(tx);
      this.refs.notificator.success(tx, transactions[tx].title, etherscanTx(this.state.network.network, msgTemp.replace('TX', `${tx.substring(0,10)}...`), tx), 4000);
      if (typeof transactions[tx].callbacks !== 'undefined' && transactions[tx].callbacks.length > 0) {
        transactions[tx].callbacks.forEach(callback => this.executeCallback(callback));
      }
    });
  }
}

export function logTransactionFailed(tx) {
  const msgTemp = 'Transaction TX failed.';
  const transactions = {...this.state.transactions};
  if (transactions[tx]) {
    transactions[tx].pending = false;
    this.setState({transactions});
    this.refs.notificator.error(tx, transactions[tx].title, msgTemp.replace('TX', `${tx.substring(0,10)}...`), 4000);
  }
}

export function logTransactionRejected(tx, title) {
  const msgTemp = 'User denied transaction signature.';
  this.refs.notificator.error(tx, title, msgTemp, 4000);
}

export function executeCallback(args) {
  const method = args.shift();
  // If the callback is to execute a getter function is better to wait as sometimes the new value is not uopdated instantly when the tx is confirmed
  const timeout = ['checkProxy', 'checkAllowance', 'lockAndDraw', 'wipeAndFree', 'lock', 'draw', 'wipe', 'free', 'shut', 'give', 'migrateCDP'].indexOf(method) !== -1 ? 0 : 3000;
  // console.log(method, args, timeout);
  setTimeout(() => {
    console.log('executeCallback', method, args);
    this[method](...args);
  }, timeout);
}

export function log(e, tx, id, title, callbacks = []) {
  if (!e) {
    this.logPendingTransaction(id, tx, title, callbacks);
  } else {
    console.log(e);
    this.logTransactionRejected(id, title);
  }
}
