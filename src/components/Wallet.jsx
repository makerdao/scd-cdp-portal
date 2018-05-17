import React from 'react';
import {observer} from 'mobx-react';
import {printNumber, etherscanAddress} from '../helpers';
import WalletClientSelector from './WalletClientSelector';
import WalletHardHWSelector from './WalletHardHWSelector';
import {getProviderName} from '../blockchainHandler';

class Wallet extends React.Component {
  render() {
    return (
      <div className="col col-2-m">
        {
          this.props.network.hw.showModal
          ?
            <WalletHardHWSelector network={ this.props.network }
                                  loadHWAddresses={ this.props.network.loadHWAddresses }
                                  selectHWAddress={ this.props.network.selectHWAddress }
                                  importAddress={ this.props.network.importAddress } />
          :
            !this.props.network.isConnected
            ?
              <WalletClientSelector network={ this.props.network } />
            :
              <React.Fragment>
                {
                  this.props.network.defaultAccount
                  ?
                    <React.Fragment>
                      <h2 className="typo-h2">
                        <span>
                          { getProviderName() === 'metamask' && 'Metamask'}
                          { getProviderName() === 'ledger' && 'Ledger Nano S'}
                          { getProviderName() === 'trezor' && 'Trezor'}
                          { getProviderName() === 'other' && 'Web Client'}
                        </span>
                        <span className="typo-c wallet-id">{ etherscanAddress(this.props.network.network, `${this.props.account.substring(0, 10)}...${this.props.account.substring(36, 42)}`, this.props.account)}</span>
                      </h2>
                      <ul className="wallet">
                        <li><span className="value"><span>{ printNumber(this.props.profile.accountBalance) }</span><span className="unit">ETH</span></span></li>
                        <li><span className="value"><span>{ printNumber(this.props.system.dai.myBalance) }</span><span className="unit">DAI</span></span></li>
                        <li><span className="value"><span>{ printNumber(this.props.system.gov.myBalance) }</span><span className="unit">MKR</span></span></li>
                      </ul>
                    </React.Fragment>
                  :
                    <p>Log in with your account to see you dashboard</p>
                  }
              </React.Fragment>
        }
      </div>
    )
  }
}

export default observer(Wallet);
