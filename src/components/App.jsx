import React from 'react';
import {observer} from "mobx-react";

import NoConnection from './NoConnection';
import NoAccount from './NoAccount';
import Dialog from './Dialog';
import Welcome from './Welcome';
import Menu from './Menu';
import Wizard from './Wizard';
import Dashboard from './Dashboard';
import SystemInfo from './SystemInfo';
import Wallet from './Wallet';
import Settings from './Settings';
import Help from './Help';
import {initWeb3} from  '../web3';
import ReactNotify from '../notify';
import {isAddress} from '../helpers';
import './App.css';

import * as Blockchain from "../blockchainHandler";
window.Blockchain = Blockchain;

const settings = require('../settings');

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      page: ''
    }
  }

  componentDidMount = () => {
    this.setHashPage();
    setTimeout(this.init, 500);
  }

  componentDidUpdate = () => {
    if (!this.props.transactions.notificator) {
      this.props.transactions.notificator = this.refs.notificator;
    }
  }

  checkNetworkAndAccounts = () => {
    const check = func => {
      func().then(r => {
        if (r === 'reloadContracts') {
          this.loadContracts();
        }
      }, e => console.log(e));
    }
    check(this.props.network.checkNetwork);
    check(this.props.network.checkAccounts);
  }

  initNetworkAndAccounts = () => {
    this.checkNetworkAndAccounts();
    this.checkNetworkInterval = setInterval(() => {
      this.checkNetworkAndAccounts();
    }, 3000);
  }

  init = () => {
    initWeb3();

    this.initNetworkAndAccounts();
  }

  setHashPage = () => {
    const params = window.location.hash.replace(/^#\/?|\/$/g, '').split('/');
    this.setPage(params[0]);
  }

  loadContracts = () => {
    Blockchain.resetFilters(true);
    if (typeof this.timeVariablesInterval !== 'undefined') clearInterval(this.timeVariablesInterval);
    if (typeof this.nonTimeVariablesInterval !== 'undefined') clearInterval(this.nonTimeVariablesInterval);
    if (typeof this.pendingTxInterval !== 'undefined') clearInterval(this.pendingTxInterval);
    this.props.system.clear();

    const topAddress = settings.chain[this.props.network.network].top;
    const proxyRegistryAddr = settings.chain[this.props.network.network].proxyRegistry;

    Blockchain.loadObject('top', topAddress, 'top');
    Blockchain.loadObject('proxyregistry', proxyRegistryAddr, 'proxyRegistry');

    const setUpPromises = [Blockchain.getContractAddr('top', 'tub'), Blockchain.getContractAddr('top', 'tap'), Blockchain.getProxyAddress(this.props.network.defaultAccount)];

    Promise.all(setUpPromises).then(r => {
      if (r[0] && r[1] && isAddress(r[0]) && isAddress(r[1])) {
        const setUpPromises2 = [Blockchain.getContractAddr('tub', 'vox'), Blockchain.getContractAddr('tub', 'pit')];

        Promise.all(setUpPromises2).then(r2 => {
          if (r2[0] && r2[1] && isAddress(r2[0]) && isAddress(r2[1])) {
            this.props.profile.getAccountBalance(this.props.network.defaultAccount);

            // Set profile proxy and system contracts
            this.props.profile.setProxy(r[2])
            this.props.system.init(topAddress, r[0], r[1], r2[0], r2[1]);

            // Intervals
            this.setTimeVariablesInterval();
            this.setNonTimeVariablesInterval();
            this.setPendingTxInterval();
          } else {
            console.log('Error getting vox & pit');
          }
        }, () => console.log('Error getting vox & pit'));
      } else {
        console.log('Error getting tub & tap');
      }
    }, () => console.log('Error getting tub & tap'));
  }

  setTimeVariablesInterval = () => {
    this.timeVariablesInterval = setInterval(() => {
      this.props.system.loadVariables(true);
      this.props.profile.getAccountBalance(this.props.network.defaultAccount);
    }, 5000);
  }

  setNonTimeVariablesInterval = () => {
    // This interval should not be necessary if we can rely on the events
    this.nonTimeVariablesInterval = setInterval(() => {
      this.props.system.loadVariables();
    }, 30000);
  }

  setPendingTxInterval = () => {
    this.pendingTxInterval = setInterval(() => {
      this.props.transactions.checkPendingTransactions();
    }, 10000);
  }

  setPage = page => {
    if (['home', 'open', 'settings', 'help'].indexOf(page) === -1) {
      page = 'home';
    }
    window.location.hash = page;
    this.setState({'page': page});
  }

  changePage = e => {
    e.preventDefault();
    let page = e.target.getAttribute('data-page');
    this.setPage(page);
  }
  //

  render() {
    return (
      <React.Fragment>
        {
          !this.props.network.isConnected
          ?
            <NoConnection />
          :
            !this.props.network.defaultAccount
            ?
              <NoAccount />
            :
              this.props.system.tub.cupsLoading
              ?
                <div>Loading...</div>
              :
                Object.keys(this.props.system.tub.cups).length === 0 && this.state.page !== "open"
                ?
                  <Welcome changePage={ this.changePage }/>
                :
                  <div className={ this.state.page === 'help' ? "full-width-page" : this.props.dialog.dialog.show ? "dialog-open" : "" }>
                    <div className="wrapper">
                      <div className="menu-bar">
                        <div className="logo">
                          <img src="img/mkr-logo-rounded.svg" draggable="false" alt="" />
                          <span className="menu-label">Maker</span>
                        </div>
                        <Menu system={ this.props.system } page={ this.state.page } changePage={ this.changePage } />
                      </div>
                      <main
                        className={
                                    this.state.page === 'help'
                                    ?
                                      "main-column fullwidth"
                                    :
                                      "main-column"
                                  }>
                        {
                          this.state.page === 'settings' &&
                          <Settings
                            network={ this.props.network.network }
                            system={ this.props.system }
                            account={ this.props.network.defaultAccount }
                            profile={ this.props.profile }
                            handleOpenDialog={ this.props.dialog.handleOpenDialog }
                            transferToken={ this.props.system.transferToken } />
                        }
                        {
                          this.state.page === 'help' &&
                          <Help />
                        }
                        {
                          (this.state.page !== 'settings' && this.state.page !== 'help' && /*this.state.page === 'open' || */Object.keys(this.props.system.tub.cups).length === 0) &&
                          <Wizard system={ this.props.system } profile={ this.props.profile } />
                        }
                        {
                          this.state.page !== 'settings' && this.state.page !== 'help' && /*this.state.page === 'home' && */Object.keys(this.props.system.tub.cups).length > 0 &&
                          <Dashboard system={ this.props.system } profile={ this.props.profile } handleOpenDialog={ this.props.dialog.handleOpenDialog }/>
                        }
                      </main>
                      <aside className="right-column">
                        <ReactNotify ref='notificator'/>
                        {
                          this.state.page !== 'help' &&
                          <div className="right-column-content">
                            <div className="row-2col-m">
                              <Wallet system={ this.props.system } network={ this.props.network.network } profile={ this.props.profile } account={ this.props.network.defaultAccount } />
                              <SystemInfo system={ this.props.system } network={ this.props.network.network } profile={ this.props.profile } pipVal = { this.props.system.pip.val } pepVal = { this.props.system.pep.val } />
                            </div>	
                            <div className="footer col col-no-border typo-cs typo-grid-grey">
                              <a href="#action">Dai Public Announcement</a> || <a href="#action">Dai Terms of Service</a>
                            </div>
                          </div>
                        }
                      </aside>
                    </div>
                    <Dialog system={ this.props.system } profile={ this.props.profile } dialog={ this.props.dialog } />
                  </div>
        }
      </React.Fragment>
    )
  }
}

export default observer(App);
