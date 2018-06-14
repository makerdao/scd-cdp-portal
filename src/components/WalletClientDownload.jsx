
import React from 'react';
import {observer} from 'mobx-react';

class WalletClientSelector extends React.Component {
  render() {
    return (
      <div className="frame no-account">
        <div className="heading">
          <h2>Get a Wallet</h2>
        </div>
        <section className="content">
          <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">MetaMask</a><br/>
          <a href="https://www.toshi.org/" target="_blank" rel="noopener noreferrer">Toshi</a><br/>
          <a href="https://www.parity.io/" target="_blank" rel="noopener noreferrer">Parity</a><br/>
          <button href="#action" onClick={ e => { this.props.network.downloadClient = false } }>Cancel</button>
        </section>
      </div>
    )
  }
}

export default observer(WalletClientSelector);
