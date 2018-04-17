import * as Blockchain from "../blockchainHandler";
const settings = require('../settings');

export function checkNetwork() {
  let isConnected = null;
  Blockchain.getNode().then(r => {
    isConnected = true;
    Blockchain.getBlock('latest').then(res => {
      if (typeof(res) === 'undefined') {
        console.debug('YIKES! getBlock returned undefined!');
      }
      if (res.number >= this.state.network.latestBlock) {
        const networkState = {...this.state.network};
        networkState.latestBlock = res.number;
        networkState.outOfSync = ((new Date().getTime() / 1000) - res.timestamp) > 600;
        this.setState({network: networkState});
      } else {
        // XXX MetaMask frequently returns old blocks
        // https://github.com/MetaMask/metamask-plugin/issues/504
        console.debug('Skipping old block');
      }
    });

    // because you have another then after this.
    // The best way to handle is to return isConnect;
    return null;
  }, () => {
    isConnected = false;
  }).then(() => {
    if (this.state.network.isConnected !== isConnected) {
      if (isConnected === true) {
        let network = false;
        Blockchain.getBlock(0).then(res => {
          switch (res.hash) {
            case '0xa3c565fc15c7478862d50ccd6561e3c06b24cc509bf388941c25ea985ce32cb9':
              network = 'kovan';
              break;
            case '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3':
              network = 'main';
              break;
            default:
              console.log('setting network to private');
              console.log('res.hash:', res.hash);
              network = 'private';
          }
          if (this.state.network.network !== network) {
            this.initNetwork(network);
          }
        }, () => {
          if (this.state.network.network !== network) {
            this.initNetwork(network);
          }
        });
      } else {
        const networkState = {...this.state.network};
        networkState.isConnected = isConnected;
        networkState.network = false;
        networkState.latestBlock = 0;
        this.setState({network: networkState});
      }
    }
  });
}

export function initNetwork(newNetwork) {
  const networkState = {...this.state.network};
  networkState.network = newNetwork;
  networkState.isConnected = true;
  networkState.latestBlock = 0;
  this.setState({network: networkState}, () => {
    this.initContracts(settings.chain[this.state.network.network].top);
  });
}

export function checkAccounts() {
  Blockchain.getAccounts().then(accounts => {
    const networkState = {...this.state.network};
    networkState.accounts = accounts;
    const oldDefaultAccount = networkState.defaultAccount;
    networkState.defaultAccount = accounts[0];
    Blockchain.setDefaultAccount(networkState.defaultAccount);
    this.setState({network: networkState}, () => {
      if (this.state.network.network && oldDefaultAccount !== networkState.defaultAccount) {
        this.initContracts(settings.chain[this.state.network.network].top);
      }
    });
  }, error => {console.debug(error)});
}