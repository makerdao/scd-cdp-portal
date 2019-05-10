// Libraries
import React from 'react';
import { inject } from 'mobx-react';

@inject('network')
class WalletMobileConnect extends React.Component {
  render() {
    return (
      <button
        className="connect-wallet-mobile"
        onClick={e => {
          e.preventDefault();
          this.props.network.setWeb3WebClient();
        }}
      >
        CONNECT
      </button>
    );
  }
}

export default WalletMobileConnect;
