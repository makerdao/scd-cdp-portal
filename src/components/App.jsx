import React, {Component} from 'react';
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
import {WAD, fromRaytoWad, wmul, wdiv, toBigNumber, fromWei, isAddress, toAscii, methodSig} from '../helpers';
import './App.css';

import * as Blockchain from "../blockchainHandler";

import * as NetworkActions from "../actions/network";
import * as TransactionActions from "../actions/transaction";
import * as ProxyActions from "../actions/proxy";
import * as TokenActions from "../actions/token";
import * as CupActions from "../actions/cup";


const settings = require('../settings');

class App extends Component {
  constructor() {
    super();
    const initialState = this.getInitialState();
    this.state = {
      ...initialState,
      network: {},
      profile: {
        proxy: -1,
        accountBalance: toBigNumber(-1),
      },
      transactions: {},
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
      dialog: {
        show: false
      },
      params: ''
    }

    // Bindings functions imported from actions source
    Object.keys(NetworkActions).forEach(key => {
      this[key] = NetworkActions[key].bind(this);
    });
    Object.keys(TransactionActions).forEach(key => {
      this[key] = TransactionActions[key].bind(this);
    });
    Object.keys(ProxyActions).forEach(key => {
      this[key] = ProxyActions[key].bind(this);
    });
    Object.keys(TokenActions).forEach(key => {
      this[key] = TokenActions[key].bind(this);
    });
    Object.keys(CupActions).forEach(key => {
      this[key] = CupActions[key].bind(this);
    });
  }

  getInitialState = () => {
    return {
      system: {
        tub: {
          address: null,
          authority: null,
          eek: 'undefined',
          safe: 'undefined',
          off: -1,
          out: -1,
          axe: toBigNumber(-1),
          mat: toBigNumber(-1),
          cap: toBigNumber(-1),
          fit: toBigNumber(-1),
          tax: toBigNumber(-1),
          fee: toBigNumber(-1),
          chi: toBigNumber(-1),
          rhi: toBigNumber(-1),
          rho: toBigNumber(-1),
          gap: toBigNumber(-1),
          tag: toBigNumber(-1),
          per: toBigNumber(-1),
          avail_boom_skr: toBigNumber(-1),
          avail_boom_dai: toBigNumber(-1),
          avail_bust_skr: toBigNumber(-1),
          avail_bust_dai: toBigNumber(-1),
          cups: {},
          cupsLoading: true,
          cupsCount: 0,
          cupsPage: 1,
          legacyCups: {}
        },
        top: {
          address: null,
        },
        tap: {
          address: null,
          fix: toBigNumber(-1),
          gap: toBigNumber(-1),
        },
        vox: {
          address: null,
          era: toBigNumber(-1),
          tau: toBigNumber(-1),
          par: toBigNumber(-1),
          way: toBigNumber(-1),
        },
        pit: {
          address: null,
        },
        gem: {
          address: null,
          totalSupply: toBigNumber(-1),
          myBalance: toBigNumber(-1),
          tubBalance: toBigNumber(-1),
          tapBalance: toBigNumber(-1),
        },
        gov: {
          address: null,
          totalSupply: toBigNumber(-1),
          myBalance: toBigNumber(-1),
          pitBalance: toBigNumber(-1),
        },
        skr: {
          address: null,
          totalSupply: toBigNumber(-1),
          myBalance: toBigNumber(-1),
          tubBalance: toBigNumber(-1),
          tapBalance: toBigNumber(-1),
        },
        dai: {
          address: null,
          totalSupply: toBigNumber(-1),
          myBalance: toBigNumber(-1),
          tapBalance: toBigNumber(-1),
        },
        sin: {
          address: null,
          totalSupply: toBigNumber(-1),
          tubBalance: toBigNumber(-1),
          tapBalance: toBigNumber(-1),
          // This field will keep an estimated value of new sin which is being generated due the 'stability/issuer fee'.
          // It will return to zero each time 'drip' is called
          issuerFee: toBigNumber(0),
        },
        pip: {
          address: null,
          val: toBigNumber(-1),
        },
        pep: {
          address: null,
          val: toBigNumber(-1),
        },
        chartData: {
          prices: {},
          cupPrices: {},
          highestValue: 0,
        },
        stats: {
          error: false
        },
      },
    };
  }

  componentDidMount = () => {
    setTimeout(this.init, 500);
  }

