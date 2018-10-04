// Libraries
import {observable} from "mobx";

// Utils
import * as blockchain from "../utils/blockchain";
import {toBigNumber} from "../utils/helpers";

export default class ProfileStore {
  @observable accountBalance = toBigNumber(-1);
  @observable proxy = -1;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  setEthBalanceFromChain = () => {
    blockchain.getEthBalanceOf(this.rootStore.network.defaultAccount).then(r => {
      this.accountBalance = r;
    }, () => {});
  }

  setProxyFromChain = (callbacks = null) => {
    return new Promise((resolve, reject) => {
      console.log("Checking proxy...")
      blockchain.getProxy(this.rootStore.network.defaultAccount).then(proxy => {
        if (proxy) {
          this.setProxy(proxy);
          callbacks && this.rootStore.transactions.executeCallbacks(callbacks);
          resolve(proxy);
        } else {
          // We force to check again until we get the result
          console.log("Proxy still not found, trying again in 3 seconds...");
          setTimeout(() => this.setProxyFromChain(callbacks), 3000);
          reject(false);
        }
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
      const params = {value: 0};
      if (this.rootStore.network.hw.active) {
        params.gas = 1000000;
      }
      this.rootStore.transactions.askPriceAndSend(title, blockchain.objects.proxyRegistry.build, [], params, [["profile/setProxyFromChain", callbacks]]);
    }
  }
}
