import React from 'react';
import {observer} from "mobx-react";

import NoConnection from './NoConnection';
import Dialog from './Dialog';
import Wizard from './Wizard';
import SystemInfo from './SystemInfo';
import Wallet from './Wallet';
import Settings from './Settings';
import Help from './Help';
import Cup from './Cup';
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
      params: ''
    }
  }

  componentDidMount = () => {
    this.setHashParams();
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

  setHashParams = () => {
    const params = window.location.hash.replace(/^#\/?|\/$/g, '').split('/');
    if (['home', 'settings', 'help'].indexOf(params[0]) === -1) {
      params[0] = 'home';
    }
    this.setState({params});
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
            if (r[2] && isAddress(r[1])) { this.props.profile.setProxy(r[2]) };
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

  changeTab = e => {
    e.preventDefault();
    let tab = e.target.getAttribute('data-tab');

    if (['home', 'settings', 'help'].indexOf(tab) === -1) {
      tab = 'home';
    }
    window.location.hash = tab;
    this.setState({'params': [tab]});
  }
  //

  render() {
    return (
      this.props.network.isConnected ? 
        <div className={ this.state.params[0] === 'help' ? "full-width-page" : this.props.dialog.dialog.show ? "dialog-open" : "" }>
          <div className="wrapper">
            <div className="menu-bar">
              <div className="logo">
                <img src="img/mkr-logo-rounded.svg" draggable="false" alt="" />
                <span className="menu-label">Maker</span>
              </div>
              <nav>
                <ul className="menu">
                  <li value="home" className={ this.state.params[0] === 'home' ? 'active' : '' } data-tab="home" onClick={ this.changeTab }>
                    <img src="img/icon-home.svg" draggable="false" alt="" data-tab="home" />
                    <span className="menu-label" data-tab="home">Dashboard</span>
                  </li>
                  {
                    !this.props.system.tub.cupsLoading && Object.keys(this.props.system.tub.cups).length > 1 &&
                    Object.keys(this.props.system.tub.cups).map(key =>
                      <li key={ key } data-cupId={ key } className={ this.props.system.tub.cupId ? this.props.system.tub.cupId : Object.keys(this.props.system.tub.cups)[0] === key ? 'active' : '' } onClick={ this.props.system.changeCup }>
                        CDP #{ key }
                      </li>
                    )
                  }
                  <li value="settings" className={ this.state.params[0] === 'settings' ? 'active' : '' } data-tab="settings" onClick={ this.changeTab }>
                    <img src="img/icon-settings.svg" draggable="false" alt="" data-tab="settings" />
                    <span className="menu-label" data-tab="settings">Settings</span>
                  </li>
                  <li value="help" className={ this.state.params[0] === 'help' ? 'active' : '' } data-tab="help" onClick={ this.changeTab }>
                    <img src="img/icon-help.svg" draggable="false" alt="" data-tab="help" />
                    <span className="menu-label" data-tab="help">Help</span>
                  </li>
                </ul>
              </nav>
            </div>
            <main
              className={
                          this.state.params[0] === 'help'
                          ?
                            "main-column fullwidth"
                          :
                            "main-column"
                        }>
              {
                this.state.params[0] === 'settings' &&
                <Settings
                  network={ this.props.network.network }
                  system={ this.props.system }
                  account={ this.props.network.defaultAccount }
                  profile={ this.props.profile }
                  handleOpenDialog={ this.props.dialog.handleOpenDialog }
                  transferToken={ this.props.system.transferToken } />
              }
              {
                this.state.params[0] === 'help' &&
                <Help />
              }
              {
                !this.props.network.defaultAccount
                ?
                  <div>
                    <header className="col">
                      <h1 className="typo-h1">No account connected</h1>
                    </header>
                    <div className="row">
                      <div className="col">
                        <p className="typo-cl">
                          We could not find an account, please connect your account.<br />
                        </p>
                      </div>
                    </div>
                  </div>
                :
                  this.state.params[0] === 'home' &&
                  <div>
                    <header className="col">
                      <h1 className="typo-h1 inline-headline">Dashboard <span className="typo-c typo-mid-grey">Collateralized Debt Position</span></h1>
                    </header>
                    {
                      Object.keys(this.props.system.tub.legacyCups).length > 0 &&
                      <div>
                        You have legacy CDPs to migrate:
                        {
                          Object.keys(this.props.system.tub.legacyCups).map(cupId => 
                            <a href="#action" style={ {display: 'block'} } key={ cupId } data-method="migrate" data-cup={ cupId } onClick={ this.props.dialog.handleOpenDialog }>Migrate CDP {cupId}</a>
                          )
                        }
                        <hr />
                      </div>
                    }
                    {
                      this.props.profile.proxy === -1
                      ?
                        'Loading...'
                      :
                        this.props.profile.proxy
                        ?
                          this.props.system.tub.cupsLoading
                          ?
                            'Loading...'
                          :
                            Object.keys(this.props.system.tub.cups).length > 0
                            ?
                              <Cup system={ this.props.system } profile={ this.props.profile } cupId={ this.props.system.tub.cupId ? this.props.system.tub.cupId : Object.keys(this.props.system.tub.cups)[0] } handleOpenDialog={ this.props.dialog.handleOpenDialog } />
                            :
                              <Wizard system={ this.props.system } />
                        :
                          <Wizard system={ this.props.system } />
                    }
                  </div>
              }
            </main>
            <aside className="right-column">
              <ReactNotify ref='notificator'/>
              {
                this.state.params[0] !== 'help' &&
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
      :
        <NoConnection />
    )
  }
}

export default observer(App);
