// Libraries
import {observable} from "mobx";

// Utils
import * as blockchain from "../utils/blockchain";
import * as daisystem from "../utils/dai-system";

// Settings
import * as settings from "../settings";

export default class ProfileStore {
  @observable proxy = -1;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  setProxyFromChain = (callbacks = null) => {
    return new Promise((resolve, reject) => {
      console.log("Checking proxy...")
      daisystem.getContracts(settings.chain[this.rootStore.network.network].proxyRegistry, this.rootStore.network.defaultAccount).then(r => {
        if (r && r[2] && this.rootStore.transactions.setLatestBlock(r[0].toNumber())) {
          this.setProxy(r[2]);
          callbacks && this.rootStore.transactions.executeCallbacks(callbacks);
          resolve(r[2]);
        } else {
          // We force to check again until we get the result
          console.log("Proxy still not found, trying again in 3 seconds...");
          setTimeout(() => this.setProxyFromChain(callbacks), 3000);
          reject(false);
        }
      }, () => {
        console.log("Error occurred, trying again in 3 seconds...");
        setTimeout(() => this.setProxyFromChain(callbacks), 3000);
        reject(false);
      });
    });
  }

  setProxy = proxy => {
    this.proxy = proxy !== "0x0000000000000000000000000000000000000000" ? proxy : null;
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
