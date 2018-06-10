import React from 'react';
import {observer} from 'mobx-react';
import WalletHardHWSelector from './WalletHardHWSelector';
import {getCurrentProviderName, getWebClientProviderName} from '../blockchainHandler';
import {BIGGESTUINT256, printNumber, isAddress, etherscanAddress, toWei, getJazziconIcon, capitalize} from '../helpers';
import { DropdownMenu, MenuItems, MenuItem, MenuFooter } from './DropdownMenu';

class Wallet extends React.Component {
  constructor() {
    super();
    this.state = {
      sendToken: null,
      error: false
    }
  }

  openSendBox = token => this.setState({ sendToken: token });

  closeSendBox = e => {
    e.preventDefault();
    this.setState({ sendToken: null });
  }

  transfer = e => {
    e.preventDefault();
    const token = this.state.sendToken;
    const amount = this.amount.value;
    const destination = this.destination.value;
    const myBalance = token === 'eth' ? this.props.profile.accountBalance : this.props.system[token].myBalance;
    this.setState({ error: '' });

    if (!destination || !isAddress(destination)) {
      this.setState({ error: 'Invalid Address' });
    } else if (!amount) {
      this.setState({ error: 'Invalid Amount' });
    } else if (myBalance.lt(toWei(amount))) {
      this.setState({ error: `Not enough balance to transfer ${amount} ${this.tokenName(token)}` });
    } else {
      this.props.system.transferToken(token, destination, amount);
      this.amount.value = '';
      this.destination.value = '';
    }
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

  logout = e => {
    e.preventDefault();
    this.props.network.stopNetwork();
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
          this.props.network.hw.showSelector
          ?
            <WalletHardHWSelector network={ this.props.network }
                                  loadHWAddresses={ this.props.network.loadHWAddresses }
                                  selectHWAddress={ this.props.network.selectHWAddress }
                                  importAddress={ this.props.network.importAddress } />
          :
            !this.props.network.isConnected
            ?
              <div className="frame no-account">
                <div className="heading">
                  <h2>Connect a Wallet</h2>
                </div>
                <section className="content">
                  <div className="helper-text no-wrap">Get started by connecting one of the wallets below</div>
                  <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.setWeb3WebClient() } }>{ getWebClientProviderName() ? this.formatClientName(getWebClientProviderName()): 'Metamask/Toshi/Mist/Parity' }</a><br/>
                  <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.showHW('ledger') } }>Ledger Nano S</a><br/>
                  <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.showHW('trezor') } }>Trezor</a>
                </section>
              </div>
            :
              <React.Fragment>
                {
                  this.props.network.defaultAccount
                  ?
                    <React.Fragment>
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
                            <a href="#help" data-page="help" onClick={ this.props.changePage }>Help</a><a href="#action" onClick={ this.logout }>Log Out</a>
                          </MenuFooter>
                        </DropdownMenu>
                        <span className="typo-c wallet-id">{ etherscanAddress(this.props.network.network, `${this.props.network.defaultAccount.substring(0, 10)}...${this.props.network.defaultAccount.substring(36, 42)}`, this.props.network.defaultAccount)}</span>
                      </h2>
                      {
                        this.state.sendToken
                        ?
                          <React.Fragment>
                            <a href="#action" onClick={ this.closeSendBox }>&lt;</a> Send { this.tokenName(this.state.sendToken) }
                            <form onSubmit={ this.transfer }>
                              <div>
                                <label>
                                  Amount<br/>
                                  <input type="number" ref={ input => this.amount = input } placeholder="0.00" step="0.000000000000000001" />
                                </label>
                                { printNumber(this.state.sendToken === 'eth' ? this.props.profile.accountBalance : this.props.system[this.state.sendToken].myBalance) }
                                { ` ${ this.tokenName(this.state.sendToken) } available` }
                              </div>
                              <div>
                                <label>
                                  Destination<br/>
                                  <input type="text" ref={ input => this.destination = input } />
                                </label>
                              </div>
                              {
                                this.state.error &&
                                <div className="error">
                                  { this.state.error }
                                </div>
                              }
                              <div>
                                <button className="text-btn text-btn-primary" onClick={ this.closeSendBox }>Cancel</button>
                                <button className="text-btn text-btn-primary" type="submit">Send</button>
                              </div>
                            </form>
                          </React.Fragment>
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
                                        {
                                          this.props.system[token].allowance.eq(-1)
                                          ?
                                            'Loading...'
                                          :
                                            <a href="#action" onClick={ e => { e.preventDefault(); this.props.system.setAllowance(token, !this.props.system[token].allowance.eq(BIGGESTUINT256)) } }>{ this.props.system[token].allowance.eq(BIGGESTUINT256) ? 'Lock' : 'Unlock' }</a>
                                        }
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
                    <p>Log in with your account to see your dashboard</p>
                  }
              </React.Fragment>
        }
      </div>
    )
  }
}

export default observer(Wallet);
