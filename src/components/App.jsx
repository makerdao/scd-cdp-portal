import React from 'react';
import {observer} from "mobx-react";

import NoConnection from './NoConnection';
import TermsModal from './modals/TermsModal';
import Dialog from './Dialog';
import VideoModal from './modals/VideoModal';
import TerminologyModal from './modals/TerminologyModal';
import Wizard from './Wizard';
import SystemInfo from './SystemInfo';
import Wallet from './Wallet';
import Settings from './Settings';
import Help from './Help';
import Cup from './Cup';
import {initWeb3} from  '../web3';
import ReactNotify from '../notify';
import {isAddress, toAscii, methodSig} from '../helpers';
import './App.css';

import * as Blockchain from "../blockchainHandler";

const settings = require('../settings');

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      termsModal: {
        announcement: true,
        terms: true,
        video: true,
      },
      videoModal: {
        show: false
      },
      terminologyModal: {
        show: false
      },
      params: ''
    }
  }

  componentDidMount = () => {
    // TODO: Find another way to pass the refs for the notificator to the store
    this.props.transactions.component = this;
    setTimeout(this.init, 500);
  }

  init = () => {
    initWeb3();

    this.props.network.checkNetwork(this.initContracts);
    this.props.network.checkAccounts(this.initContracts);

    this.setHashParams();

    if (localStorage.getItem('termsModal')) {
      const termsModal = JSON.parse(localStorage.getItem('termsModal'));
      this.setState({termsModal});
    }

    this.checkAccountsInterval = setInterval(this.props.network.checkAccounts.bind(this.initContracts), 3000);
    this.checkNetworkInterval = setInterval(this.props.network.checkNetwork.bind(this.initContracts), 3000);
  }

  setHashParams = () => {
    const params = window.location.hash.replace(/^#\/?|\/$/g, '').split('/');
    if (['home', 'settings', 'help'].indexOf(params[0]) === -1) {
      params[0] = 'home';
    }
    this.setState({params});
  }

  initContracts = () => {
    const topAddress = settings.chain[this.props.network.network].top;

    Blockchain.resetFilters(true);
    if (typeof this.timeVariablesInterval !== 'undefined') clearInterval(this.timeVariablesInterval);
    if (typeof this.pendingTxInterval !== 'undefined') clearInterval(this.pendingTxInterval);

    this.props.system.getInitialState();

    Blockchain.loadObject('top', topAddress, 'top');
    const proxyRegistryAddr = settings.chain[this.props.network.network].proxyRegistry;
    Blockchain.loadObject('proxyregistry', proxyRegistryAddr, 'proxyRegistry');

    const setUpPromises = [Blockchain.getContractAddr('top', 'tub'), Blockchain.getContractAddr('top', 'tap'), this.props.profile.setProxyAddress(this.props.network.defaultAccount)];

    Promise.all(setUpPromises).then(r => {
      if (r[0] && r[1] && isAddress(r[0]) && isAddress(r[1])) {
        const setUpPromises2 = [Blockchain.getContractAddr('tub', 'vox'), Blockchain.getContractAddr('tub', 'pit')];

        Promise.all(setUpPromises2).then(r2 => {
          if (r2[0] && r2[1] && isAddress(r2[0]) && isAddress(r2[1])) {
            this.props.system.top.address = topAddress;
            this.props.system.tub.address = r[0];
            this.props.system.tap.address = r[1];

            this.props.system.vox.address = r2[0];
            this.props.system.pit.address = r2[1];

            this.initializeSystemStatus();

            this.props.system.setUpToken('gem');
            this.props.system.setUpToken('gov');
            this.props.system.setUpToken('skr');
            this.props.system.setUpToken('dai');
            this.props.system.setUpToken('sin');

            this.getMyCups();
            this.getMyLegacyCups();

            this.setFiltersTub();
            this.setFiltersTap();
            this.setFiltersVox();
            this.setFilterFeedValue('pip');
            this.setFilterFeedValue('pep');
            this.setTimeVariablesInterval();
            this.setNonTimeVariablesInterval();

            // This is necessary to finish transactions that failed after signing
            this.setPendingTxInterval();
          }
        });
      } else {
        alert('This is not a Top address');
      }
    });
  }

  setTimeVariablesInterval = () => {
    this.timeVariablesInterval = setInterval(() => {
      this.props.system.getParameterFromTub('chi', true);
      this.props.system.getParameterFromTub('rhi', true);
      this.props.system.getParameterFromVox('par', true);
      this.props.system.loadEraRho();
      this.getAccountBalance();
    }, 5000);
  }

  getAccountBalance = () => {
    this.props.profile.getAccountBalance(this.props.network.defaultAccount);
  }

  setNonTimeVariablesInterval = () => {
    // This interval should not be necessary if we can rely on the events
    this.timeVariablesInterval = setInterval(() => {
      this.props.system.setUpToken('gem');
      this.props.system.setUpToken('gov');
      this.props.system.setUpToken('skr');
      this.props.system.setUpToken('dai');
      this.props.system.setUpToken('sin');
      this.props.system.getParameterFromTub('authority');
      this.props.system.getParameterFromTub('off');
      this.props.system.getParameterFromTub('out');
      this.props.system.getParameterFromTub('axe', true);
      this.props.system.getParameterFromTub('mat', true, this.props.system.calculateSafetyAndDeficit);
      this.props.system.getParameterFromTub('cap');
      this.props.system.getParameterFromTub('fit');
      this.props.system.getParameterFromTub('tax', true);
      this.props.system.getParameterFromTub('fee', true);
      this.props.system.getParameterFromTub('chi', true);
      this.props.system.getParameterFromTub('rhi', true);
      this.props.system.getParameterFromTub('per', true);
      this.props.system.getParameterFromTub('gap');
      this.props.system.getParameterFromTub('tag', true, this.props.system.calculateSafetyAndDeficit);
      this.props.system.getParameterFromTap('fix', true);
      this.props.system.getParameterFromTap('gap', false, this.props.system.getBoomBustValues);
      this.props.system.getParameterFromVox('way', true);
      this.props.system.getParameterFromVox('par', true);
    }, 30000);
  }

  setPendingTxInterval = () => {
    this.pendingTxInterval = setInterval(() => {
      this.props.transactions.checkPendingTransactions()
    }, 10000);
  }

  setFiltersTub = () => {
    const cupSignatures = [
      'lock(bytes32,uint256)',
      'free(bytes32,uint256)',
      'draw(bytes32,uint256)',
      'wipe(bytes32,uint256)',
      'bite(bytes32)',
      'shut(bytes32)',
      'give(bytes32,address)',
    ].map(v => methodSig(v));

    Blockchain.objects.tub.LogNote({}, {fromBlock: 'latest'}, (e, r) => {
      if (!e) {
        this.props.transactions.logTransactionConfirmed(r.transactionHash);
        if (cupSignatures.indexOf(r.args.sig) !== -1 && typeof this.props.system.tub.cups[r.args.foo] !== 'undefined') {
          this.reloadCupData(parseInt(r.args.foo, 16));
        } else if (r.args.sig === methodSig('mold(bytes32,uint256)')) {
          const ray = ['axe', 'mat', 'tax', 'fee'].indexOf(toAscii(r.args.foo).substring(0,3)) !== -1;
          const callback = ['mat'].indexOf(toAscii(r.args.foo).substring(0,3)) !== -1 ? this.props.system.calculateSafetyAndDeficit: () => {};
          this.props.system.getParameterFromTub(toAscii(r.args.foo).substring(0,3), ray, callback);
        } else if (r.args.sig === methodSig('cage(uint256,uint256)')) {
          this.props.system.getParameterFromTub('off');
          this.props.system.getParameterFromTub('fit');
          this.props.system.getParameterFromTap('fix', true);
        } else if (r.args.sig === methodSig('flow()')) {
          this.props.system.getParameterFromTub('out');
        }
        if (r.args.sig === methodSig('drip()') ||
            r.args.sig === methodSig('chi()') ||
            r.args.sig === methodSig('rhi()') ||
            r.args.sig === methodSig('draw(bytes32,uint256)') ||
            r.args.sig === methodSig('wipe(bytes32,uint256)') ||
            r.args.sig === methodSig('shut(bytes32)') ||
            (r.args.sig === methodSig('mold(bytes32,uint256)') && toAscii(r.args.foo).substring(0,3) === 'tax')) {
          this.props.system.getParameterFromTub('chi', true);
          this.props.system.getParameterFromTub('rhi', true);
          this.props.system.loadEraRho();
        }
      }
    });
  }

  setFiltersTap = () => {
    Blockchain.objects.tap.LogNote({}, {fromBlock: 'latest'}, (e, r) => {
      if (!e) {
        this.props.transactions.logTransactionConfirmed(r.transactionHash);
        if (r.args.sig === methodSig('mold(bytes32,uint256)')) {
          this.props.system.getParameterFromTap('gap', false, this.props.system.getBoomBustValues());
        }
      }
    });
  }

  setFiltersVox = () => {
    Blockchain.objects.vox.LogNote({}, {fromBlock: 'latest'}, (e, r) => {
      if (!e) {
        this.props.transactions.logTransactionConfirmed(r.transactionHash);
        if (r.args.sig === methodSig('mold(bytes32,uint256)')) {
          this.props.system.getParameterFromVox('way', true);
        }
      }
    });
  }

  setFilterFeedValue = obj => {
    Blockchain.objects.tub[obj].call((e, r) => {
      if (!e) {
        this.setState((prevState, props) => {
          const system = {...prevState.system};
          const feed = {...system[obj]};
          feed.address = r;
          system[obj] = feed;
          return {system};
        }, () => {
          Blockchain.loadObject('dsvalue', r, obj);
          this.props.system.getValFromFeed(obj);

          Blockchain.objects[obj].LogNote({}, {fromBlock: 'latest'}, (e, r) => {
            if (!e) {
              if (
                r.args.sig === methodSig('poke(bytes32)') ||
                r.args.sig === methodSig('poke()')
              ) {
                this.props.system.getValFromFeed(obj);
                if (obj === 'pip') {
                  this.props.system.getParameterFromTub('tag', true, this.props.system.calculateSafetyAndDeficit);
                }
              }
            }
          });
        });
      }
    })
  }

  initializeSystemStatus = () => {
    this.props.system.getParameterFromTub('authority');
    this.props.system.getParameterFromTub('off');
    this.props.system.getParameterFromTub('out');
    this.props.system.getParameterFromTub('axe', true);
    this.props.system.getParameterFromTub('mat', true, this.props.system.calculateSafetyAndDeficit);
    this.props.system.getParameterFromTub('cap');
    this.props.system.getParameterFromTub('fit');
    this.props.system.getParameterFromTub('tax', true);
    this.props.system.getParameterFromTub('fee', true);
    this.props.system.getParameterFromTub('chi', true);
    this.props.system.getParameterFromTub('rhi', true);
    this.props.system.getParameterFromTub('per', true);
    this.props.system.getParameterFromTub('gap');
    this.props.system.getParameterFromTub('tag', true, this.props.system.calculateSafetyAndDeficit);
    this.props.system.getParameterFromTap('fix', true);
    this.props.system.getParameterFromTap('gap', false, this.props.system.getBoomBustValues);
    this.props.system.getParameterFromVox('way', true);
    this.props.system.getParameterFromVox('par', true);
    this.props.system.loadEraRho();
    this.getAccountBalance();
    if (settings.chain[this.props.network.network].service) {
      if (settings.chain[this.props.network.network].chart) {
        // this.getPricesFromService();
      }
      // this.getStats();
    }
  }

  // TODO: Callbacks mapping
  getMyCups = () => {
    this.props.system.getMyCups();
  }
  
  getMyLegacyCups = () => {
    this.props.system.getCups('legacy');
  }
  
  reloadCupData = (id) => {
    this.props.system.reloadCupData(id);
  }
  //

  // Modals
  handleOpenVideoModal = e => {
    e.preventDefault();
    this.setState({videoModal: {show: true}});
  }

  handleOpenTermsModal = e => {
    e.preventDefault();
    const termsModal = {...this.state.termsModal};
    termsModal[e.target.getAttribute('data-modal')] = true;
    this.setState({termsModal: termsModal});
  }

  handleCloseVideoModal = e => {
    e.preventDefault();
    this.markAsAccepted('video');
    this.setState({videoModal: {show: false}});
  }

  handleOpenTerminologyModal = e => {
    e.preventDefault();
    this.setState({terminologyModal: {show: true}});
  }

  handleCloseTerminologyModal = e => {
    e.preventDefault();
    this.setState({terminologyModal: {show: false}});
  }

  markAsAccepted = type => {
    const termsModal = {...this.state.termsModal};
    termsModal[type] = false;
    this.setState({termsModal}, () => {
      localStorage.setItem('termsModal', JSON.stringify(termsModal));
    });
  }
  //

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

  renderMain() {
    const cupId = this.props.system.tub.cupId ? this.props.system.tub.cupId : Object.keys(this.props.system.tub.cups)[0];

    return (
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
                    <li key={ key } data-cupId={ key } className={ cupId === key ? 'active' : '' } onClick={ this.props.system.changeCup }>
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
                            <Cup system={ this.props.system } profile={ this.props.profile } cupId={ this.props.system.tub.cupId ? this.props.system.tub.cupId : Object.keys(this.props.system.tub.cups)[0] } handleOpenDialog={ this.props.dialog.handleOpenDialog } dialog={ this.props.dialog.dialog } />
                          :
                            <Wizard system={ this.props.system } checkProxy={ this.props.profile.checkProxy } />
                      :
                        <Wizard system={ this.props.system } checkProxy={ this.props.profile.checkProxy } />
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
                  <SystemInfo system={ this.props.system } network={ this.props.network.network } profile={ this.props.profile } pipVal = { this.props.system.pip.val } pepVal = { this.props.system.pep.val } handleOpenDialog={ this.props.dialog.handleOpenDialog } />
                </div>	
                <div className="footer col col-no-border typo-cs typo-grid-grey">
                  <a href="#action" onClick={ this.handleOpenTermsModal } data-modal="announcement">Dai Public Announcement</a> || <a href="#action" onClick={ this.handleOpenTermsModal } data-modal="terms">Dai Terms of Service</a>
                </div>
              </div>
            }
          </aside>
        </div>
        <Dialog system={ this.props.system } profile={ this.props.profile } dialog={ this.props.dialog.dialog } handleCloseDialog={ this.props.dialog.handleCloseDialog } calculateCupData={ this.props.system.calculateCupData } />
        <TermsModal modal={ this.state.termsModal } markAsAccepted={ this.markAsAccepted } />
        <VideoModal modal={ this.state.videoModal } termsModal={ this.state.termsModal } handleCloseVideoModal={ this.handleCloseVideoModal } />
        <TerminologyModal modal={ this.state.terminologyModal } handleCloseTerminologyModal={ this.handleCloseTerminologyModal } />
      </div>
    );
  }

  render() {
    return (
      this.props.network.isConnected ? this.renderMain() : <NoConnection />
    );
  }
}

export default observer(App);
