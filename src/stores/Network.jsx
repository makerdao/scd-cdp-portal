// Libraries
import {observable} from "mobx";

// Utils
import * as blockchain from "../utils/blockchain";

// import Web3 from "web3";
// import WalletConnect from "@walletconnect/browser";
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
// import ProviderEngine from 'web3-provider-engine'
// import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
// import WalletConnectSubprovider from '@walletconnect/web3-subprovider'

export default class NetworkStore {
  @observable stopIntervals = false;
  @observable loadingAddress = false;
  @observable waitingForAccessApproval = false;
  @observable accounts = [];
  @observable defaultAccount = null;
  @observable isConnected = false;
  @observable latestBlock = null;
  @observable network = "";
  @observable outOfSync = true;
  @observable hw = {active: false, showSelector: false, option: null, derivationPath: null, addresses: [], loading: false, error: null, network: ""};
  @observable downloadClient = false;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  setNetwork = async () => {
    try {
      const result = await blockchain.checkNetwork(this.isConnected, this.network);
      Object.keys(result.data).forEach(key => { this[key] = result.data[key]; });
      if (!this.stopIntervals && result.status) {
        this.setAccount();
        if (!this.hw.active) {
          this.setAccountInterval = setInterval(this.setAccount, 1000);
        }
      }
    } catch(e) {
      console.debug(e);
    }
  }

  stopNetwork = () => {
    this.stopIntervals = true;
    blockchain.stopProvider();
    clearInterval(this.rootStore.interval);
    this.rootStore.interval = null;
    clearInterval(this.rootStore.intervalAggregatedValues);
    this.rootStore.intervalAggregatedValues = null;
    clearInterval(this.setAccountInterval);
    this.setAccountInterval = null;
    clearInterval(this.setNetworkInterval);
    this.setNetworkInterval = null;
    this.network = "";
    this.hw = {active: false, showSelector: false, option: null, derivationPath: null, addresses: [], loading: false, error: null, network: ""};
    this.accounts = [];
    this.defaultAccount = null;
    this.isConnected = false;
    this.latestBlock = null;
    this.outOfSync = true;
    this.walletConnector = null;
  }

  setAccount = () => {
    blockchain.getAccounts().then(async accounts => {
      if (this.network && !this.hw.active && accounts && accounts[0] !== blockchain.getDefaultAccount()) {
        const account = await blockchain.getDefaultAccountByIndex(0);
        if (!this.stopIntervals) { // To avoid race condition
          blockchain.setDefaultAccount(account);
        }
      }
      if (!this.stopIntervals) { // To avoid race condition
        const oldDefaultAccount = this.defaultAccount;
        this.defaultAccount = blockchain.getDefaultAccount();
        if (this.defaultAccount && oldDefaultAccount !== this.defaultAccount) {
          this.rootStore.loadContracts();
        }
        if (!this.defaultAccount) {
          this.loadingAddress = false;
        }
      }
    }, () => {});
  }

  // Web3 web client
  setWeb3WebClient = async () => {
    try {
      this.stopIntervals = false;
      this.loadingAddress = true;
      this.waitingForAccessApproval = typeof window.ethereum !== "undefined";
      const provider = await blockchain.setWebClientWeb3();
      this.waitingForAccessApproval = false;
      await blockchain.setWebClientProvider(provider);
      this.setNetwork();
      this.setNetworkInterval = setInterval(this.setNetwork, 3000);
    } catch (e) {
      this.loadingAddress = false;
      this.waitingForAccessApproval = false;
      if (e.message === "No client") {
        this.downloadClient = true;
      }
      console.debug(e);
    }
  }

