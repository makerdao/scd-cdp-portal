import { observable, decorate } from "mobx";
import * as Blockchain from "../blockchainHandler";

import { toBigNumber, isAddress } from '../helpers';

class ProfileStore {
  accountBalance = toBigNumber(-1);
  proxy = -1;

  getAccountBalance = account => {
    if (isAddress(account)) {
      Blockchain.getEthBalanceOf(account).then(r => {
        this.accountBalance = r;
      }, () => {});
    }
  }

  getAndSetProxy = (callbacks = null) => {
    return new Promise((resolve, reject) => {
      Blockchain.getProxyAddress(this.transactions.network.defaultAccount).then(proxy => {
        if (proxy) {
          this.setProxy(proxy);
          callbacks && callbacks.forEach(callback => this.transactions.executeCallback(callback));
        }
        resolve(proxy);
      }, () => reject(false));
    });
  }

  setProxy = proxy => {
    this.proxy = proxy;
    Blockchain.loadObject('dsproxy', this.proxy, 'proxy');
    console.log('proxy', this.proxy);
  }

  checkProxy = callbacks => {
    if (this.proxy) {
      callbacks.forEach(callback => this.transactions.executeCallback(callback));
    } else {
      const id = Math.random();
      const title = 'Create Proxy';
      this.transactions.logRequestTransaction(id, title);
      Blockchain.objects.proxyRegistry.build((e, tx) => this.transactions.log(e, tx, id, title, [['profile/getAndSetProxy', callbacks]]));
    }
  }
}

decorate(ProfileStore, {
  accountBalance: observable,
  proxy: observable
});

const store = new ProfileStore();
export default store;

// autorun(() => {
//   console.log('changed', store.address);
// });
