// Libraries
import React from "react";
import {inject, observer} from "mobx-react";
import {Link} from "react-router-dom";

// Components
import {DropdownMenu, MenuItems, MenuItem, MenuFooter} from "./DropdownMenu";
import ToggleSwitch from "./ToggleSwitch";
import WalletClientDownload from "./WalletClientDownload";
import WalletMobileClientDownload from "./WalletMobileClientDownload";
import WalletClientSelector from "./WalletClientSelector";
import WalletHWSelector from "./WalletHWSelector";
import WalletNoAccount from "./WalletNoAccount";
import WalletSendToken from "./WalletSendToken";

// Utils
import {getCurrentProviderName, getWebClientProviderName} from "../utils/blockchain";
import {BIGGESTUINT256, printNumber, etherscanAddress, getJazziconIcon, wmul, formatClientName} from "../utils/helpers";

// Images
import walletIcon from "images/wallet-icon.png";
import menuIconLedger from "images/menu-icon-ledger.svg";
import menuIconTrezor from "images/menu-icon-trezor.svg";
import menuIconWeb from "images/menu-icon-web.svg";

const menuIcons = {
  ledger: menuIconLedger,
  trezor: menuIconTrezor,
  web: menuIconWeb
};

@inject("network")
@inject("profile")
@inject("transactions")
@inject("system")
@observer
class Wallet extends React.Component {
  constructor() {
    super();
    this.state = {
      sendToken: null
    }
  }
  openSendBox = token => this.setState({ sendToken: token });

  closeSendBox = e => {
    this.setState({ sendToken: null });
  }

  logOut = e => {
    e.preventDefault();
    localStorage.removeItem("__WalletLink__:https://www.walletlink.org:SessionId");
    localStorage.removeItem("__WalletLink__:https://www.walletlink.org:Addresses");
    window.location = '/';
  }

  tokenName = token => token.replace("gov", "mkr").toUpperCase();
  tokenName = token => token.replace("dai", "sai").toUpperCase();

  renderWalletOptions = () => {
    const options = [];
    if (getWebClientProviderName() && (getCurrentProviderName() === "ledger" || getCurrentProviderName() === "trezor")) {
      options.push("web");
    }
    if (getCurrentProviderName() !== "ledger" && navigator.userAgent.toLowerCase().indexOf("firefox") === -1) {
      options.push("ledger");
    }
    if (getCurrentProviderName() !== "trezor") {
      options.push("trezor");
    }
    return options;
  }

  switchConnection = e => {
    e.preventDefault();
    this.props.network.stopNetwork();
    const client = e.currentTarget.getAttribute("data-client");
    if (client === "ledger" || client === "trezor") {
      this.props.network.showHW(client);
    } else {
      this.props.network.setWeb3WebClient();
    }
  }

