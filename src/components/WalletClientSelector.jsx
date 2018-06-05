import React from 'react';

class WalletClientSelector extends React.Component {
  render() {
    return (
      <div className="frame no-account">
        <div className="heading">
          <h2>Connect a Wallet</h2>
        </div>
        <section className="content">
          <div className="helper-text no-wrap">Get started by connecting one of the wallets below</div>
          <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.setWeb3WebClient() } }>MetaMask / Parity</a><br/>
          <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.showHW('ledger') } }>Ledger Nano S</a><br/>
          <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.showHW('trezor') } }>Trezor</a>
        </section>
      </div>
    )
  }
}

export default WalletClientSelector;