  // TODO: Reliably update network and rpcUrl on chainId change
  // Web3 web client using WalletConnect
  startWalletConnect = async () => {
    try {
      this.stopIntervals = false;
      this.loadingAddress = true;
      this.waitingForAccessApproval = typeof window.ethereum !== "undefined";
      const provider = new WalletConnectProvider({
        bridge: "https://bridge.walletconnect.org", // Required
        rpcUrl: "https://mainnet.infura.io" // Required
        // rpcUrl: "https://kovan.infura.io" // Required
      });
      this.waitingForAccessApproval = false;
      await blockchain.setWebClientProvider(provider);
      this.walletConnector = provider._providers[0];

      // Check if connection is already established
      if (!this.walletConnector.connected) {
        // Create new session
        this.walletConnector
          .createSession()
          .then(() => {
            // Get uri for QR Code modal
            const uri = this.walletConnector.uri;
            // Display QR code modal
            WalletConnectQRCodeModal.open(uri, () => {
              console.log("[WalletConnect] QR Code modal closed");
              this.loadingAddress = false;
              this.waitingForAccessApproval = false;
            });
          });
      } else {
        console.log("[WalletConnect] Using existing session.");
        // Get provided accounts and chainId
        const chainId = this.walletConnector._walletConnector.chainId
        console.log('[WalletConnect] Got accounts:', this.walletConnector.accounts);
        console.log('[WalletConnect] Using chainId:', chainId);
        this.network = (chainId === 1 ? "main" : "kovan");
        this.setNetwork();
        this.setNetworkInterval = setInterval(this.setNetwork, 3000);
      }

      // Subscribe to connection events
      this.walletConnector._walletConnector.on("connect", (error, payload) => {
        console.log('[WalletConnect] connect', payload);
        if (error) {
          throw error;
        }
        // close QR Code Modal
        WalletConnectQRCodeModal.close();
        // Get provided accounts and chainId
        const { accounts, chainId } = payload.params[0];
        console.log('[WalletConnect] Got accounts:', accounts);
        console.log('[WalletConnect] Using chainId:', chainId);
        // this.network = (chainId === 1 ? "main" : "kovan");
        this.setNetwork();
        this.setNetworkInterval = setInterval(this.setNetwork, 3000);
      });
      this.walletConnector._walletConnector.on("session_update", (error, payload) => {
        console.log('[WalletConnect] session_update', payload);
        if (error) {
          throw error;
        }
        // Get updated accounts and chainId
        const { accounts, chainId } = payload.params[0];
        console.log('[WalletConnect] Got accounts:', accounts);
        console.log('[WalletConnect] Using chainId:', chainId);
        this.network = (chainId === 1 ? "main" : "kovan");
      });
      this.walletConnector._walletConnector.on("call_request", (error, payload) => {
        console.log('[WalletConnect] call_request', payload);
        if (error) {
          throw error;
        }
      });
      this.walletConnector._walletConnector.on("disconnect", (error, payload) => {
        console.log('[WalletConnect] disconnect', payload);
        if (error) {
          throw error;
        }
        this.stopNetwork();
        this.walletConnector = null;
      });
    } catch (e) {
      this.loadingAddress = false;
      this.waitingForAccessApproval = false;
      if (e.message === "No client") {
        this.downloadClient = true;
      }
      console.debug(e);
    }
  }

  // Hardwallets
  showHW = option => {
    if (option === "ledger") {
      option = `ledger-${localStorage.getItem("loadLedgerLegacy") === "true" ? "legacy" : "live"}`;
    }
    this.hw.option = option;
    this.hw.showSelector = true;
    this.loadHWAddresses();
  }

  hideHw = () => {
    this.hw.active = false;
    this.hw.loading = false;
    this.hw.showSelector = false;
    this.hw.option = "";
    this.hw.derivationPath = false;
    this.hw.network = "";
  }

  loadHWAddresses = async () => {
    this.hw.loading = true;
    this.hw.active = true;
    this.hw.error = false;
    this.hw.network = (window.location.hostname === "cdp.makerdao.com" || window.location.hostname === "cdp-portal-mainnet.surge.sh" || window.location.hostname === "d2maajt6wv6xbc.cloudfront.net")
      ? "main"
      : "kovan";
    this.hw.derivationPath = this.hw.option === "ledger-live"
      ? "44'/60'/0'"
      : this.hw.option === "ledger-legacy"
        ? "44'/60'/0'/0"
        : "44'/60'/0'/0/0";
    try {
      await blockchain.setHWProvider(
                                      this.hw.option.replace("-live", "").replace("-legacy", ""),
                                      this.hw.network,
                                      this.hw.derivationPath,
                                      0,
                                      this.hw.option === "ledger-live" ? 5 : 50
                                    );
      const accounts = await blockchain.getAccounts();
      this.hw.addresses = accounts;
    } catch(e) {
      blockchain.stopProvider();
      this.hw.error = `Error connecting ${this.hw.option}: ${e.message}`;
    } finally {
      this.hw.loading = false;
    }
  }

  importAddress = account => {
    try {
      this.stopIntervals = false;
      this.loadingAddress = true;
      this.hw.showSelector = false;
      blockchain.setDefaultAccount(account.toLowerCase());
      this.setNetwork();
      this.setNetworkInterval = setInterval(this.setNetwork, 10000);
    } catch(e) {
      this.loadingAddress = false;
      this.hw.showSelector = true;
      this.hw.addressIndex = null;
      this.hw.addresses = [];
      blockchain.stopProvider();
      this.hw.error = `Error connecting ${this.hw.option}: ${e.message}`;
    }
  }
  //

  stopLoadingAddress = () => {
    this.loadingAddress = false;
  }
}
