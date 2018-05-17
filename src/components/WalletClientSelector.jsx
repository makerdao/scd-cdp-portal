import React from 'react';

class WalletClientSelector extends React.Component {
  render() {
    return (
      <div className="frame no-account">
        <div className="heading">
          <h2>Connect a Wallet</h2>
        </div>
        <section className="content">
          <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.setWeb3WebClient() } }>Metamask/Parity/Mist</a><br/>
          <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.showHW('ledger') } }>Ledger Nano S</a><br/>
          <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.showHW('trezor') } }>Trezor</a>
        </section>
      </div>
    )
  }
}

export default WalletClientSelector;
