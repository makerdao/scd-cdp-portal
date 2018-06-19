import React from 'react';
import {observer} from 'mobx-react';
import {Link} from 'react-router-dom';

import WalletClientDownload from './WalletClientDownload';
import WalletClientSelector from './WalletClientSelector';
import WalletHWSelector from './WalletHWSelector';
import WalletNoAccount from './WalletNoAccount';
import WalletSendToken from './WalletSendToken';
import ToggleSwitch from './ToggleSwitch';

import {getCurrentProviderName, getWebClientProviderName} from '../blockchainHandler';
import {BIGGESTUINT256, printNumber, etherscanAddress, getJazziconIcon, capitalize} from '../helpers';
import {DropdownMenu, MenuItems, MenuItem, MenuFooter} from './DropdownMenu';

class Wallet extends React.Component {
  constructor() {
    super();
    this.state = {
      sendToken: null,
      switchPending: { eth: false, mkr: false, gov: false }
    }
  }

  handleSetAllowance = (token, allow) => {
    let pendingState = { ...this.state.switchPending };
    pendingState[token] = true;
    console.log(`Turning on pending state of ${token} switch`);
    this.setState({ switchPending: pendingState });

    this.props.system.setAllowance(token, allow, [[err => {
      if (err) console.error(`Error setting allowance for ${token}: ${err.message}`);
      let pendingState = { ...this.state.switchPending };
      pendingState[token] = false;
      console.log(`Turning off pending state of ${token} switch`);
      this.setState({ switchPending: pendingState });
    }]]);
  }

  openSendBox = token => this.setState({ sendToken: token });

  closeSendBox = e => {
    this.setState({ sendToken: null });
  }

  tokenName = token => token.replace('gov', 'mkr').toUpperCase();

  formatClientName = name => {
    switch (name) {
      case 'ledger':
        return 'Ledger Nano S';
      case 'metamask':
        return 'MetaMask';
      case 'web':
        return capitalize(getWebClientProviderName());
      default:
        return capitalize(name);
    }
  }

  renderWalletOptions = () => {
    const options = [];
    if (getWebClientProviderName() && (getCurrentProviderName() === 'ledger' || getCurrentProviderName() === 'trezor')) {
      options.push('web');
    }
    if (getCurrentProviderName() !== 'ledger') {
      options.push('ledger');
    }
    if (getCurrentProviderName() !== 'trezor') {
      options.push('trezor');
    }
    return options;
  }

  switchConnection = e => {
    e.preventDefault();
    this.props.network.stopNetwork();
    const client = e.currentTarget.getAttribute('data-client');
    if (client === 'ledger' || client === 'trezor') {
      this.props.network.showHW(client);
    } else {
      this.props.network.setWeb3WebClient();
    }
  }

  render() {
    const tokens = {
      'eth': {'balance': this.props.profile.accountBalance, 'allowance': false},
      'dai': {'balance': this.props.system.dai.myBalance, 'allowance': false},
      'gov': {'balance': this.props.system.gov.myBalance, 'allowance': false}
    };
    return (
      <div>
        {
          this.props.network.downloadClient
          ?
            <WalletClientDownload network={ this.props.network } />
          :
            this.props.network.hw.showSelector
            ?
              <WalletHWSelector network={ this.props.network }
                                loadHWAddresses={ this.props.network.loadHWAddresses }
                                selectHWAddress={ this.props.network.selectHWAddress }
                                importAddress={ this.props.network.importAddress } />
            :
              !this.props.network.isConnected
              ?
                <WalletClientSelector network={ this.props.network } formatClientName={ this.formatClientName } />
              :
                <React.Fragment>
                  {
                    this.props.network.defaultAccount
                    ?
                      <React.Fragment>
                        {
                          !this.state.sendToken &&
                          <h2 className="typo-h2 wallet">
                            { getJazziconIcon(this.props.network.defaultAccount, 25) }
                            <span>
                              { this.formatClientName(getCurrentProviderName()) }
                            </span>
                            <DropdownMenu icon="../img/wallet-icon.png">
                              <MenuItems>
                              {
                                this.renderWalletOptions().map(key =>
                                  <MenuItem href="#action" text={ `Connect ${this.formatClientName(key)}` } icon={ `../img/menu-icon-${key}.png` } key={ key } data-client={ key } onClick={ this.switchConnection } />
                                )
                              }
                              </MenuItems>
                              <MenuFooter>
                                <Link to="/help">
                                  Help
                                </Link>
                                <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.stopNetwork(); } }>Log Out</a>
                              </MenuFooter>
                            </DropdownMenu>
                            <span className="typo-c wallet-id">{ etherscanAddress(this.props.network.network, `${this.props.network.defaultAccount.substring(0, 10)}...${this.props.network.defaultAccount.substring(36, 42)}`, this.props.network.defaultAccount)}</span>
                          </h2>
                        }

                        {
                          this.state.sendToken
                          ?
                            <WalletSendToken profile={ this.props.profile } system={ this.props.system } sendToken={ this.state.sendToken } tokenName={ this.tokenName } closeSendBox={ this.closeSendBox } />
                          :
                          <table>
                            <thead>
                              <tr>
                                <th>Asset</th>
                                <th>Balance</th>
                                <th>Send</th>
                                <th>Unlock</th>
                              </tr>
                            </thead>
                            <tbody>
                              {
                                Object.keys(tokens).map(token =>
                                  <tr key={ token }>
                                    <td>{ this.tokenName(token) }</td>
                                    <td>
                                      {
                                        tokens[token].balance.eq(-1)
                                        ?
                                          'Loading...'
                                        :
                                          printNumber(tokens[token].balance)
                                      }
                                    </td>
                                    <td className="send-col"><a href="#action" onClick={ e => { e.preventDefault(); this.openSendBox(token) } }><img src="../img/send-icon.png" width="17" height="17" alt="Send" /></a></td>
                                    <td>
                                      {
                                        token !== 'eth' &&
                                        <React.Fragment>
                                          <ToggleSwitch enabled={ !this.props.system[token].allowance.eq(-1) } onClick={ e => { e.preventDefault(); this.handleSetAllowance(token, !this.props.system[token].allowance.eq(BIGGESTUINT256)) } } on={ this.props.system[token].allowance.eq(BIGGESTUINT256) } pending={ this.state.switchPending[token] } />
                                        </React.Fragment>
                                      }
                                    </td>
                                  </tr>
                                )
                              }
                            </tbody>
                          </table>
                        }
                      </React.Fragment>
                    :
                      <WalletNoAccount network={ this.props.network } formatClientName={ this.formatClientName } />
                    }
                </React.Fragment>
        }
      </div>
    )
  }
}

export default observer(Wallet);
