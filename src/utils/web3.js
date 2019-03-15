// Libraries
import Web3 from "web3";
import * as Web3ProviderEngine from "web3-provider-engine/dist/es5";
import * as RpcSource from "web3-provider-engine/dist/es5/subproviders/rpc";
import Transport from "@ledgerhq/hw-transport-u2f";

// Utils
import LedgerSubProvider from "./ledger-subprovider";
import TrezorSubProvider from "./trezor-subprovider";

// Settings
import * as settings from "../settings";

export const getWebClientProviderName = () => {
  if (window.imToken)
    return 'imtoken';

  if (!window.web3 || typeof window.web3.currentProvider === "undefined")
    return "";

  if (window.ethereum && window.ethereum.isStatus)
    return "status";
  
  if (window.web3.currentProvider.isAlphaWallet)
    return "alphawallet";

  if (window.web3.currentProvider.isMetaMask)
    return "metamask";

  if (window.web3.currentProvider.isTrust)
    return "trust";

  if (typeof window.SOFA !== "undefined")
    return "coinbase";

  if (typeof window.__CIPHER__ !== "undefined")
    return "cipher";

  if (window.web3.currentProvider.constructor.name === "EthereumProvider")
    return "mist";

  if (window.web3.currentProvider.constructor.name === "Web3FrameProvider")
    return "parity";

  if (window.web3.currentProvider.host && window.web3.currentProvider.host.indexOf("infura") !== -1)
    return "infura";

  if (window.web3.currentProvider.host && window.web3.currentProvider.host.indexOf("localhost") !== -1)
    return "localhost";

  return "other";
};

class Web3Extended extends Web3 {
  stop = () => {
    this.reset();
    if (this.currentProvider && typeof this.currentProvider.stop === "function") {
      this.currentProvider.stop();
    }
  }

  setHWProvider = (device, network, path, accountsOffset = 0, accountsLength = 1) => {
    this.stop();
    return new Promise(async (resolve, reject) => {
      try {
        const networkId = network === "main" ? 1 : (network === "kovan" ? 42 : "");
        this.setProvider(new Web3ProviderEngine());
        const hwWalletSubProvider = device === "ledger"
                                    ? LedgerSubProvider(async () => await Transport.create(), {networkId, path, accountsOffset, accountsLength})
                                    : TrezorSubProvider({networkId, path, accountsOffset, accountsLength});
        this.currentProvider.name = device;
        this.currentProvider.addProvider(hwWalletSubProvider);
        this.currentProvider.addProvider(new RpcSource({rpcUrl: settings.chain[network].nodeURL}));
        this.currentProvider.start();
        this.useLogs = false;
        resolve(true);
      } catch(e) {
        reject(e);
      }
    });
  }

  setWebClientWeb3 = () => {
    this.stop();
    return new Promise(async (resolve, reject) => {
      try {
        if (window.web3 || window.ethereum) {
          try {
            let provider;
            if (window.ethereum) {
              await window.ethereum.enable();
              provider = window.ethereum;
            } else {
              provider = window.web3.currentProvider;
            }
            resolve(provider);
          } catch (error) {
            reject(new Error("User denied account access"));
          }
        } else {
          reject(new Error("No client"));
        }
      } catch(e) {
        reject(e);
      }
    });
  }

  setWebClientProvider = provider => {
    return new Promise(async (resolve, reject) => {
      try {
        this.setProvider(provider);
        this.useLogs = true;
        this.currentProvider.name = getWebClientProviderName();
        resolve(true);
      } catch (error) {
        reject(new Error("Error setting provider"));
      }
    });
  }
}

const web3 = new Web3Extended();
window.web3Provider = web3;

export default web3;
