// Libraries
import { observable, decorate } from "mobx";

// Stores
import TransactionsStore from "./Transactions";

// Utils
import * as Blockchain from "../utils/blockchain-handler";
import { toBigNumber, isAddress } from "../utils/helpers";

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
      Blockchain.getProxy(TransactionsStore.network.defaultAccount).then(proxy => {
        if (proxy) {
          this.setProxy(proxy);
          callbacks && TransactionsStore.executeCallbacks(callbacks);
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
      TransactionsStore.executeCallbacks(callbacks);
    } else {
      const title = "Create Proxy";
      TransactionsStore.askPriceAndSend(title, Blockchain.objects.proxyRegistry.build, [], {value: 0}, [["profile/getAndSetProxy", callbacks]]);
    }
  }
}

decorate(ProfileStore, {
  accountBalance: observable,
  proxy: observable
});

const store = new ProfileStore();
export default store;
