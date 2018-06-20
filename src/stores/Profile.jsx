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
          callbacks && this.transactions.executeCallbacks(callbacks);
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
      this.transactions.executeCallbacks(callbacks);
    } else {
      const title = 'Create Proxy';
      this.transactions.setPriceAndSend(title, Blockchain.objects.proxyRegistry.build, [], {value: 0}, [['profile/getAndSetProxy', callbacks]]);
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