  render() {
    const tokens = {
      "eth": {"balance": this.props.system.eth.myBalance, "usdPrice": this.props.system.pip.val, "allowance": false},
      "dai": {"balance": this.props.system.dai.myBalance, "usdPrice": this.props.system.vox.par, "allowance": false},
      "gov": {"balance": this.props.system.gov.myBalance, "usdPrice": this.props.system.pep.val, "allowance": false}
    };
    return (
      <div>
        {
          this.props.network.downloadClient
          ?
            this.props.network.isMobile
            ?
              <WalletMobileClientDownload />
            :
              <WalletClientDownload />
          :
            this.props.network.hw.showSelector
            ?
              <WalletHWSelector />
            :
              !this.props.network.isConnected
              ?
                !this.props.network.isMobileWeb3Wallet && <WalletClientSelector formatClientName={ formatClientName } />
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
                              { formatClientName(getCurrentProviderName()) }
                            </span>
                            <DropdownMenu icon={ walletIcon }>
                              <MenuItems>
                                {
                                  (getCurrentProviderName() === "ledger" || getCurrentProviderName() === "trezor") &&
                                  <MenuItem href="#action" text="Switch Address" iconsvg={
                                    <svg className="dropdown-item-icon" width="16" height="14" viewBox="0 0 16 14" xmlns="http://www.w3.org/2000/svg">
                                      <g fill="none" fillRule="evenodd" stroke="#000" strokeLinecap="round" strokeLinejoin="round" transform="translate(1 1)">
                                        <path d="m14 1v4h-4"/><path d="m0 11.2v-4h4"/>
                                        <path d="m1.59727273 3.999512c.65601558-1.94259944 2.21726092-3.39668309 4.13527336-3.85143401 1.91801245-.45475092 3.92455263.15342908 5.31472661 1.61088745l2.9527273 2.90737589m-14 2.66731734 2.95272727 2.90737593c1.39017401 1.4574583 3.39671419 2.0656383 5.31472664 1.6108874 1.91801239-.4547509 3.47925779-1.90883456 4.13527339-3.851434"/>
                                      </g>
                                    </svg>
                                  } data-client={ getCurrentProviderName() } onClick={ this.switchConnection } />
                                }
                                {
                                  this.renderWalletOptions().map(key =>
                                    <MenuItem href="#action" text={ `Connect ${formatClientName(key)}` } icon={ menuIcons[key] } key={ key } data-client={ key } onClick={ this.switchConnection } />
                                  )
                                }
                              </MenuItems>
                              <MenuFooter>
                                <Link to="/help">
                                  Help
                                </Link>
                                <a href="#action" onClick={ this.logOut }>Log Out</a>
                              </MenuFooter>
                            </DropdownMenu>
                            <span className="wallet-id">{ etherscanAddress(this.props.network.network, `${this.props.network.defaultAccount.substring(0, 8)}...${this.props.network.defaultAccount.substring(36, 42)}`, this.props.network.defaultAccount)}</span>
                          </h2>
                        }

                        {
                          this.state.sendToken
                          ?
                            <WalletSendToken sendToken={ this.state.sendToken } tokenName={ this.tokenName } closeSendBox={ this.closeSendBox } />
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
                                    <td>
                                      { this.tokenName(token) }
                                      <div className="usd-equivalent">USD</div>
                                    </td>
                                    <td>
                                      {
                                        tokens[token].balance.eq(-1) || tokens[token].usdPrice.eq(-1)
                                        ?
                                          "Loading..."
                                        :
                                          <React.Fragment>
                                            { printNumber(tokens[token].balance) }
                                            <div className="usd-equivalent">${ printNumber(wmul(tokens[token].balance, tokens[token].usdPrice), 2) }</div>
                                          </React.Fragment>
                                      }
                                    </td>
                                    <td className="send-col">
                                      <a href="#action" onClick={ e => { e.preventDefault(); this.openSendBox(token) } }>
                                        <svg width="17" height="17" viewBox="0 0 91 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M0.1031 85.7729L7.7031 52.8729C8.0031 51.4729 9.2031 50.3729 10.7031 50.1729L53.2031 45.7729C54.4031 45.6729 54.4031 43.8729 53.2031 43.6729L10.7031 39.5729C9.2031 39.4729 8.0031 38.3729 7.7031 36.9729L0.1031 4.17286C-0.5969 1.37286 2.4031 -0.927135 5.0031 0.372864L88.1031 41.9729C90.6031 43.2729 90.6031 46.8729 88.1031 48.1729L5.0031 89.5729C2.4031 90.8729 -0.5969 88.5729 0.1031 85.7729Z" transform="translate(0.996887)" fill="#D8D8D8"/>
                                        </svg>
                                      </a>
                                    </td>
                                    <td>
                                      {
                                        token !== "eth" &&
                                        <ToggleSwitch enabled={ !this.props.system[token].allowance.eq(-1) } onClick={ e => { e.preventDefault(); this.props.system.checkProxyAndSetAllowance(token, !this.props.system[token].allowance.eq(BIGGESTUINT256)) } } on={ this.props.system[token].allowance.eq(BIGGESTUINT256) } pending={ this.props.transactions.loading.changeAllowance && this.props.transactions.loading.changeAllowance[token] } />
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
                      <WalletNoAccount formatClientName={ formatClientName } />
                    }
                </React.Fragment>
        }
      </div>
    )
  }
}

export default Wallet;