  init = () => {
    initWeb3();

    this.checkNetwork();
    this.checkAccounts(false);

    this.setHashParams();

    if (localStorage.getItem('termsModal')) {
      const termsModal = JSON.parse(localStorage.getItem('termsModal'));
      this.setState({termsModal});
    }

    this.checkAccountsInterval = setInterval(this.checkAccounts, 3000);
    this.checkNetworkInterval = setInterval(this.checkNetwork, 3000);
  }

  setHashParams = () => {
    const params = window.location.hash.replace(/^#\/?|\/$/g, '').split('/');
    if (['home', 'settings', 'help'].indexOf(params[0]) === -1) {
      params[0] = 'home';
    }
    this.setState({params});
  }

  initContracts = topAddress => {
    if (!isAddress(topAddress)) {
      return;
    }
    Blockchain.resetFilters(true);
    if (typeof this.timeVariablesInterval !== 'undefined') clearInterval(this.timeVariablesInterval);
    if (typeof this.pendingTxInterval !== 'undefined') clearInterval(this.pendingTxInterval);
    const initialState = this.getInitialState();
    this.setState((prevState, props) => {
      return {system: {...initialState}.system};
    }, () => {
      Blockchain.loadObject('top', topAddress, 'top');
      const proxyRegistryAddr = settings.chain[this.state.network.network].proxyRegistry;

      const setUpPromises = [Blockchain.getContractAddr('top', 'tub'), Blockchain.getContractAddr('top', 'tap')];
      if (proxyRegistryAddr) {
        Blockchain.loadObject('proxyregistry', proxyRegistryAddr, 'proxyRegistry');
        setUpPromises.push(Blockchain.getProxyAddress(this.state.network.defaultAccount));
      }

      Promise.all(setUpPromises).then(r => {
        if (r[0] && r[1] && isAddress(r[0]) && isAddress(r[1])) {
          const setUpPromises2 = [Blockchain.getContractAddr('tub', 'vox'), Blockchain.getContractAddr('tub', 'pit')];

          Promise.all(setUpPromises2).then(r2 => {
            if (r2[0] && r2[1] && isAddress(r2[0]) && isAddress(r2[1])) {
              this.setState(prevState => {
                const system = {...prevState.system};
                const profile = {...prevState.profile};
                system.top.address = topAddress;
                system.tub.address = r[0];
                system.tap.address = r[1];

                if (proxyRegistryAddr && r[2]) {
                  profile.proxy = r[2];
                  console.log('proxy', profile.proxy);
                  Blockchain.loadObject('dsproxy', profile.proxy, 'proxy');
                } else {
                  profile.proxy = null;
                }

                system.vox.address = r2[0];
                system.pit.address = r2[1];
  
                return {system, profile};
              }, () => {
                this.initializeSystemStatus();
  
                this.setUpToken('gem');
                this.setUpToken('gov');
                this.setUpToken('skr');
                this.setUpToken('dai');
                this.setUpToken('sin');
  
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
              });
            }
          });
        } else {
          alert('This is not a Top address');
        }
      });
    });
  }

  loadEraRho = () => {
    const promises = [
                      this.getParameterFromTub('rho'),
                      this.getParameterFromVox('era')
                      ];
    Promise.all(promises).then(r => {
      if (r[0] === true && r[1] === true && this.state.system.tub.tax.gte(0) && this.state.system.sin.tubBalance.gte(0)) {
        this.setState((prevState, props) => {
          const system = {...prevState.system};
          const sin = {...system.sin};
          sin.issuerFee = system.sin.tubBalance.times(fromWei(system.tub.tax).pow(system.vox.era.minus(system.tub.rho))).minus(system.sin.tubBalance).round(0);
          system.sin = sin;
          return {system};
        });
      }
    });
  }

  setTimeVariablesInterval = () => {
    this.timeVariablesInterval = setInterval(() => {
      this.getParameterFromTub('chi', true);
      this.getParameterFromTub('rhi', true);
      this.getParameterFromVox('par', true);
      this.loadEraRho();
      this.getAccountBalance();
    }, 5000);
  }

  setNonTimeVariablesInterval = () => {
    // This interval should not be necessary if we can rely on the events
    this.timeVariablesInterval = setInterval(() => {
      this.setUpToken('gem');
      this.setUpToken('gov');
      this.setUpToken('skr');
      this.setUpToken('dai');
      this.setUpToken('sin');
      this.getParameterFromTub('authority');
      this.getParameterFromTub('off');
      this.getParameterFromTub('out');
      this.getParameterFromTub('axe', true);
      this.getParameterFromTub('mat', true, this.calculateSafetyAndDeficit);
      this.getParameterFromTub('cap');
      this.getParameterFromTub('fit');
      this.getParameterFromTub('tax', true);
      this.getParameterFromTub('fee', true);
      this.getParameterFromTub('chi', true);
      this.getParameterFromTub('rhi', true);
      this.getParameterFromTub('per', true);
      this.getParameterFromTub('gap');
      this.getParameterFromTub('tag', true, this.calculateSafetyAndDeficit);
      this.getParameterFromTap('fix', true);
      this.getParameterFromTap('gap', false, this.getBoomBustValues);
      this.getParameterFromVox('way', true);
      this.getParameterFromVox('par', true);
    }, 30000);
  }

  setPendingTxInterval = () => {
    this.pendingTxInterval = setInterval(() => {
      this.checkPendingTransactions()
    }, 10000);
  }

  getAccountBalance = () => {
    if (isAddress(this.state.network.defaultAccount)) {
      Blockchain.getEthBalanceOf(this.state.network.defaultAccount).then(r => {
        const profile = {...this.state.profile};
        profile.accountBalance = r;
        this.setState({profile});
      }, () => {});
    }
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
        this.logTransactionConfirmed(r.transactionHash);
        if (cupSignatures.indexOf(r.args.sig) !== -1 && typeof this.state.system.tub.cups[r.args.foo] !== 'undefined') {
          this.reloadCupData(parseInt(r.args.foo, 16));
        } else if (r.args.sig === methodSig('mold(bytes32,uint256)')) {
          const ray = ['axe', 'mat', 'tax', 'fee'].indexOf(toAscii(r.args.foo).substring(0,3)) !== -1;
          const callback = ['mat'].indexOf(toAscii(r.args.foo).substring(0,3)) !== -1 ? this.calculateSafetyAndDeficit: () => {};
          this.getParameterFromTub(toAscii(r.args.foo).substring(0,3), ray, callback);
        } else if (r.args.sig === methodSig('cage(uint256,uint256)')) {
          this.getParameterFromTub('off');
          this.getParameterFromTub('fit');
          this.getParameterFromTap('fix', true);
        } else if (r.args.sig === methodSig('flow()')) {
          this.getParameterFromTub('out');
        }
        if (r.args.sig === methodSig('drip()') ||
            r.args.sig === methodSig('chi()') ||
            r.args.sig === methodSig('rhi()') ||
            r.args.sig === methodSig('draw(bytes32,uint256)') ||
            r.args.sig === methodSig('wipe(bytes32,uint256)') ||
            r.args.sig === methodSig('shut(bytes32)') ||
            (r.args.sig === methodSig('mold(bytes32,uint256)') && toAscii(r.args.foo).substring(0,3) === 'tax')) {
          this.getParameterFromTub('chi', true);
          this.getParameterFromTub('rhi', true);
          this.loadEraRho();
        }
      }
    });
  }

  setFiltersTap = () => {
    Blockchain.objects.tap.LogNote({}, {fromBlock: 'latest'}, (e, r) => {
      if (!e) {
        this.logTransactionConfirmed(r.transactionHash);
        if (r.args.sig === methodSig('mold(bytes32,uint256)')) {
          this.getParameterFromTap('gap', false, this.getBoomBustValues());
        }
      }
    });
  }

  setFiltersVox = () => {
    Blockchain.objects.vox.LogNote({}, {fromBlock: 'latest'}, (e, r) => {
      if (!e) {
        this.logTransactionConfirmed(r.transactionHash);
        if (r.args.sig === methodSig('mold(bytes32,uint256)')) {
          this.getParameterFromVox('way', true);
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
          this.getValFromFeed(obj);

          Blockchain.objects[obj].LogNote({}, {fromBlock: 'latest'}, (e, r) => {
            if (!e) {
              if (
                r.args.sig === methodSig('poke(bytes32)') ||
                r.args.sig === methodSig('poke()')
              ) {
                this.getValFromFeed(obj);
                if (obj === 'pip') {
                  this.getParameterFromTub('tag', true, this.calculateSafetyAndDeficit);
                }
              }
            }
          });
        });
      }
    })
  }

  initializeSystemStatus = () => {
    this.getParameterFromTub('authority');
    this.getParameterFromTub('off');
    this.getParameterFromTub('out');
    this.getParameterFromTub('axe', true);
    this.getParameterFromTub('mat', true, this.calculateSafetyAndDeficit);
    this.getParameterFromTub('cap');
    this.getParameterFromTub('fit');
    this.getParameterFromTub('tax', true);
    this.getParameterFromTub('fee', true);
    this.getParameterFromTub('chi', true);
    this.getParameterFromTub('rhi', true);
    this.getParameterFromTub('per', true);
    this.getParameterFromTub('gap');
    this.getParameterFromTub('tag', true, this.calculateSafetyAndDeficit);
    this.getParameterFromTap('fix', true);
    this.getParameterFromTap('gap', false, this.getBoomBustValues);
    this.getParameterFromVox('way', true);
    this.getParameterFromVox('par', true);
    this.loadEraRho();
    this.getAccountBalance();
    if (settings.chain[this.state.network.network].service) {
      if (settings.chain[this.state.network.network].chart) {
        // this.getPricesFromService();
      }
      // this.getStats();
    }
  }

  calculateSafetyAndDeficit = () => {
    if (this.state.system.tub.mat.gte(0) && this.state.system.skr.tubBalance.gte(0) && this.state.system.tub.tag.gte(0) && this.state.system.sin.totalSupply.gte(0)) {
      this.setState((prevState, props) => {
        const system = {...prevState.system};
        const tub = {...system.tub};

        const pro = wmul(system.skr.tubBalance, system.tub.tag);
        const con = system.sin.totalSupply;
        tub.eek = pro.lt(con);

        const min = wmul(con, tub.mat);
        tub.safe = pro.gte(min);

        system.tub = tub;
        return {system};
      });
    }
  }

  getParameterFromTub = (field, ray = false, callback = false) => {
    const p = new Promise((resolve, reject) => {
      Blockchain.objects.tub[field].call((e, value) => {
        if (!e) {
          this.setState((prevState, props) => {
            const system = {...prevState.system};
            const tub = {...system.tub};
            tub[field] = ray ? fromRaytoWad(value) : value;
            system.tub = tub;
            return {system};
          }, () => {
            this.getBoomBustValues();
            const promises = [];
            Object.keys(this.state.system.tub.cups).map(key =>
              promises.push(this.addExtraCupData(this.state.system.tub.cups[key]))
            );
            Promise.all(promises).then(r => {
              if (r.length > 0) {
                this.setState((prevState, props) => {
                  const system = {...prevState.system};
                  const tub = {...system.tub};
                  const cups = {...tub.cups}
                  for (let i = 0; i < r.length; i++) {
                    if (typeof cups[r[i].id] !== 'undefined') {
                      cups[r[i].id].pro = r[i].pro;
                      cups[r[i].id].ratio = r[i].ratio;
                      cups[r[i].id].avail_dai = r[i].avail_dai;
                      cups[r[i].id].avail_dai_with_margin = r[i].avail_dai_with_margin;
                      cups[r[i].id].avail_skr = r[i].avail_skr;
                      cups[r[i].id].avail_skr_with_margin = r[i].avail_skr_with_margin;
                      cups[r[i].id].liq_price = r[i].liq_price;
                      cups[r[i].id].safe = r[i].safe;
                    }
                  }
                  tub.cups = cups;
                  system.tub = tub;
                  return {system};
                });
              }
            });
            if (callback) {
              callback(value);
            }
            resolve(true);
          });
        } else {
          reject(e);
        }
      });
    });
    return p;
  }

  getParameterFromTap = (field, ray = false) => {
    const p = new Promise((resolve, reject) => {
      Blockchain.objects.tap[field].call((e, value) => {
        if (!e) {
          this.setState((prevState, props) => {
            const system = {...prevState.system};
            const tap = {...system.tap};
            tap[field] = ray ? fromRaytoWad(value) : value;
            system.tap = tap;
            return {system};
          }, () => {
            resolve(true);
          });
        } else {
          reject(e);
        }
      });
    });
    return p;
  }

  getParameterFromVox = (field, ray = false) => {
    const p = new Promise((resolve, reject) => {
      Blockchain.objects.vox[field].call((e, value) => {
        if (!e) {
          this.setState((prevState, props) => {
            const system = {...prevState.system};
            const vox = {...system.vox};
            vox[field] = ray ? fromRaytoWad(value) : value;
            system.vox = vox;
            return {system};
          }, () => {
            resolve(true);
          });
        } else {
          reject(e);
        }
      });
    });
    return p;
  }

  getValFromFeed = (obj) => {
    const p = new Promise((resolve, reject) => {
      Blockchain.objects[obj].peek.call((e, r) => {
        if (!e) {
          this.setState((prevState, props) => {
            const system = {...prevState.system};
            const feed = {...system[obj]};
            feed.val = toBigNumber(r[1] ? parseInt(r[0], 16) : -2);
            system[obj] = feed;
            return {system};
          }, () => {
            if (obj === 'pip') {
              this.getBoomBustValues();
            }
            resolve(true);
          });
        } else {
          reject(e);
        }
      });
    });
    return p;
  }

  getBoomBustValues = () => {
    if (this.state.system.dai.tapBalance.gte(0)
    //&& this.state.system.sin.issuerFee.gte(0)
    && this.state.system.sin.tapBalance.gte(0)
    && this.state.system.vox.par.gte(0)
    && this.state.system.tub.tag.gte(0)
    && this.state.system.tap.gap.gte(0)
    && this.state.system.pip.val.gte(0)
    && this.state.system.skr.tapBalance.gte(0)
    && this.state.system.sin.tubBalance.gte(0)
    && this.state.system.tub.tax.gte(0)
    && this.state.system.skr.tapBalance.gte(0)
    && this.state.system.skr.totalSupply.gte(0)
    && this.state.system.gem.tubBalance.gte(0)) {
      this.setState((prevState, props) => {
        const system = {...prevState.system};
        const tub = {...system.tub};

        // const dif = system.dai.tapBalance.add(system.sin.issuerFee).minus(system.sin.tapBalance); bust & boom don't execute drip anymore so we do not need to do the estimation
        const dif = system.dai.tapBalance.minus(system.sin.tapBalance);
        tub.avail_boom_dai = tub.avail_boom_skr = toBigNumber(0);
        tub.avail_bust_dai = tub.avail_bust_skr = toBigNumber(0);

        // if higher or equal, it means vox.par is static or increases over the time
        // if lower, it means it decreases over the time, so we calculate a future par (in 10 minutes) to reduce risk of tx failures
        const futurePar = system.vox.way.gte(WAD) ? system.vox.par : system.vox.par.times(fromWei(system.vox.way).pow(10*60));

        if (dif.gt(0)) {
          // We can boom
          tub.avail_boom_dai = dif;
          tub.avail_boom_skr = wdiv(wdiv(wmul(tub.avail_boom_dai, futurePar), system.tub.tag), WAD.times(2).minus(system.tap.gap));
        }

        if (system.skr.tapBalance.gt(0) || dif.lt(0)) {
          // We can bust

          // This is a margin we need to take into account as bust quantity goes down per second
          // const futureFee = system.sin.tubBalance.times(fromWei(tub.tax).pow(120)).minus(system.sin.tubBalance).round(0); No Drip anymore!!!
          // const daiNeeded = dif.abs().minus(futureFee);
          const daiNeeded = dif.gte(0) ? toBigNumber(0) : dif.abs();
          const equivalentSKR = wdiv(wdiv(wmul(daiNeeded, futurePar), system.tub.tag), system.tap.gap);

          if (system.skr.tapBalance.gte(equivalentSKR)) {
            tub.avail_bust_skr = system.skr.tapBalance;
            tub.avail_bust_ratio = wmul(wmul(wdiv(WAD, system.vox.par), system.tub.tag), system.tap.gap);
            tub.avail_bust_dai = wmul(tub.avail_bust_skr, tub.avail_bust_ratio);
          } else {
            tub.avail_bust_dai = daiNeeded;
            // We need to consider the case where PETH needs to be minted generating a change in 'system.tub.tag'
            tub.avail_bust_skr = wdiv(system.skr.totalSupply.minus(system.skr.tapBalance), wdiv(wmul(wmul(system.pip.val, system.tap.gap), system.gem.tubBalance), wmul(tub.avail_bust_dai, system.vox.par)).minus(WAD));
            tub.avail_bust_ratio = wdiv(tub.avail_bust_dai, tub.avail_bust_skr);
          }
        }
        system.tub = tub;
        return {system};
      });
    }
  }

  // Dialog
  handleOpenDialog = e => {
    e.preventDefault();
    const method = e.target.getAttribute('data-method');
    const cupId = e.target.getAttribute('data-cup') ? e.target.getAttribute('data-cup') : false;
    this.setState({dialog: {show: true, method, cup: cupId}});
  }

  handleCloseDialog = e => {
    e.preventDefault();
    this.setState({dialog: {show: false}});
  }

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
    const cupId = this.state.system.tub.cupId ? this.state.system.tub.cupId : Object.keys(this.state.system.tub.cups)[0];

    return (
      <div className={ this.state.params[0] === 'help' ? "full-width-page" : this.state.dialog.show ? "dialog-open" : "" }>
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
                  !this.state.system.tub.cupsLoading && Object.keys(this.state.system.tub.cups).length > 1 &&
                  Object.keys(this.state.system.tub.cups).map(key =>
                    <li key={ key } data-cupId={ key } className={ cupId === key ? 'active' : '' } onClick={ this.changeCup }>
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
                network={ this.state.network.network }
                system={ this.state.system }
                account={ this.state.network.defaultAccount }
                profile={ this.state.profile }
                handleOpenDialog={ this.handleOpenDialog }
                approve={ this.approve }
                approveAll={ this.approveAll }
                wrapUnwrap={ this.wrapUnwrap }
                transferToken={ this.transferToken } />
            }
            {
              this.state.params[0] === 'help' &&
              <Help />
            }
            {
              !this.state.network.defaultAccount
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
                    Object.keys(this.state.system.tub.legacyCups).length > 0 &&
                    <div>
                      You have legacy CDPs to migrate:
                      {
                        Object.keys(this.state.system.tub.legacyCups).map(cupId => 
                          <a href="#action" style={ {display: 'block'} } key={ cupId } data-method="migrate" data-cup={ cupId } onClick={ this.handleOpenDialog }>Migrate CDP {cupId}</a>
                        )
                      }
                      <hr />
                    </div>
                  }
                  {
                    this.state.profile.proxy === -1
                    ?
                      'Loading...'
                    :
                      this.state.profile.proxy
                      ?
                        this.state.system.tub.cupsLoading
                        ?
                          'Loading...'
                        :
                          Object.keys(this.state.system.tub.cups).length > 0
                          ?
                            <Cup system={ this.state.system } profile={ this.state.profile } tab={ this.tab } handleOpenDialog={ this.handleOpenDialog } dialog={ this.state.dialog } />
                          :
                            <Wizard system={ this.state.system } checkProxy={ this.checkProxy } />
                      :
                        <Wizard system={ this.state.system } checkProxy={ this.checkProxy } />
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
                  <Wallet system={ this.state.system } network={ this.state.network.network } profile={ this.state.profile } account={ this.state.network.defaultAccount } />
                  <SystemInfo system={ this.state.system } network={ this.state.network.network } profile={ this.state.profile } pipVal = { this.state.system.pip.val } pepVal = { this.state.system.pep.val } handleOpenDialog={ this.handleOpenDialog } />
                </div>	
                <div className="footer col col-no-border typo-cs typo-grid-grey">
                  <a href="#action" onClick={ this.handleOpenTermsModal } data-modal="announcement">Dai Public Announcement</a> || <a href="#action" onClick={ this.handleOpenTermsModal } data-modal="terms">Dai Terms of Service</a>
                </div>
              </div>
            }
          </aside>
        </div>
        <Dialog system={ this.state.system } profile={ this.state.profile } dialog={ this.state.dialog } executeAction={ this.executeAction } handleCloseDialog={ this.handleCloseDialog } tab={ this.tab } rap={ this.rap } proxyEnabled={ this.state.profile.mode === 'proxy' && isAddress(this.state.profile.proxy) } calculateCupData={ this.calculateCupData } />
        <TermsModal modal={ this.state.termsModal } markAsAccepted={ this.markAsAccepted } />
        <VideoModal modal={ this.state.videoModal } termsModal={ this.state.termsModal } handleCloseVideoModal={ this.handleCloseVideoModal } />
        <TerminologyModal modal={ this.state.terminologyModal } handleCloseTerminologyModal={ this.handleCloseTerminologyModal } />
      </div>
    );
  }

  render() {
    return (
      this.state.network.isConnected ? this.renderMain() : <NoConnection />
    );
  }
}

export default App;
