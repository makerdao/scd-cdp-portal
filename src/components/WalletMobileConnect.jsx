// Libraries
import React from 'react';
import { inject } from 'mobx-react';

@inject('network')
class WalletMobileConnect extends React.Component {
  render() {
    return (
      <div className="connect-wallet-mobile-container">
        <button
          className="connect-wallet-mobile"
          style={{}}
          onClick={e => {
            e.preventDefault();
            this.props.network.setWeb3WebClient();
          }}
        >
          CONNECT
        </button>
      </div>
    );
  }
}

export default WalletMobileConnect;
