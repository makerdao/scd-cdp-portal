// Libraries
import Web3 from "web3";
import * as Web3ProviderEngine from "web3-provider-engine/dist/es5";
import * as RpcSource from "web3-provider-engine/dist/es5/subproviders/rpc";
import Transport from "@ledgerhq/hw-transport-u2f";
import Maker from '@makerdao/dai';

// Utils
import LedgerSubProvider from "./ledger-subprovider";
import TrezorSubProvider from "./trezor-subprovider";

// Settings
import * as settings from "../settings";

export const getWebClientProviderName = () => {
  if (!window.web3 || typeof window.web3.currentProvider === "undefined")
    return "";

  if (window.web3.currentProvider.isMetaMask)
    return "metamask";

  if (window.web3.currentProvider.isTrust)
    return "trust";

  if (typeof window.SOFA !== "undefined")
    return "toshi";

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

  setWebClientProvider = () => {
    this.stop();

    return new Promise((resolve, reject) => {
      const maker = Maker.create('browser', {
        log: true
      });
      window.maker = maker;

      // TODO: Relocate this somewhere else
      maker.on('web3/AUTHENTICATED', async (ev) => {
        // Wait for all services to authenticate
        await maker.authenticate();
        console.log("Dai.js web3 service authenticated");

        maker.service('event').on('**', ev => {
          console.log('SDK event:', ev.type, ev.payload);
        });

        const account = ev.payload.account;
        const web3service = maker.service('web3');

        this.setProvider(web3service.web3Provider());
        // Use filter logs? (polls RPC node using eth_getFilterChanges and eth_getLogs)
        // for Approval/Transfer/Deposit/Withdrawal/Mint/Burn event logs or the tub's LogNote (DSNote)
        // events for lock(bytes32,uint256) free(bytes32,uint256) draw(bytes32,uint256) wipe(bytes32,uint256) bite(bytes32) shut(bytes32) give(bytes32,address)
        this.useLogs = false;
        this.currentProvider.name = getWebClientProviderName();
        resolve(true);
      });
    });
  }
}

const web3 = new Web3Extended();
window.web3Provider = web3;

export default web3;
