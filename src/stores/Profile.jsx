// Libraries
import {observable} from "mobx";

// Utils
import * as blockchain from "../utils/blockchain";
import {toBigNumber, isAddress} from "../utils/helpers";

export default class ProfileStore {
  @observable accountBalance = toBigNumber(-1);
  @observable proxy = -1;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  setEthBalanceFromChain = account => {
    if (isAddress(account)) {
      blockchain.getEthBalanceOf(account).then(r => {
        this.accountBalance = r;
      }, () => {});
    }
  }

  setProxyFromChain = (callbacks = null) => {
    return new Promise((resolve, reject) => {
      blockchain.getProxy(this.rootStore.network.defaultAccount).then(proxy => {
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
    blockchain.loadObject("dsproxy", this.proxy, "proxy");
    console.log("proxy", this.proxy);
  }

  checkProxy = callbacks => {
    if (this.proxy) {
      this.rootStore.transactions.executeCallbacks(callbacks);
    } else {
      const title = "Create Proxy";
      this.rootStore.transactions.askPriceAndSend(title, blockchain.objects.proxyRegistry.build, [], {value: 0}, [["profile/setProxyFromChain", callbacks]]);
    }
  }
}
