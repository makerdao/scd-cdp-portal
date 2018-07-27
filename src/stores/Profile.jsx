// Libraries
import { observable, decorate } from "mobx";

// Utils
import * as Blockchain from "../utils/blockchain-handler";
import { toBigNumber, isAddress } from "../utils/helpers";

export default class ProfileStore {
  accountBalance = toBigNumber(-1);
  proxy = -1;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  getAccountBalance = account => {
    if (isAddress(account)) {
      Blockchain.getEthBalanceOf(account).then(r => {
        this.accountBalance = r;
      }, () => {});
    }
  }

  getAndSetProxy = (callbacks = null) => {
    return new Promise((resolve, reject) => {
      Blockchain.getProxy(this.rootStore.transactions.network.defaultAccount).then(proxy => {
        if (proxy) {
          this.setProxy(proxy);
          callbacks && this.rootStore.transactions.executeCallbacks(callbacks);
        }
        resolve(proxy);
      }, () => reject(false));
    });
  }

  setProxy = proxy => {
    this.proxy = proxy;
    Blockchain.loadObject("dsproxy", this.proxy, "proxy");
    console.log("proxy", this.proxy);
  }

  checkProxy = callbacks => {
    if (this.proxy) {
      this.rootStore.transactions.executeCallbacks(callbacks);
    } else {
      const title = "Create Proxy";
      this.rootStore.transactions.askPriceAndSend(title, Blockchain.objects.proxyRegistry.build, [], {value: 0}, [["profile/getAndSetProxy", callbacks]]);
    }
  }
}

decorate(ProfileStore, {
  accountBalance: observable,
  proxy: observable
});
