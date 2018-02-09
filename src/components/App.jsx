import React, { Component } from 'react';
import NoConnection from './NoConnection';
import TermsModal from './modals/TermsModal';
import Dialog from './Dialog';
import VideoModal from './modals/VideoModal';
import TerminologyModal from './modals/TerminologyModal';
import SystemInfo from './SystemInfo';
import Wallet from './Wallet';
import Settings from './Settings';
import Help from './Help';
import Cup from './Cup';
import web3, { initWeb3 } from  '../web3';
import ReactNotify from '../notify';
import { WAD, toBytes32, addressToBytes32, fromRaytoWad, wmul, wdiv, etherscanTx } from '../helpers';
import './App.css';

const settings = require('../settings');

const tub = require('../abi/saitub');
const top = require('../abi/saitop');
const tap = require('../abi/saitap');
const vox = require('../abi/saivox');
const dsproxyfactory = require('../abi/dsproxyfactory');
const dsproxy = require('../abi/dsproxy');
const dsethtoken = require('../abi/dsethtoken');
const dstoken = require('../abi/dstoken');
const dsvalue = require('../abi/dsvalue');

class App extends Component {
  constructor() {
    super();
    const initialState = this.getInitialState();
    this.state = {
      ...initialState,
      network: {},
      profile: {
        mode: localStorage.getItem('mode') || 'account',
        proxy: null,
        activeProfile: null,
        accountBalance: web3.toBigNumber(-1),
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
          axe: web3.toBigNumber(-1),
          mat: web3.toBigNumber(-1),
          cap: web3.toBigNumber(-1),
          fit: web3.toBigNumber(-1),
          tax: web3.toBigNumber(-1),
          fee: web3.toBigNumber(-1),
          chi: web3.toBigNumber(-1),
          rhi: web3.toBigNumber(-1),
          rho: web3.toBigNumber(-1),
          gap: web3.toBigNumber(-1),
          tag: web3.toBigNumber(-1),
          per: web3.toBigNumber(-1),
          avail_boom_skr: web3.toBigNumber(-1),
          avail_boom_dai: web3.toBigNumber(-1),
          avail_bust_skr: web3.toBigNumber(-1),
          avail_bust_dai: web3.toBigNumber(-1),
          cups: {},
          cupsList: localStorage.getItem('cupsList') || 'mine',
          cupsLoading: true,
          cupsCount: 0,
          cupsPage: 1,
          ownCup: false,
        },
        top: {
          address: null,
        },
        tap: {
          address: null,
          fix: web3.toBigNumber(-1),
          gap: web3.toBigNumber(-1),
        },
        vox: {
          address: null,
          era: web3.toBigNumber(-1),
          tau: web3.toBigNumber(-1),
          par: web3.toBigNumber(-1),
          way: web3.toBigNumber(-1),
        },
        pit: {
          address: null,
        },
        gem: {
          address: null,
          totalSupply: web3.toBigNumber(-1),
          myBalance: web3.toBigNumber(-1),
          tubBalance: web3.toBigNumber(-1),
          tapBalance: web3.toBigNumber(-1),
          tubApproved: -1,
          tapApproved: -1,
        },
        gov: {
          address: null,
          totalSupply: web3.toBigNumber(-1),
          myBalance: web3.toBigNumber(-1),
          pitBalance: web3.toBigNumber(-1),
          tubApproved: -1,
        },
        skr: {
          address: null,
          totalSupply: web3.toBigNumber(-1),
          myBalance: web3.toBigNumber(-1),
          tubBalance: web3.toBigNumber(-1),
          tapBalance: web3.toBigNumber(-1),
          tubApproved: -1,
          tapApproved: -1,
        },
        dai: {
          address: null,
          totalSupply: web3.toBigNumber(-1),
          myBalance: web3.toBigNumber(-1),
          tapBalance: web3.toBigNumber(-1),
          tubApproved: -1,
          tapApproved: -1,
        },
        sin: {
          address: null,
          totalSupply: web3.toBigNumber(-1),
          tubBalance: web3.toBigNumber(-1),
          tapBalance: web3.toBigNumber(-1),
          // This field will keep an estimated value of new sin which is being generated due the 'stability/issuer fee'.
          // It will return to zero each time 'drip' is called
          issuerFee: web3.toBigNumber(0),
        },
        pip: {
          address: null,
          val: web3.toBigNumber(-1),
        },
        pep: {
          address: null,
          val: web3.toBigNumber(-1),
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

  checkNetwork = () => {
    web3.version.getNode(error => {
      const isConnected = !error;

      // Check if we are synced
      if (isConnected) {
        web3.eth.getBlock('latest', (e, res) => {
          if (typeof(res) === 'undefined') {
            console.debug('YIKES! getBlock returned undefined!');
          }
          if (res.number >= this.state.network.latestBlock) {
            const networkState = { ...this.state.network };
            networkState.latestBlock = res.number;
            networkState.outOfSync = e != null || ((new Date().getTime() / 1000) - res.timestamp) > 600;
            this.setState({ network: networkState });
          } else {
            // XXX MetaMask frequently returns old blocks
            // https://github.com/MetaMask/metamask-plugin/issues/504
            console.debug('Skipping old block');
          }
        });
      }

      // Check which network are we connected to
      // https://github.com/ethereum/meteor-dapp-wallet/blob/90ad8148d042ef7c28610115e97acfa6449442e3/app/client/lib/ethereum/walletInterface.js#L32-L46
      if (this.state.network.isConnected !== isConnected) {
        if (isConnected === true) {
          web3.eth.getBlock(0, (e, res) => {
            let network = false;
            if (!e) {
              switch (res.hash) {
                case '0xa3c565fc15c7478862d50ccd6561e3c06b24cc509bf388941c25ea985ce32cb9':
                  network = 'kovan';
                  break;
                case '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3':
                  network = 'main';
                  break;
                default:
                  console.log('setting network to private');
                  console.log('res.hash:', res.hash);
                  network = 'private';
              }
            }
            if (this.state.network.network !== network) {
              this.initNetwork(network);
            }
          });
        } else {
          const networkState = { ...this.state.network };
          networkState.isConnected = isConnected;
          networkState.network = false;
          networkState.latestBlock = 0;
          this.setState({ network: networkState });
        }
      }
    });
  }

  initNetwork = newNetwork => {
    //checkAccounts();
    const networkState = { ...this.state.network };
    networkState.network = newNetwork;
    networkState.isConnected = true;
    networkState.latestBlock = 0;
    this.setState({ network: networkState }, () => {
      const addrs = settings.chain[this.state.network.network];
      this.initContracts(addrs.top);
    });
  }

  checkAccounts = (checkAccountChange = true) => {
    web3.eth.getAccounts((error, accounts) => {
      if (!error) {
        const networkState = { ...this.state.network };
        networkState.accounts = accounts;
        const oldDefaultAccount = networkState.defaultAccount;
        networkState.defaultAccount = accounts[0];
        web3.eth.defaultAccount = networkState.defaultAccount;
        this.setState({ network: networkState }, () => {
          if (checkAccountChange && oldDefaultAccount !== networkState.defaultAccount) {
            this.initContracts(this.state.system.top.address);
          }
        });
      }
    });
  }

  componentDidMount = () => {
    setTimeout(this.init, 500);
  }

  init = () => {
    initWeb3(web3);

    this.checkNetwork();
    this.checkAccounts(false);

    this.setHashParams();
    // window.onhashchange = () => {
    //   this.setHashParams();
    //   this.initContracts(this.state.system.top.address);
    // }

    if (localStorage.getItem('termsModal')) {
      const termsModal = JSON.parse(localStorage.getItem('termsModal'));
      this.setState({ termsModal });
    }

    this.checkAccountsInterval = setInterval(this.checkAccounts, 3000);
    this.checkNetworkInterval = setInterval(this.checkNetwork, 3000);
  }

  setHashParams = () => {
    const params = window.location.hash.replace(/^#\/?|\/$/g, '').split('/');
    if (['home', 'settings', 'help'].indexOf(params[0]) === -1) {
      params[0] = 'home';
    }
    this.setState({ params });
  }

  loadObject = (abi, address) => {
    return web3.eth.contract(abi).at(address);
  }

  validateAddresses = topAddress => {
    return web3.isAddress(topAddress);
  }

  initContracts = topAddress => {
    if (!this.validateAddresses(topAddress)) {
      return;
    }
    web3.reset(true);
    if (typeof this.timeVariablesInterval !== 'undefined') clearInterval(this.timeVariablesInterval);
    if (typeof this.pendingTxInterval !== 'undefined') clearInterval(this.pendingTxInterval);
    const initialState = this.getInitialState();
    this.setState((prevState, props) => {
      return { system: {...initialState}.system };
    }, () => {
      window.topObj = this.topObj = this.loadObject(top.abi, topAddress);
      const addrs = settings.chain[this.state.network.network];

      const setUpPromises = [this.getTubAddress(), this.getTapAddress()];
      if (addrs.proxyFactory) {
        window.proxyFactoryObj = this.proxyFactoryObj = this.loadObject(dsproxyfactory.abi, addrs.proxyFactory);
        setUpPromises.push(this.getProxyAddress());
      }
      Promise.all(setUpPromises).then(r => {
        if (r[0] && r[1] && web3.isAddress(r[0]) && web3.isAddress(r[1])) {
          window.tubObj = this.tubObj = this.loadObject(tub.abi, r[0]);
          window.tapObj = this.tapObj = this.loadObject(tap.abi, r[1]);
          const system = { ...this.state.system };
          const profile = { ...this.state.profile };

          system.top.address = topAddress;
          system.tub.address = r[0];
          system.tap.address = r[1];

          if (addrs.proxyFactory && r[2]) {
            profile.proxy = r[2];
            profile.activeProfile = localStorage.getItem('mode') === 'proxy' ? profile.proxy : this.state.network.defaultAccount;
            window.proxyObj = this.proxyObj = this.loadObject(dsproxy.abi, profile.proxy);
          } else {
            profile.activeProfile = this.state.network.defaultAccount;
            profile.mode = 'account';
            localStorage.setItem('mode', 'account');
          }

          this.setState({ system, profile }, () => {
            const promises = [this.setUpVox(), this.setUpPit()];
            Promise.all(promises).then(r => {
              this.initializeSystemStatus();

              this.setUpToken('gem');
              this.setUpToken('gov');
              this.setUpToken('skr');
              this.setUpToken('dai');
              this.setUpToken('sin');

              this.getCups(settings['CDPsPerPage']);

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
          sin.issuerFee = system.sin.tubBalance.times(web3.fromWei(system.tub.tax).pow(system.vox.era.minus(system.tub.rho))).minus(system.sin.tubBalance).round(0);
          system.sin = sin;
          return { system };
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
    if (web3.isAddress(this.state.profile.activeProfile)) {
      web3.eth.getBalance(this.state.profile.activeProfile, (e, r) => {
        const profile = { ...this.state.profile };
        profile.accountBalance = r;
        this.setState({ profile });
      });
    }
  }

  getTubAddress = () => {
    const p = new Promise((resolve, reject) => {
      this.topObj.tub.call((e, r) => {
        if (!e) {
          resolve(r);
        } else {
          reject(e);
        }
      });
    });
    return p;
  }

  getTapAddress = () => {
    const p = new Promise((resolve, reject) => {
      this.topObj.tap.call((e, r) => {
        if (!e) {
          resolve(r);
        } else {
          reject(e);
        }
      });
    });
    return p;
  }

  getProxyOwner = (proxy) => {
    return new Promise((resolve, reject) => {
      this.loadObject(dsproxy.abi, proxy).owner((e, r) => {
        if (!e) {
          resolve(r);
        } else {
          reject(e);
        }
      });
    });
  }

  getProxyAddress = () => {
    const network = this.state.network;
    return new Promise((resolve, reject) => {
      const addrs = settings.chain[network.network];
      this.proxyFactoryObj.Created({ sender: network.defaultAccount }, { fromBlock: addrs.fromBlock }).get(async (e, r) => {
        if (!e) {
          if (r.length > 0) {
            for (let i = r.length - 1; i >= 0; i--) {
              if (await this.getProxyOwner(r[i].args.proxy) === network.defaultAccount) {
                resolve(r[i].args.proxy);
                break;
              }
            }
            resolve(null);
          } else {
            resolve(null);
          }
        } else {
          reject(e);
        }
      });
    });
  }

  setUpVox = () => {
    const p = new Promise((resolve, reject) => {
      this.tubObj.vox.call((e, r) => {
        if (!e) {
          this.setState((prevState, props) => {
            const system = {...prevState.system};
            const vox = {...system.vox};
            vox.address = r;
            system.vox = vox;
            return { system };
          }, () => {
            window.voxObj = this.voxObj = this.loadObject(vox.abi, r);
            resolve(true);
          });
        } else {
          reject(e);
        }
      });
    });
    return p;
  }

  setUpPit = () => {
    const p = new Promise((resolve, reject) => {
      this.tubObj.pit.call((e, r) => {
        if (!e) {
          this.setState((prevState, props) => {
            const system = {...prevState.system};
            const pit = {...system.pit};
            pit.address = r;
            system.pit = pit;
            return { system };
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

  setUpToken = (token) => {
    this.tubObj[token.replace('dai', 'sai')].call((e, r) => {
      if (!e) {
        this.setState((prevState, props) => {
          const system = {...prevState.system};
          const tok = {...system[token]};
          tok.address = r;
          system[token] = tok;
          return { system };
        }, () => {
          window[`${token}Obj`] = this[`${token}Obj`] = this.loadObject(token === 'gem' ? dsethtoken.abi : dstoken.abi, r);
          this.getDataFromToken(token);
          this.setFilterToken(token);
        });
      }
    })
  }

  setFilterToken = (token) => {
    const filters = ['Transfer', 'Approval'];

    if (token === 'gem') {
      filters.push('Deposit');
      filters.push('Withdrawal');
    } else {
      filters.push('Mint');
      filters.push('Burn');
    }

    for (let i = 0; i < filters.length; i++) {
      const conditions = {};
      if (this[`${token}Obj`][filters[i]]) {
        this[`${token}Obj`][filters[i]](conditions, { fromBlock: 'latest' }, (e, r) => {
          if (!e) {
            this.logTransactionConfirmed(r.transactionHash);
            this.getDataFromToken(token);
          }
        });
      }
    }
  }

  getCups = (limit, skip = 0) => {
    // const conditions = this.getCupsListConditions();
    if (this.state.profile.activeProfile) {
      const conditions = {on: {lad: this.state.profile.activeProfile}, off: {}};
      const me = this;
      if (settings.chain[this.state.network.network].service) {
        Promise.resolve(this.getFromService('cups', Object.assign(conditions.on, conditions.off), { cupi: 'asc' })).then(response => {
          const promises = [];
          response.results.forEach(v => {
            promises.push(me.getCup(v.cupi));
          });
          me.getCupsFromChain(this.state.system.tub.cupsList, conditions.on, conditions.off, response.lastBlockNumber, limit, skip, promises);
        }).catch(error => {
          me.getCupsFromChain(this.state.system.tub.cupsList, conditions.on, conditions.off, settings.chain[this.state.network.network].fromBlock, limit, skip);
        });
      } else {
        this.getCupsFromChain(this.state.system.tub.cupsList, conditions.on, conditions.off, settings.chain[this.state.network.network].fromBlock, limit, skip);
      }
    }
  }

  getCupsFromChain = (cupsList, onConditions, offConditions, fromBlock, limit, skip, promises = []) => {
    const promisesLogs = [];
    promisesLogs.push(
      new Promise((resolve, reject) => {
        this.tubObj.LogNewCup(onConditions, { fromBlock }).get((e, r) => {
          if (!e) {
            for (let i = 0; i < r.length; i++) {
              promises.push(this.getCup(parseInt(r[i].args.cup, 16)));
            }
            resolve();
          } else {
            reject(e);
          }
        });
      })
    );
    if (typeof onConditions.lad !== 'undefined') {
      promisesLogs.push(
        new Promise((resolve, reject) => {
          // Get cups given to address (only if not seeing all cups).
          this.tubObj.LogNote({ sig: this.methodSig('give(bytes32,address)'), bar: toBytes32(onConditions.lad) }, { fromBlock }).get((e, r) => {
            if (!e) {
              for (let i = 0; i < r.length; i++) {
                promises.push(this.getCup(parseInt(r[i].args.foo, 16), Object.assign(onConditions, offConditions)));
              }
              resolve();
            } else {
              reject(e);
            }
          });
        })
      );
    }
    Promise.all(promisesLogs).then(r => {
      if (cupsList === this.state.system.tub.cupsList && this.state.system.tub.cupsLoading) {
        Promise.all(promises).then(cups => {
          const conditions = Object.assign(onConditions, offConditions);
          const cupsToShow = {};
          const cupsFiltered = {};
          let ownCup = this.state.system.tub.ownCup;
          for (let i = 0; i < cups.length; i++) {
            if ((typeof conditions.lad === 'undefined' || conditions.lad === cups[i].lad) &&
                (typeof conditions.closed === 'undefined' ||
                  (conditions.closed && cups[i].lad === '0x0000000000000000000000000000000000000000') ||
                  (!conditions.closed && cups[i].lad !== '0x0000000000000000000000000000000000000000' && cups[i].ink.gt(0))) &&
                (typeof conditions.safe === 'undefined' ||
                  (conditions.safe && cups[i].safe) ||
                  (!conditions.safe && !cups[i].safe))
                ) {
                cupsFiltered[cups[i].id] = cups[i];
            }
            ownCup = ownCup || cups[i].lad === this.state.profile.activeProfile;
          }
          const keys = Object.keys(cupsFiltered).sort((a, b) => a - b);
          for (let i = skip; i < Math.min(skip + limit, keys.length); i++) {
            cupsToShow[keys[i]] = cupsFiltered[keys[i]];
          }
          if (cupsList === this.state.system.tub.cupsList && this.state.system.tub.cupsLoading) {
            this.setState((prevState, props) => {
              const system = {...prevState.system};
              const tub = {...system.tub};
              tub.cupsLoading = false;
              tub.cupsCount = keys.length;
              tub.cups = cupsToShow;
              tub.ownCup = ownCup;
              system.tub = tub;
              return { system };
            }, () => {
              if (keys.length > 0 && settings.chain[this.state.network.network].service) {
                keys.forEach(key => {
                  Promise.resolve(this.getFromService('cupHistoryActions', { cupi: key }, { timestamp:'asc' })).then(response => {
                    this.setState((prevState, props) => {
                      const system = {...prevState.system};
                      const tub = {...system.tub};
                      const cups = {...tub.cups};
                      cups[key].history = response.results
                      tub.cups = cups;
                      system.tub = tub;
                      return { system };
                    }, () => {
                      this.calculateCupChart();
                    });
                  }).catch(error => {
                    // this.setState({});
                  });
                });
              }
            });
          }
        });
      }
    });
  }

  getCup = id => {
    return new Promise((resolve, reject) => {
      this.tubObj.cups.call(toBytes32(id), (e, cupData) => {
        if (!e) {
          let cupBaseData = {
            id: parseInt(id, 10),
            lad: cupData[0],
            ink: cupData[1],
            art: cupData[2],
            ire: cupData[3],
          };

          Promise.resolve(this.addExtraCupData(cupBaseData)).then(cup => {
            resolve(cup);
          }, e => {
            reject(e);
          });
        } else {
          reject(e);
        }
      });
    });
  }

  addExtraCupData = (cup) => {
    cup.pro = wmul(cup.ink, this.state.system.tub.tag).round(0);
    cup.ratio = cup.pro.div(wmul(this.tab(cup), this.state.system.vox.par));
    // This is to give a window margin to get the maximum value (as 'chi' is dynamic value per second)
    const marginTax = web3.fromWei(this.state.system.tub.tax).pow(120);
    cup.avail_dai = wdiv(cup.pro, wmul(this.state.system.tub.mat, this.state.system.vox.par)).minus(this.tab(cup)).round(0).minus(1); // "minus(1)" to avoid rounding issues when dividing by mat (in the contract uses it mulvoxlying on safe function)
    cup.avail_dai_with_margin = wdiv(cup.pro, wmul(this.state.system.tub.mat, this.state.system.vox.par)).minus(this.tab(cup).times(marginTax)).round(0).minus(1);
    cup.avail_dai_with_margin = cup.avail_dai_with_margin.lt(0) ? web3.toBigNumber(0) : cup.avail_dai_with_margin;
    cup.avail_skr = cup.ink.minus(wdiv(wmul(wmul(this.tab(cup), this.state.system.tub.mat), this.state.system.vox.par), this.state.system.tub.tag)).round(0);
    cup.avail_skr_with_margin = cup.ink.minus(wdiv(wmul(wmul(this.tab(cup).times(marginTax), this.state.system.tub.mat), this.state.system.vox.par), this.state.system.tub.tag)).round(0);
    cup.avail_skr_with_margin = cup.avail_skr_with_margin.lt(0) ? web3.toBigNumber(0) : cup.avail_skr_with_margin;
    cup.liq_price = cup.ink.gt(0) && cup.art.gt(0) ? wdiv(wdiv(wmul(this.tab(cup), this.state.system.tub.mat), this.state.system.tub.per), cup.ink) : web3.toBigNumber(0);

    return new Promise((resolve, reject) => {
      this.tubObj.safe['bytes32'].call(toBytes32(cup.id), (e, safe) => {
        if (!e) {
          cup.safe = safe;
          resolve(cup);
        } else {
          reject(e);
        }
      });
    });
  }

  reloadCupData = id => {
    Promise.resolve(this.getCup(id).then(cup => {
      this.setState((prevState, props) => {
        const system = {...prevState.system};
        const tub = {...system.tub};
        const cups = {...tub.cups};
        cups[id] = {...cup};
        tub.cups = cups;
        system.tub = tub;
        return { system };
      }, () => {
        if (settings.chain[this.state.network.network].service) {
          Promise.resolve(this.getFromService('cupHistoryActions', { cupi: id }, { timestamp:'asc' })).then(response => {
            this.setState((prevState, props) => {
              const system = {...prevState.system};
              const tub = {...system.tub};
              const cups = {...tub.cups};
              cups[id].history = response.results
              tub.cups = cups;
              system.tub = tub;
              return { system };
            });
          }).catch(error => {
            // this.setState({});
          });
        }
      });
    }));
  }

  getFromService = (service, conditions = {}, sort = {}, limit = null) => {
    const p = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let conditionsString = '';
      let sortString = '';
      Object.keys(conditions).map(key => {
        conditionsString += `${key}:${conditions[key]}`;
        conditionsString += Object.keys(conditions).pop() !== key ? '&' : '';
        return false;
      });
      conditionsString = conditionsString !== '' ? `/conditions=${conditionsString}` : '';
      Object.keys(sort).map(key => {
        sortString += `${key}:${sort[key]}`;
        sortString += Object.keys(sort).pop() !== key ? '&' : '';
        return false;
      });
      sortString = sortString !== '' ? `/sort=${sortString}` : '';
      const url = `${settings.chain[this.state.network.network].service}${settings.chain[this.state.network.network].service.slice(-1) !== '/' ? '/' : ''}${service}${conditionsString}${sortString}${limit ? `/limit=${limit}` : ''}`;
      xhr.open('GET', url, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
          reject(xhr.status);
        }
      }
      xhr.send();
    });
    return p;
  }

  getCupsListConditions = () => {
    const conditions = { on: {}, off: {} };
    switch (this.state.system.tub.cupsList) {
      case 'open':
        conditions.off.closed = false;
        conditions.off['ink.gt'] = 0;
        break;
      case 'unsafe':
        conditions.off.closed = false;
        conditions.off.safe = false;
        break;
      case 'closed':
        conditions.off.closed = true;
        break;
      case 'all':
        break;
      case 'mine':
      default:
        conditions.on.lad = this.state.profile.activeProfile;
        break;
    }
    return conditions;
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
    ].map(v => this.methodSig(v));

    this.tubObj.LogNote({}, { fromBlock: 'latest' }, (e, r) => {
      if (!e) {
        this.logTransactionConfirmed(r.transactionHash);
        if (cupSignatures.indexOf(r.args.sig) !== -1 && typeof this.state.system.tub.cups[r.args.foo] !== 'undefined') {
          this.reloadCupData(parseInt(r.args.foo, 16));
        } else if (r.args.sig === this.methodSig('mold(bytes32,uint256)')) {
          const ray = ['axe', 'mat', 'tax', 'fee'].indexOf(web3.toAscii(r.args.foo).substring(0,3)) !== -1;
          const callback = ['mat'].indexOf(web3.toAscii(r.args.foo).substring(0,3)) !== -1 ? this.calculateSafetyAndDeficit: () => {};
          this.getParameterFromTub(web3.toAscii(r.args.foo).substring(0,3), ray, callback);
        } else if (r.args.sig === this.methodSig('cage(uint256,uint256)')) {
          this.getParameterFromTub('off');
          this.getParameterFromTub('fit');
          this.getParameterFromTap('fix', true);
        } else if (r.args.sig === this.methodSig('flow()')) {
          this.getParameterFromTub('out');
        }
        if (r.args.sig === this.methodSig('drip()') ||
            r.args.sig === this.methodSig('chi()') ||
            r.args.sig === this.methodSig('rhi()') ||
            r.args.sig === this.methodSig('draw(bytes32,uint256)') ||
            r.args.sig === this.methodSig('wipe(bytes32,uint256)') ||
            r.args.sig === this.methodSig('shut(bytes32)') ||
            (r.args.sig === this.methodSig('mold(bytes32,uint256)') && web3.toAscii(r.args.foo).substring(0,3) === 'tax')) {
          this.getParameterFromTub('chi', true);
          this.getParameterFromTub('rhi', true);
          this.loadEraRho();
        }
      }
    });
  }

  setFiltersTap = () => {
    this.tapObj.LogNote({}, { fromBlock: 'latest' }, (e, r) => {
      if (!e) {
        this.logTransactionConfirmed(r.transactionHash);
        if (r.args.sig === this.methodSig('mold(bytes32,uint256)')) {
          this.getParameterFromTap('gap', false, this.getBoomBustValues());
        }
      }
    });
  }

  setFiltersVox = () => {
    this.voxObj.LogNote({}, { fromBlock: 'latest' }, (e, r) => {
      if (!e) {
        this.logTransactionConfirmed(r.transactionHash);
        if (r.args.sig === this.methodSig('mold(bytes32,uint256)')) {
          this.getParameterFromVox('way', true);
        }
      }
    });
  }

  setFilterFeedValue = obj => {
    this.tubObj[obj].call((e, r) => {
      if (!e) {
        this.setState((prevState, props) => {
          const system = {...prevState.system};
          const feed = {...system[obj]};
          feed.address = r;
          system[obj] = feed;
          return { system };
        }, () => {
          window[`${obj}Obj`] = this[`${obj}Obj`] = this.loadObject(dsvalue.abi, r);
          this.getValFromFeed(obj);

          this[`${obj}Obj`].LogNote({}, { fromBlock: 'latest' }, (e, r) => {
            if (!e) {
              if (
                r.args.sig === this.methodSig('poke(bytes32)') ||
                r.args.sig === this.methodSig('poke()')
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

  getDataFromToken = token => {
    this.getTotalSupply(token);

    if (token !== 'sin' && web3.isAddress(this.state.profile.activeProfile)) {
      this.getBalanceOf(token, this.state.profile.activeProfile, 'myBalance');
    }
    if (token === 'gem' || token === 'skr' || token === 'sin') {
      this.getBalanceOf(token, this.state.system.tub.address, 'tubBalance');
    }
    if (token === 'gem' || token === 'skr' || token === 'dai' || token === 'sin') {
      this.getBalanceOf(token, this.state.system.tap.address, 'tapBalance');
      this.getBoomBustValues();
    }
    if (token === 'gem' || token === 'skr') {
      this.getParameterFromTub('per', true);
    }
    if (token === 'gem' || token === 'skr' || token === 'dai' || token === 'gov') {
      this.getApproval(token, 'tub');
      if (token !== 'gov') {
        this.getApproval(token, 'tap');
      }
    }
    if (token === 'gov') {
      this.getBalanceOf(token, this.state.system.pit.address, 'pitBalance');
    }
  }

  getApproval = (token, dst) => {
    Promise.resolve(this.allowance(token, dst)).then(r => {
      this.setState((prevState, props) => {
        const system = {...prevState.system};
        const tok = {...system[token]};
        tok[`${dst}Approved`] = r.eq(web3.toBigNumber(2).pow(256).minus(1));
        system[token] = tok;
        return { system };
      });
    }, () => {});
  }

  getTotalSupply = name => {
    this[`${name}Obj`].totalSupply.call((e, r) => {
      if (!e) {
        this.setState((prevState, props) => {
          const system = {...prevState.system};
          const tok = {...system[name]};
          tok.totalSupply = r;
          system[name] = tok;
          return { system };
        }, () => {
          if (name === 'sin') {
            this.calculateSafetyAndDeficit();
          }
        });
      }
    })
  }

  getBalanceOf = (name, address, field) => {
    this[`${name}Obj`].balanceOf.call(address, (e, r) => {
      if (!e) {
        this.setState((prevState, props) => {
          const system = {...prevState.system};
          const tok = {...system[name]};
          tok[field] = r;
          system[name] = tok;
          return { system };
        }, () => {
          if ((name === 'skr' || name === 'dai') && field === 'tubBalance') {
            this.calculateSafetyAndDeficit();
          }
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
        this.getPricesFromService();
      }
      this.getStats();
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
        return { system };
      });
    }
  }

  getParameterFromTub = (field, ray = false, callback = false) => {
    const p = new Promise((resolve, reject) => {
      this.tubObj[field].call((e, value) => {
        if (!e) {
          this.setState((prevState, props) => {
            const system = {...prevState.system};
            const tub = {...system.tub};
            tub[field] = ray ? fromRaytoWad(value) : value;
            system.tub = tub;
            return { system };
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
                  return { system };
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
      this.tapObj[field].call((e, value) => {
        if (!e) {
          this.setState((prevState, props) => {
            const system = {...prevState.system};
            const tap = {...system.tap};
            tap[field] = ray ? fromRaytoWad(value) : value;
            system.tap = tap;
            return { system };
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
      this.voxObj[field].call((e, value) => {
        if (!e) {
          this.setState((prevState, props) => {
            const system = {...prevState.system};
            const vox = {...system.vox};
            vox[field] = ray ? fromRaytoWad(value) : value;
            system.vox = vox;
            return { system };
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
      this[`${obj}Obj`].peek.call((e, r) => {
        if (!e) {
          this.setState((prevState, props) => {
            const system = {...prevState.system};
            const feed = {...system[obj]};
            feed.val = web3.toBigNumber(r[1] ? parseInt(r[0], 16) : -2);
            system[obj] = feed;
            return { system };
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
        tub.avail_boom_dai = tub.avail_boom_skr = web3.toBigNumber(0);
        tub.avail_bust_dai = tub.avail_bust_skr = web3.toBigNumber(0);

        // if higher or equal, it means vox.par is static or increases over the time
        // if lower, it means it decreases over the time, so we calculate a future par (in 10 minutes) to reduce risk of tx failures
        const futurePar = system.vox.way.gte(WAD) ? system.vox.par : system.vox.par.times(web3.fromWei(system.vox.way).pow(10*60));

        if (dif.gt(0)) {
          // We can boom
          tub.avail_boom_dai = dif;
          tub.avail_boom_skr = wdiv(wdiv(wmul(tub.avail_boom_dai, futurePar), system.tub.tag), WAD.times(2).minus(system.tap.gap));
        }

        if (system.skr.tapBalance.gt(0) || dif.lt(0)) {
          // We can bust

          // This is a margin we need to take into account as bust quantity goes down per second
          // const futureFee = system.sin.tubBalance.times(web3.fromWei(tub.tax).pow(120)).minus(system.sin.tubBalance).round(0); No Drip anymore!!!
          // const daiNeeded = dif.abs().minus(futureFee);
          const daiNeeded = dif.gte(0) ? web3.toBigNumber(0) : dif.abs();
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
        return { system };
      });
    }
  }

  calculateCupChart = () => {
    const cupId = this.state.system.tub.cupId ? this.state.system.tub.cupId : Object.keys(this.state.system.tub.cups)[0];
    if (this.state.system.tub.cups[cupId].history.length > 0 && typeof this.state.system.chartData.prices !== 'undefined') {
      let prices = Object.keys(this.state.system.chartData.prices).map(key => this.state.system.chartData.prices[key]);

      this.state.system.tub.cups[cupId].history.forEach(registry => {
        if (['lock', 'free', 'draw', 'wipe', 'shut'].indexOf(registry.action) !== -1) {
          prices.push({timestamp: registry.timestamp, type: registry.action, value: registry.param})
        }
      });
      prices = prices.sort((a, b) => a.timestamp - b.timestamp);

      let lastETHUSD = web3.toBigNumber(0);
      let lastDAIUSD = web3.toBigNumber(1);
      let lastSKRETH = web3.toBigNumber(1);
      const cupPrices = [];
      let lastCollateral = web3.toBigNumber(0);
      let lastDebt = web3.toBigNumber(0);
      let highestValue = 0;
      prices.forEach(price => {
        switch (price.type) {
          case 'ethusd':
            lastETHUSD = web3.toBigNumber(price.value / 10**18);
            break;
          case 'daiusd':
            lastDAIUSD = web3.toBigNumber(price.value / 10**18);
            break;
          case 'skreth':
            lastSKRETH = web3.toBigNumber(price.value / 10**18);
            break;
          case 'lock':
            lastCollateral = lastCollateral.add(price.value);
            break;
          case 'free':
            lastCollateral = lastCollateral.minus(price.value);
            break;
          case 'draw':
            lastDebt = lastDebt.add(price.value);
            break;
          case 'wipe':
            lastDebt = lastDebt.minus(price.value);
            break;
          case 'shut':
            lastCollateral = web3.toBigNumber(0);
            lastDebt = web3.toBigNumber(0);
            break;
          default:
            break;
        }
        if (price.timestamp >= this.state.system.chartData.timeLimit) {
          cupPrices.push({
            date: new Date(price.timestamp * 1000),
            ethusd: lastETHUSD.toNumber(),
            skreth: lastSKRETH.toNumber(),
            daiusd: lastDAIUSD.toNumber(),
            collateral: web3.fromWei(lastCollateral.times(lastSKRETH).times(lastETHUSD)).toNumber(),
            debt: web3.fromWei(lastDebt.times(lastDAIUSD)).toNumber(),
            risk: web3.fromWei(lastDebt.times(lastDAIUSD).times(1.5)).toNumber()
          });
          highestValue = cupPrices[cupPrices.length - 1].collateral > highestValue ? cupPrices[cupPrices.length - 1].collateral : highestValue;
          highestValue = cupPrices[cupPrices.length - 1].risk > highestValue ? cupPrices[cupPrices.length - 1].risk : highestValue;
        }
      });
      this.setState((prevState, props) => {
        const system = {...prevState.system};
        const chartData = {...system.chartData};
        chartData.cupPrices = cupPrices;
        chartData.highestValue = highestValue;
        system.chartData = chartData;
        return { system };
      });
    }
  }

  getPricesFromService = () => {
    const timeLimit = parseInt(((new Date()).setHours(0,0,0) - 10*24*60*60*1000) / 1000, 10);
    const promises = [];
    // ETH/USD
    promises.push(this.getFromService('pips', {'timestamp.lt': timeLimit}, { 'timestamp': 'asc' }, 1));
    promises.push(this.getFromService('pips', {'timestamp.gte': timeLimit}, { 'timestamp': 'asc' }));
    // DAI/USD
    promises.push(this.getFromService('ways', {'timestamp.lt': timeLimit}, { 'timestamp': 'asc' }, 1));
    promises.push(this.getFromService('ways', {'timestamp.gte': timeLimit}, { 'timestamp': 'asc' }));
    // PETH/ETH
    promises.push(this.getFromService('pers', {'timestamp.lt': timeLimit}, { 'timestamp': 'asc' }, 1));
    promises.push(this.getFromService('pers', {'timestamp.gte': timeLimit}, { 'timestamp': 'asc' }));

    Promise.all(promises).then(r => {
      if (r[0] && r[1] && r[2] && r[3] && r[4] && r[5]) {
        const prices = r[0].results.map(val => { val.type = "ethusd"; return val; })
                       .concat(r[1].results.map(val => { val.type = "ethusd"; return val; }))
                       .concat(r[2].results.map(val => { val.type = "daiusd"; return val; }))
                       .concat(r[3].results.map(val => { val.type = "daiusd"; return val; }))
                       .concat(r[4].results.map(val => { val.type = "skreth"; return val; }))
                       .concat(r[5].results.map(val => { val.type = "skreth"; return val; }))
                       .sort((a, b) => a.timestamp - b.timestamp);
        this.setState((prevState, props) => {
          const system = {...prevState.system};
          const chartData = {...system.chartData};
          chartData.prices = prices;
          chartData.timeLimit = timeLimit;
          system.chartData = chartData;
          return { system };
        }, () => {
          this.calculateCupChart();
        });
      }
    }).catch(error => {
    });
  }

  getStats = () => {
    Promise.resolve(this.getFromService('cupStats')).then(response => {
      this.setState((prevState, props) => {
        const system = {...prevState.system};
        system.stats = { error: false, results: response.results };
        return { system };
      });
    }).catch(error => {
      this.setState((prevState, props) => {
        const system = {...prevState.system};
        system.stats = { error: true };
        return { system };
      });
    });
  }

  tab = cup => {
    return wmul(cup.art, this.state.system.tub.chi).round(0);
  }

  rap = cup => {
    return wmul(cup.ire, this.state.system.tub.rhi).minus(this.tab(cup)).round(0);
  }

  methodSig = method => {
    return web3.sha3(method).substring(0, 10)
  }

  // Modals
  handleOpenDialog = e => {
    e.preventDefault();
    const method = e.target.getAttribute('data-method');
    const cup = e.target.getAttribute('data-cup') ? e.target.getAttribute('data-cup') : false;
    this.setState({ dialog: { show: true, method, cup } });
  }

  handleCloseDialog = e => {
    e.preventDefault();
    this.setState({ dialog: { show: false } });
  }

  handleOpenVideoModal = e => {
    e.preventDefault();
    this.setState({ videoModal: { show: true } });
  }

  handleOpenTermsModal = e => {
    e.preventDefault();
    const termsModal = {...this.state.termsModal};
    termsModal[e.target.getAttribute('data-modal')] = true;
    this.setState({ termsModal: termsModal });
  }

  handleCloseVideoModal = e => {
    e.preventDefault();
    this.markAsAccepted('video');
    this.setState({ videoModal: { show: false } });
  }

  handleOpenTerminologyModal = e => {
    e.preventDefault();
    this.setState({ terminologyModal: { show: true } });
  }

  handleCloseTerminologyModal = e => {
    e.preventDefault();
    this.setState({ terminologyModal: { show: false } });
  }

  markAsAccepted = type => {
    const termsModal = { ...this.state.termsModal };
    termsModal[type] = false;
    this.setState({ termsModal }, () => {
      localStorage.setItem('termsModal', JSON.stringify(termsModal));
    });
  }
  //

  // Transactions
  checkPendingTransactions = () => {
    const transactions = { ...this.state.transactions };
    Object.keys(transactions).map(tx => {
      if (transactions[tx].pending) {
        web3.eth.getTransactionReceipt(tx, (e, r) => {
          if (!e && r !== null) {
            if (r.logs.length === 0) {
              this.logTransactionFailed(tx);
            } else if (r.blockNumber)  {
              this.logTransactionConfirmed(tx);
            }
          }
        });
      }
      return false;
    });
  }

  logRequestTransaction = (id, title) => {
    const msgTemp = 'Waiting for transaction signature...';
    this.refs.notificator.info(id, title, msgTemp, false);
  }

  logPendingTransaction = (id, tx, title, callbacks = []) => {
    const msgTemp = 'Transaction TX was created. Waiting for confirmation...';
    const transactions = { ...this.state.transactions };
    transactions[tx] = { pending: true, title, callbacks }
    this.setState({ transactions });
    console.log(msgTemp.replace('TX', tx));
    this.refs.notificator.hideNotification(id);
    this.refs.notificator.info(tx, title, etherscanTx(this.state.network.network, msgTemp.replace('TX', `${tx.substring(0,10)}...`), tx), false);
  }

  logTransactionConfirmed = tx => {
    const msgTemp = 'Transaction TX was confirmed.';
    const transactions = { ...this.state.transactions };
    if (transactions[tx] && transactions[tx].pending) {
      transactions[tx].pending = false;
      this.setState({ transactions }, () => {
        console.log(msgTemp.replace('TX', tx));
        this.refs.notificator.hideNotification(tx);
        this.refs.notificator.success(tx, transactions[tx].title, etherscanTx(this.state.network.network, msgTemp.replace('TX', `${tx.substring(0,10)}...`), tx), 4000);
        if (typeof transactions[tx].callbacks !== 'undefined' && transactions[tx].callbacks.length > 0) {
          transactions[tx].callbacks.forEach(callback => this.executeCallback(callback));
        }
      });
    }
  }

  logTransactionFailed = tx => {
    const msgTemp = 'Transaction TX failed.';
    const transactions = { ...this.state.transactions };
    if (transactions[tx]) {
      transactions[tx].pending = false;
      this.setState({ transactions });
      this.refs.notificator.error(tx, transactions[tx].title, msgTemp.replace('TX', `${tx.substring(0,10)}...`), 4000);
    }
  }

  logTransactionRejected = (tx, title) => {
    const msgTemp = 'User denied transaction signature.';
    this.refs.notificator.error(tx, title, msgTemp, 4000);
  }
  //

  // Actions
  executeMethod = (object, method, callbacks = []) => {
    const id = Math.random();
    const title = `${object.toUpperCase()}: ${method}`;
    this.logRequestTransaction(id, title);
    const log = (e, tx) => {
      if (!e) {
        this.logPendingTransaction(id, tx, title, callbacks);
      } else {
        console.log(e);
        this.logTransactionRejected(id, title);
      }
    }
    if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
      this.proxyObj.execute['address,bytes'](settings.chain[this.state.network.network].proxyContracts.basicActions,
                            `${this.methodSig(`${method}(address)`)}${addressToBytes32(this.state.system[object].address, false)}`,
                            log);
    } else {
      this[`${object}Obj`][method]({}, log);
    }
  }

  executeMethodCup = (method, cup, callbacks = []) => {
    const id = Math.random();
    const title = `TUB: ${method} ${cup}`;
    this.logRequestTransaction(id, title);
    const log = (e, tx) => {
      if (!e) {
        callbacks.push(['reloadCupData', cup]);
        this.logPendingTransaction(id, tx, title, callbacks);
      } else {
        console.log(e);
        this.logTransactionRejected(id, title);
      }
    }
    if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
      this.proxyObj.execute['address,bytes'](settings.chain[this.state.network.network].proxyContracts.basicActions,
                            `${this.methodSig(`${method}(address,bytes32)`)}${addressToBytes32(this.tubObj.address, false)}${toBytes32(cup, false)}`,
                            log);
    } else {
      this.tubObj[method](toBytes32(cup), {}, log);
    }
  }

  executeMethodValue = (object, method, value, callbacks = []) => {
    const id = Math.random();
    const title = `${object.toUpperCase()}: ${method} ${value}`;
    this.logRequestTransaction(id, title);
    const log = (e, tx) => {
      if (!e) {
        this.logPendingTransaction(id, tx, title, callbacks);
      } else {
        console.log(e);
        this.logTransactionRejected(id, title);
      }
    }
    if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
      this.proxyObj.execute['address,bytes'](settings.chain[this.state.network.network].proxyContracts.basicActions,
                            `${this.methodSig(`${method}(address,uint256)`)}${addressToBytes32(this.state.system[object].address, false)}${toBytes32(web3.toWei(value), false)}`,
                            log);
    } else {
      this[`${object}Obj`][method](web3.toWei(value), {}, log);
    }
  }

  executeMethodCupValue = (method, cup, value, toWei = true, callbacks = []) => {
    const id = Math.random();
    const title = `TUB: ${method} ${cup} ${value}`;
    this.logRequestTransaction(id, title);
    const log = (e, tx) => {
      if (!e) {
        callbacks.push(['reloadCupData', cup]);
        this.logPendingTransaction(id, tx, title, callbacks);
      } else {
        console.log(e);
        this.logTransactionRejected(id, title);
      }
    }
    if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
      this.proxyObj.execute['address,bytes'](settings.chain[this.state.network.network].proxyContracts.basicActions,
                            `${this.methodSig(`${method}(address,bytes32,uint256)`)}${addressToBytes32(this.tubObj.address, false)}${toBytes32(cup, false)}${toBytes32(toWei ? web3.toWei(value) : value, false)}`,
                            log);
    } else {
      this.tubObj[method](toBytes32(cup), toWei ? web3.toWei(value) : value, {}, log);
    }
  }

  allowance = (token, dst) => {
    return new Promise((resolve, reject) => {
      if (this.state.profile.activeProfile) {
        this[`${token}Obj`].allowance.call(this.state.profile.activeProfile, this[`${dst}Obj`].address, (e, r) => {
          if (!e) {
            resolve(r);
          } else {
            reject(e);
          }
        });
      } else {
        reject(true);
      }
    });
  }

  executeCallback = args => {
    const method = args.shift();
    // If the callback is to execute a getter function is better to wait as sometimes the new value is not uopdated instantly when the tx is confirmed
    const timeout = ['executeMethod', 'executeMethodValue', 'executeMethodCup', 'executeMethodCupValue', 'checkAllowance'].indexOf(method) !== -1 ? 0 : 3000;
    // console.log(method, args, timeout);
    setTimeout(() => {
      this[method](...args);
    }, timeout);
  }

  checkAllowance = (token, dst, callbacks) => {
    let promise;
    let valueObj;
    valueObj = web3.toBigNumber(2).pow(256).minus(1); // uint(-1)

    promise = this.allowance(token, dst);

    Promise.resolve(promise).then(r => {
      if (r.gte(valueObj)) {
        callbacks.forEach(callback => this.executeCallback(callback));
      } else {
        const tokenName = token.replace('gem', 'weth').replace('gov', 'mkr').replace('skr', 'peth').toUpperCase();
        const action = {
          gem: {
            tub: 'Join',
            tap: 'Mock'
          },
          skr: {
            tub: 'Exit/Lock',
            tap: 'Boom'
          },
          dai: {
            tub: 'Wipe/Shut',
            tap: 'Bust/Cash'
          },
          gov: {
            tub: 'Wipe/Shut'
          }
        }
        const id = Math.random();
        const title = `${tokenName}: approve ${action[token][dst]}`;
        this.logRequestTransaction(id, title);
        const log = (e, tx) => {
          if (!e) {
            this.logPendingTransaction(id, tx, title, callbacks);
          } else {
            console.log(e);
            this.logTransactionRejected(id, title);
          }
        }
        this[`${token}Obj`].approve(this.state.system[dst].address, -1, {}, log);
      }
    }, () => {});
  }

  updateValue = (value, token) => {
    const method = this.state.dialog.method;
    const cup = this.state.dialog.cup;
    let error = false;
    switch(method) {
      case 'proxy':
        const id = Math.random();
        const title = 'PROXY: create new profile';
        this.logRequestTransaction(id, title);
        this.proxyFactoryObj.build((e, tx) => {
          if (!e) {
            this.logPendingTransaction(id, tx, title);
            this.proxyFactoryObj.Created({ sender: this.state.network.defaultAccount }, { fromBlock: 'latest' }, (e, r) => {
              if (!e) {
                const profile = { ...this.state.profile }
                profile.proxy = r.args.proxy;
                this.setState({ profile }, () => {
                  this.changeMode();
                });
              } else {
                console.log(e);
              }
            });
          } else {
            console.log(e);
            this.logTransactionRejected(id, title);
          }
        });
      break;
      case 'open':
        this.executeMethod('tub', method, [['showNewCup']]);
        break;
      case 'drip':
        this.executeMethod('tub', method);
        break;
      case 'shut':
        // We calculate debt with some margin before shutting cup (to avoid failures)
        const debt = this.tab(this.state.system.tub.cups[cup]).times(web3.fromWei(this.state.system.tub.tax).pow(120));
        if (this.state.system.dai.myBalance.lt(debt)) {
          error = `Not enough balance of DAI to shut CDP ${cup}.`;
        } else {
          const futureGovFee = web3.fromWei(wdiv(this.state.system.tub.fee, this.state.system.tub.tax)).pow(180).round(0); // 3 minutes of future fee
          const govDebt = wmul(wdiv(this.rap(this.state.system.tub.cups[cup]), this.state.system.pep.val), futureGovFee);
          if (govDebt.gt(this.state.system.gov.myBalance)) {
            error = `Not enough balance of MKR to shut CDP ${cup}.`;
          } else {
            if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
              this.executeMethodCup(method, cup, [
                                                   ['setUpToken', 'sai'],
                                                   ['setUpToken', 'sin'],
                                                   ['setUpToken', 'gov'],
                                                   ['setUpToken', 'skr']
                                                 ]);
            } else {
              this.checkAllowance('dai', 'tub', [
                                                  ['getApproval', 'dai', 'tub'],
                                                  ['checkAllowance', 'gov', 'tub',
                                                    [
                                                      ['getApproval', 'gov', 'tub'],
                                                      ['executeMethodCup', method, cup,
                                                        [
                                                          ['setUpToken', 'sai'],
                                                          ['setUpToken', 'sin'],
                                                          ['setUpToken', 'gov'],
                                                          ['setUpToken', 'skr']
                                                        ]
                                                      ]
                                                    ]
                                                  ]
                                                ]);
            }
          }
        }
        break;
      case 'bite':
        this.executeMethodCup(method, cup);
        break;
      case 'join':
        if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
          this.executeMethodValue('tub', method, value, [
                                                          ['setUpToken', 'gem'],
                                                          ['setUpToken', 'skr']
                                                        ]);
        } else {
          // const valAllowanceJoin = web3.fromWei(web3.toBigNumber(value).times(this.state.system.tub.per).round().add(1).valueOf());
          this.checkAllowance('gem', 'tub', [
                                              ['getApproval', 'gem', 'tub'],
                                              ['executeMethodValue', 'tub', method, value,
                                                [
                                                  ['setUpToken', 'gem'],
                                                  ['setUpToken', 'skr']
                                                ]
                                              ]
                                            ]);
        }
        break;
      case 'exit':
        value = this.state.system.tub.off === true ? web3.fromWei(this.state.system.skr.myBalance) : value;
        if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
          this.executeMethodValue('tub', method, value, [
                                                          ['setUpToken', 'gem'],
                                                          ['setUpToken', 'skr']
                                                        ]);
        } else {
          this.checkAllowance('skr', 'tub', [
                                              ['getApproval', 'skr', 'tub'],
                                              ['executeMethodValue', 'tub', method, value,
                                                [
                                                  ['setUpToken', 'gem'],
                                                  ['setUpToken', 'skr']
                                                ]
                                              ]
                                            ]);
        }
        break;
      case 'boom':
        if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
          this.executeMethodValue('tap', method, value, [
                                                          ['setUpToken', 'skr'],
                                                          ['setUpToken', 'sai'],
                                                          ['setUpToken', 'sin']
                                                        ]);
        } else {
          this.checkAllowance('skr', 'tap', [
                                              ['getApproval', 'skr', 'tap'],
                                              ['executeMethodValue', 'tap', method, value,
                                                [
                                                  ['setUpToken', 'skr'],
                                                  ['setUpToken', 'sai'],
                                                  ['setUpToken', 'sin']
                                                ]
                                              ]
                                            ]);
        }
        break;
      case 'bust':
        if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
          this.executeMethodValue('tap', method, value, [
                                                          ['setUpToken', 'skr'],
                                                          ['setUpToken', 'sai'],
                                                          ['setUpToken', 'sin']
                                                        ]);
        } else {
          // const valueDAI = wmul(web3.toBigNumber(value), this.state.system.tub.avail_bust_ratio).ceil();
          this.checkAllowance('dai', 'tap', [
                                              ['getApproval', 'dai', 'tap'],
                                              ['executeMethodValue', 'tap', method, value,
                                                [
                                                  ['setUpToken', 'skr'],
                                                  ['setUpToken', 'sai'],
                                                  ['setUpToken', 'sin']
                                                ]
                                              ]
                                            ]);
        }
        break;
      case 'lock':
        if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
          this.executeMethodCupValue(method, cup, value, true, [
                                                                 ['setUpToken', 'skr']
                                                               ]);
        } else {
          this.checkAllowance('skr', 'tub', [
                                              ['getApproval', 'skr', 'tub'],
                                              ['executeMethodCupValue', method, cup, value, true,
                                                [
                                                  ['setUpToken', 'skr']
                                                ]
                                              ]
                                            ]);
        }
        break;
      case 'free':
        if (this.state.system.tub.off) {
          this.executeMethodCupValue(method, cup, web3.fromWei(this.state.system.tub.cups[cup].avail_skr), true, [
                                                                                                                   ['setUpToken', 'skr']
                                                                                                                 ]);
        } else {
          this.executeMethodCupValue(method, cup, value, true, [
                                                                 ['setUpToken', 'skr']
                                                               ]);
        }
        break;
      case 'draw':
        this.executeMethodCupValue(method, cup, value, true, [
                                                               ['setUpToken', 'sai'],
                                                               ['setUpToken', 'sin']
                                                             ]);
        break;
      case 'wipe':
        if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
          this.executeMethodCupValue(method, cup, value, true, [
                                                                 ['setUpToken', 'sai'],
                                                                 ['setUpToken', 'sin'],
                                                                 ['setUpToken', 'gov']
                                                               ]);
        } else {
          this.checkAllowance('dai', 'tub', [
                                              ['getApproval', 'dai', 'tub'],
                                              ['checkAllowance', 'gov', 'tub',
                                                [
                                                  ['getApproval', 'gov', 'tub'],
                                                  ['executeMethodCupValue', method, cup, value, true,
                                                    [
                                                      ['setUpToken', 'sai'],
                                                      ['setUpToken', 'sin'],
                                                      ['setUpToken', 'gov']
                                                    ]
                                                  ]
                                                ]
                                              ]
                                            ]);
        }
        break;
      case 'give':
        this.executeMethodCupValue(method, cup, value, false);
        break;
      case 'cash':
        if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
          this.executeMethodValue('tap', method, value, [
                                                          ['setUpToken', 'sai'],
                                                          ['setUpToken', 'gem']
                                                        ]);
        } else {
          this.checkAllowance('dai', 'tap', [
                                              ['getApproval', 'dai', 'tap'],
                                              ['executeMethodValue', 'tap', method, value,
                                                [
                                                  ['setUpToken', 'sai'],
                                                  ['setUpToken', 'gem']
                                                ]
                                              ]
                                            ]);
        }
        break;
      case 'mock':
        if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
          this.executeMethodValue('tap', method, value, [
                                                          ['setUpToken', 'sai'],
                                                          ['setUpToken', 'gem']
                                                        ]);
        } else {
          this.checkAllowance('gem', 'tap', [
                                              ['getApproval', 'gem', 'tap'],
                                              ['executeMethodValue', 'tap', method, value,
                                                [
                                                  ['setUpToken', 'sai'],
                                                  ['setUpToken', 'gem']
                                                ]
                                              ]
                                            ]);
        }
        break;
      case 'vent':
      case 'heal':
        this.executeMethod('tap', method);
        break;
      default:
        break;
    }

    if (error) {
      const dialog = { ...this.state.dialog }
      dialog.error = error;
      this.setState({ dialog });
    } else {
      this.setState({ dialog: { show: false } });
    }
  }

  transferToken = (token, to, amount) => {
    const tokenName = token.replace('gem', 'weth').replace('gov', 'mkr').replace('skr', 'peth').toUpperCase();
    const id = Math.random();
    const title = `${tokenName}: transfer ${to} ${amount}`;
    this.logRequestTransaction(id, title);
    const log = (e, tx) => {
      if (!e) {
        this.logPendingTransaction(id, tx, title, [['setUpToken', token]]);
      } else {
        console.log(e);
        this.logTransactionRejected(id, title);
      }
    }
    if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
      this.proxyObj.execute['address,bytes'](settings.chain[this.state.network.network].proxyContracts.tokenActions,
                            `${this.methodSig(`transfer(address,address,uint256)`)}${addressToBytes32(this[`${token}Obj`].address, false)}${addressToBytes32(to, false)}${toBytes32(web3.toWei(amount), false)}`,
                            log);
    } else {
      this[`${token}Obj`].transfer(to, web3.toWei(amount), {}, log);
    }
  }

  wrapUnwrap = (operation, amount) => {
    const id = Math.random();
    const title = `WETH: ${operation} ${amount}`;
    this.logRequestTransaction(id, title);
    const log = (e, tx) => {
      if (!e) {
        this.logPendingTransaction(id, tx, title, [['setUpToken', 'gem'], ['getAccountBalance']]);
      } else {
        console.log(e);
        this.logTransactionRejected(id, title);
      }
    }
    if (operation === 'wrap') {
      if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
        this.proxyObj.execute['address,bytes'](settings.chain[this.state.network.network].proxyContracts.tokenActions,
          `${this.methodSig(`deposit(address,uint256)`)}${addressToBytes32(this.gemObj.address, false)}${toBytes32(web3.toWei(amount), false)}`,
          log);
      } else {
        this.gemObj.deposit({ value: web3.toWei(amount) }, log);
      }
    } else if (operation === 'unwrap') {
      if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
        this.proxyObj.execute['address,bytes'](settings.chain[this.state.network.network].proxyContracts.tokenActions,
          `${this.methodSig(`withdraw(address,uint256)`)}${addressToBytes32(this.gemObj.address, false)}${toBytes32(web3.toWei(amount), false)}`,
          log);
      } else {
        this.gemObj.withdraw(web3.toWei(amount), {}, log);
      }
    }
  }

  approve = (token, dst, val) => {
    const tokenName = token.replace('gem', 'weth').replace('gov', 'mkr').replace('skr', 'peth').toUpperCase();
    const action = {
      gem: {
        tub: 'Join',
        tap: 'Mock'
      },
      skr: {
        tub: 'Exit/Lock',
        tap: 'Boom'
      },
      dai: {
        tub: 'Wipe/Shut',
        tap: 'Bust/Cash'
      },
      gov: {
        tub: 'Wipe/Shut'
      }
    }
    const id = Math.random();
    const title = `${tokenName}: ${val ? 'approve': 'deny'} ${action[token][dst]}`;
    this.logRequestTransaction(id, title);
    const log = (e, tx) => {
      if (!e) {
        this.logPendingTransaction(id, tx, title, [['getApproval', token, dst]]);
      } else {
        console.log(e);
        this.logTransactionRejected(id, title);
      }
    }
    if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
      this.proxyObj.execute['address,bytes'](settings.chain[this.state.network.network].proxyContracts.tokenActions,
        `${this.methodSig('approve(address,address,bool)')}${addressToBytes32(this[`${token}Obj`].address, false)}${addressToBytes32(this[`${dst}Obj`].address, false)}${toBytes32(val ? web3.toBigNumber(2).pow(256).minus(1).valueOf() : 0, false)}`,
        log);
    } else {
      this[`${token}Obj`].approve(this[`${dst}Obj`].address, val ? -1 : 0, (e, tx) => log(e, tx));
    }
  }

  approveAll = val => {
    const id = Math.random();
    const title = `WETH/MKR/PETH/DAI: ${val ? 'approve': 'deny'} all`;
    this.logRequestTransaction(id, title);
    const log = (e, tx) => {
      if (!e) {
        this.logPendingTransaction(id, tx, title);
      } else {
        console.log(e);
        this.logTransactionRejected(id, title);
      }
    }
    if (this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy)) {
      this.proxyObj.execute['address,bytes'](settings.chain[this.state.network.network].proxyContracts.customActions,
                            `${this.methodSig('approveAll(address,address,bool)')}${addressToBytes32(this.tubObj.address, false)}${addressToBytes32(this.tapObj.address, false)}${toBytes32(val, false)}`,
                            log);
    }
  }
  //

  changeMode = () => {
    const profile = { ...this.state.profile };
    profile.mode = profile.mode !== 'proxy' ? 'proxy' : 'account';
    profile.activeProfile = profile.mode === 'proxy' ? profile.proxy : this.state.network.defaultAccount;
    profile.accountBalance = web3.toBigNumber(-1);
    if (profile.mode === 'proxy' && !web3.isAddress(profile.proxy)) {
      this.setState({ dialog: { show: true, method: 'proxy' } });
    } else {
      this.setState({ profile }, () => {
        localStorage.setItem('mode', profile.mode);
        this.initContracts(this.state.system.top.address);
      });
    }
  }

  setNewCupsTab = (cupsList) => {
    this.setState((prevState, props) => {
      const system = {...prevState.system};
      const tub = {...system.tub};
      tub.cups = {};
      tub.cupsLoading = true;
      tub.cupsPage = 1;
      tub.cupsList = cupsList;
      system.tub = tub;
      return { system };
    }, () => {
      localStorage.setItem('cupsList', cupsList);
      this.getCups(settings['CDPsPerPage']);
    });
  }

  showNewCup = () => {
    this.setNewCupsTab('mine');
  }

  listCups = e => {
    e.preventDefault();
    const cupsList = e.target.getAttribute('data-value');
    this.setNewCupsTab(cupsList);
  }

  moveCupsPage = e => {
    e.preventDefault();
    const page = parseInt(e.target.getAttribute('data-page'), 10);

    this.setState((prevState, props) => {
      const system = {...prevState.system};
      const tub = {...system.tub};
      tub.cups = {};
      tub.cupsLoading = true;
      tub.cupsPage = page;
      system.tub = tub;
      return { system };
    }, () => {
      this.getCups(settings['CDPsPerPage'], settings['CDPsPerPage'] * (page - 1));
    });
  }

  changeCup = e => {
    e.preventDefault();
    let cupId = e.target.getAttribute('data-cupId');
    this.setState((prevState, props) => {
      const system = {...prevState.system};
      const tub = {...system.tub};
      const chartData = {...system.chartData};
      tub.cupId = cupId;
      chartData.cupPrices = [];
      system.tub = tub;
      system.chartData = chartData;
      return { system };
    }, () => {
      this.calculateCupChart();
    });
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

  renderMain() {
    const openAction = {
      display: 'Open Your CDP',
      active: this.state.network.defaultAccount && this.state.system.tub.off === false && !this.state.system.tub.ownCup && !this.state.system.tub.cupsLoading,
      helper: 'Open a new CDP'
    }

    // const bustBoomActions = {
    //   bust: {
    //     display: 'Buy PETH with DAI',
    //     active: this.state.network.defaultAccount && this.state.system.tub.off === false && this.state.system.tub.avail_bust_dai && this.state.system.tub.avail_bust_dai.gt(0),
    //   },
    //   boom: {
    //     display: 'Buy Dai with PETH',
    //     active: this.state.network.defaultAccount && this.state.system.tub.off === false && this.state.system.tub.avail_boom_dai && this.state.system.tub.avail_boom_dai.gt(0),
    //   },
    // }

    const skrActions = {
      join: {
        display: 'Convert WETH to PETH',
        active: this.state.network.defaultAccount && this.state.system.tub.off === false && this.state.system.gem.myBalance.gt(0),
      },
      exit: {
        display: 'Convert PETH to WETH',
        active: this.state.network.defaultAccount && this.state.system.skr.myBalance.gt(0)
                    && (this.state.system.tub.off === false ||
                       (this.state.system.tub.off === true && this.state.system.tub.out === true && this.state.system.sin.tubBalance.eq(0) && this.state.system.skr.tapBalance.eq(0))),
      },
    };

    // const daiActions = {
    //   cash: {
    //     display: 'Convert DAI to WETH',
    //     active: this.state.system.tub.off === true && this.state.system.dai.myBalance.gt(0),
    //     helper: 'Exchange your DAI for ETH at the cage price (enabled upon cage)'
    //   },
    //   mock: {
    //     display: 'Convert WETH to DAI',
    //     active: this.state.system.tub.off === true && this.state.system.gem.myBalance.gt(0),
    //     helper: 'Exchange your ETH for DAI at the cage price (enabled upon cage)'
    //  }
    // };
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
          <main className={ this.state.params[0] === 'help' ? "main-column fullwidth" : "main-column" }>
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
                transferToken={ this.transferToken }
                changeMode={ this.changeMode } />
            }
            {
              this.state.params[0] === 'help' &&
              <Help />
            }
            {
              !this.state.profile.activeProfile
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
                    <div className="btn-group">
                      <button className="text-btn disable-on-dialog" disabled={ !skrActions.join.active } data-method="join" onClick={ this.handleOpenDialog }>Convert WETH to PETH</button>
                      <button className="text-btn disable-on-dialog" disabled={ !skrActions.exit.active } data-method="exit" onClick={ this.handleOpenDialog }>Convert PETH to WETH</button>
                    </div>
                  </header>
                  {
                    !this.state.system.tub.cupsLoading && Object.keys(this.state.system.tub.cups).length > 1 &&
                    Object.keys(this.state.system.tub.cups).map(key =>
                      <button key={ key } className="text-btn disable-on-dialog" data-cupId={ key } disabled={ cupId === key } onClick={ this.changeCup }>CDP { key }</button>
                    )
                  }
                  {
                    this.state.system.tub.cupsLoading
                    ?
                      'Loading...'
                    :
                      Object.keys(this.state.system.tub.cups).length > 0
                      ?
                        <Cup system={ this.state.system } tab={ this.tab } handleOpenDialog={ this.handleOpenDialog } />
                      :
                      <button className="text-btn disable-on-dialog" disabled={ !openAction.active } data-method="open" onClick={ this.handleOpenDialog }>Open Your CDP</button>
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
                  <Wallet system={ this.state.system } network={ this.state.network.network } profile={ this.state.profile } />
                  <SystemInfo system={ this.state.system } network={ this.state.network.network } profile={ this.state.profile } pipVal = { this.state.system.pip.val } pepVal = { this.state.system.pep.val } />
                </div>	
                <div className="footer col col-no-border typo-cs typo-grid-grey">
                  <a href="#action" onClick={ this.handleOpenTermsModal } data-modal="announcement">Dai Public Announcement</a> || <a href="#action" onClick={ this.handleOpenTermsModal } data-modal="terms">Dai Terms of Service</a>
                </div>
              </div>
            }
          </aside>
        </div>
        <Dialog system={ this.state.system } dialog={ this.state.dialog } updateValue={ this.updateValue } handleCloseDialog={ this.handleCloseDialog } tab={ this.tab } rap={ this.rap } proxyEnabled={ this.state.profile.mode === 'proxy' && web3.isAddress(this.state.profile.proxy) } />
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
