import * as Blockchain from "../blockchainHandler";

export function setProxyAddress(callbacks) {
  Promise.resolve(Blockchain.getProxyAddress(this.state.network.defaultAccount)).then(proxy => {
    if (proxy) {
      this.setState((prevState, props) => {
        const profile = {...prevState.profile};
        profile.proxy = proxy;
        return {profile};
      }, () => {
        Blockchain.loadObject('dsproxy', this.state.profile.proxy, 'proxy');
        callbacks.forEach(callback => this.executeCallback(callback))
      });
    }
  });
}

export function checkProxy(callbacks) {
  if (this.state.profile.proxy) {
    callbacks.forEach(callback => this.executeCallback(callback));
  } else {
    const id = Math.random();
    const title = 'Create Proxy';
    this.logRequestTransaction(id, title);
    Blockchain.objects.proxyRegistry.build((e, tx) => this.log(e, tx, id, title, [['setProxyAddress', callbacks]]));
  }
}
