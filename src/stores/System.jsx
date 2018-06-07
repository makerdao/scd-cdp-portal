import {observable, decorate} from "mobx"
import * as Blockchain from "../blockchainHandler";

import {BIGGESTUINT256, toBigNumber, fromWei, toWei, wmul, wdiv, fromRaytoWad, WAD, toBytes32, addressToBytes32, methodSig, isAddress, toAscii, toChecksumAddress} from '../helpers';

const settings = require('../settings');

class SystemStore {
  network = null;
  profile = null;
  tub = null;
  top = null;
  tap = null;
  vox = null;
  pit = null;
  gem = null;
  gov = null;
  skr = null;
  dai = null;
  sin = null;
  pip = null;
  pep = null;

  constructor() {
    this.clear();
  }

  clear = () => {
    this.tub = {
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
      cupId: null,
      cupsLoading: true,
      cupsCount: 0,
      cupsPage: 1,
      legacyCups: {}
    };
    this.top = {
      address: null,
    };
    this.tap = {
      address: null,
      fix: toBigNumber(-1),
      gap: toBigNumber(-1),
    };
    this.vox = {
      address: null,
      era: toBigNumber(-1),
      tau: toBigNumber(-1),
      par: toBigNumber(-1),
      way: toBigNumber(-1),
    };
    this.pit = {
      address: null,
    };
    this.gem = {
      address: null,
      totalSupply: toBigNumber(-1),
      myBalance: toBigNumber(-1),
      tubBalance: toBigNumber(-1),
      tapBalance: toBigNumber(-1),
    };
    this.gov = {
      address: null,
      totalSupply: toBigNumber(-1),
      myBalance: toBigNumber(-1),
      pitBalance: toBigNumber(-1),
      allowance: toBigNumber(-1),
    };
    this.skr = {
      address: null,
      totalSupply: toBigNumber(-1),
      myBalance: toBigNumber(-1),
      tubBalance: toBigNumber(-1),
      tapBalance: toBigNumber(-1),
    };
    this.dai = {
      address: null,
      totalSupply: toBigNumber(-1),
      myBalance: toBigNumber(-1),
      tapBalance: toBigNumber(-1),
      allowance: toBigNumber(-1),
    };
    this.sin = {
      address: null,
      totalSupply: toBigNumber(-1),
      tubBalance: toBigNumber(-1),
      tapBalance: toBigNumber(-1),
      // This field will keep an estimated value of new sin which is being generated due the 'stability/issuer fee'.
      // It will return to zero each time 'drip' is called
      issuerFee: toBigNumber(0),
    };
    this.pip = {
      address: null,
      val: toBigNumber(-1),
    };
    this.pep = {
      address: null,
      val: toBigNumber(-1),
    };
  }

  init = (top, tub, tap, vox, pit) => {
    if (this.network.network && !this.network.stopIntervals) {
      this.top.address = top;
      this.tub.address = tub;
      this.tap.address = tap;

      this.vox.address = vox;
      this.pit.address = pit;

      this.loadVariables();

      if (settings.chain[this.network.network].service) {
        if (settings.chain[this.network.network].chart) {
          // this.getPricesFromService(); // TODO
        }
        // this.getStats();
      }

      this.getMyCups();
      this.getMyLegacyCups();

      this.setFiltersTub();
      this.setFiltersTap();
      this.setFiltersVox();
      this.setFilterFeedValue('pip');
      this.setFilterFeedValue('pep');
    }
  }

  loadVariables = (onlySecondDependent = false) => {
    if (!onlySecondDependent) {
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
      this.getParameterFromTub('per', true);
      this.getParameterFromTub('gap');
      this.getParameterFromTub('tag', true, this.calculateSafetyAndDeficit);
      this.getParameterFromTap('fix', true);
      this.getParameterFromTap('gap', false, this.getBoomBustValues);
      this.getParameterFromVox('way', true);
    }
    this.getParameterFromTub('chi', true);
    this.getParameterFromTub('rhi', true);
    this.getParameterFromVox('par', true);
    this.loadEraRho();
  }

  loadEraRho = () => {
    const promises = [
                      this.getParameterFromTub('rho'),
                      this.getParameterFromVox('era')
                      ];
    Promise.all(promises).then(r => {
      if (r[0] === true && r[1] === true && this.tub.tax.gte(0) && this.sin.tubBalance.gte(0)) {
        this.sin.issuerFee = this.sin.tubBalance.times(fromWei(this.tub.tax).pow(this.vox.era.minus(this.tub.rho))).minus(this.sin.tubBalance).round(0);
      }
    });
  }

  getParameterFromTub = (field, ray = false, callback = false) => {
    return new Promise((resolve, reject) => {
      Blockchain.objects.tub[field].call((e, value) => {
        if (!e) {
          this.tub[field] = ray ? fromRaytoWad(value) : value;
          this.getBoomBustValues();
          const promises = [];
          Object.keys(this.tub.cups).map(key =>
            promises.push(this.addExtraCupData(this.tub.cups[key]))
          );
          Promise.all(promises).then(r => {
            if (r.length > 0) {
              for (let i = 0; i < r.length; i++) {
                if (typeof this.tub.cups[r[i].id] !== 'undefined') {
                  this.tub.cups[r[i].id].pro = r[i].pro;
                  this.tub.cups[r[i].id].ratio = r[i].ratio;
                  this.tub.cups[r[i].id].avail_dai = r[i].avail_dai;
                  this.tub.cups[r[i].id].avail_dai_with_margin = r[i].avail_dai_with_margin;
                  this.tub.cups[r[i].id].avail_skr = r[i].avail_skr;
                  this.tub.cups[r[i].id].avail_skr_with_margin = r[i].avail_skr_with_margin;
                  this.tub.cups[r[i].id].liq_price = r[i].liq_price;
                  this.tub.cups[r[i].id].safe = r[i].safe;
                }
              }
            }
          });
          if (callback) {
            callback(value);
          }
          resolve(this.tub[field]);
        } else {
          reject(e);
        }
      });
    });
  }

  getParameterFromTap = (field, ray = false) => {
    const p = new Promise((resolve, reject) => {
      Blockchain.objects.tap[field].call((e, value) => {
        if (!e) {
          this.tap[field] = ray ? fromRaytoWad(value) : value;
          resolve(this.tap[field]);
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
          this.vox[field] = ray ? fromRaytoWad(value) : value;
          resolve(this.vox[field]);
        } else {
          reject(e);
        }
      });
    });
    return p;
  }

  getValFromFeed = obj => {
    const p = new Promise((resolve, reject) => {
      Blockchain.objects[obj].peek.call((e, r) => {
        if (!e) {
          this[obj].val = toBigNumber(r[1] ? parseInt(r[0], 16) : -2);
          this.getBoomBustValues();
          resolve(this[obj].val);
        } else {
          reject(e);
        }
      });
    });
    return p;
  }

  setFiltersTub = () => {
    if (!Blockchain.getProviderUseLogs()) return;
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
        this.transactions.logTransactionConfirmed(r.transactionHash);
        if (cupSignatures.indexOf(r.args.sig) !== -1 && typeof this.tub.cups[r.args.foo] !== 'undefined') {
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
    if (!Blockchain.getProviderUseLogs()) return;
    Blockchain.objects.tap.LogNote({}, {fromBlock: 'latest'}, (e, r) => {
      if (!e) {
        this.transactions.logTransactionConfirmed(r.transactionHash);
        if (r.args.sig === methodSig('mold(bytes32,uint256)')) {
          this.getParameterFromTap('gap', false, this.getBoomBustValues());
        }
      }
    });
  }

  setFiltersVox = () => {
    if (!Blockchain.getProviderUseLogs()) return;
    Blockchain.objects.vox.LogNote({}, {fromBlock: 'latest'}, (e, r) => {
      if (!e) {
        this.transactions.logTransactionConfirmed(r.transactionHash);
        if (r.args.sig === methodSig('mold(bytes32,uint256)')) {
          this.getParameterFromVox('way', true);
        }
      }
    });
  }

  setFilterFeedValue = obj => {
    Blockchain.objects.tub[obj].call((e, r) => {
      if (!e) {
        this[obj].address = r;
        Blockchain.loadObject('dsvalue', r, obj);
        this.getValFromFeed(obj);

        if (Blockchain.getProviderUseLogs()){
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
        }
      }
    })
  }

  getBoomBustValues = () => {
    if (this.dai.tapBalance.gte(0)
    //&& this.sin.issuerFee.gte(0)
    && this.sin.tapBalance.gte(0)
    && this.vox.par.gte(0)
    && this.tub.tag.gte(0)
    && this.tap.gap.gte(0)
    && this.pip.val.gte(0)
    && this.skr.tapBalance.gte(0)
    && this.sin.tubBalance.gte(0)
    && this.tub.tax.gte(0)
    && this.skr.tapBalance.gte(0)
    && this.skr.totalSupply.gte(0)
    && this.gem.tubBalance.gte(0)) {
      // const dif = this.dai.tapBalance.add(this.sin.issuerFee).minus(this.sin.tapBalance); bust & boom don't execute drip anymore so we do not need to do the estimation
      const dif = this.dai.tapBalance.minus(this.sin.tapBalance);
      this.tub.avail_boom_dai = this.tub.avail_boom_skr = toBigNumber(0);
      this.tub.avail_bust_dai = this.tub.avail_bust_skr = toBigNumber(0);

      // if higher or equal, it means vox.par is static or increases over the time
      // if lower, it means it decreases over the time, so we calculate a future par (in 10 minutes) to reduce risk of tx failures
      const futurePar = this.vox.way.gte(WAD) ? this.vox.par : this.vox.par.times(fromWei(this.vox.way).pow(10*60));

      if (dif.gt(0)) {
        // We can boom
        this.tub.avail_boom_dai = dif;
        this.tub.avail_boom_skr = wdiv(wdiv(wmul(this.tub.avail_boom_dai, futurePar), this.tub.tag), WAD.times(2).minus(this.tap.gap));
      }

      if (this.skr.tapBalance.gt(0) || dif.lt(0)) {
        // We can bust

        // This is a margin we need to take into account as bust quantity goes down per second
        // const futureFee = this.sin.tubBalance.times(fromWei(this.tub.tax).pow(120)).minus(this.sin.tubBalance).round(0); No Drip anymore!!!
        // const daiNeeded = dif.abs().minus(futureFee);
        const daiNeeded = dif.gte(0) ? toBigNumber(0) : dif.abs();
        const equivalentSKR = wdiv(wdiv(wmul(daiNeeded, futurePar), this.tub.tag), this.tap.gap);

        if (this.skr.tapBalance.gte(equivalentSKR)) {
          this.tub.avail_bust_skr = this.skr.tapBalance;
          this.tub.avail_bust_ratio = wmul(wmul(wdiv(WAD, this.vox.par), this.tub.tag), this.tap.gap);
          this.tub.avail_bust_dai = wmul(this.tub.avail_bust_skr, this.tub.avail_bust_ratio);
        } else {
          this.tub.avail_bust_dai = daiNeeded;
          // We need to consider the case where PETH needs to be minted generating a change in 'this.tub.tag'
          this.tub.avail_bust_skr = wdiv(this.skr.totalSupply.minus(this.skr.tapBalance), wdiv(wmul(wmul(this.pip.val, this.tap.gap), this.gem.tubBalance), wmul(this.tub.avail_bust_dai, this.vox.par)).minus(WAD));
          this.tub.avail_bust_ratio = wdiv(this.tub.avail_bust_dai, this.tub.avail_bust_skr);
        }
      }
    }
  }

  calculateSafetyAndDeficit = () => {
    if (this.tub.mat.gte(0) && this.skr.tubBalance.gte(0) && this.tub.tag.gte(0) && this.sin.totalSupply.gte(0)) {
      const pro = wmul(this.skr.tubBalance, this.tub.tag);
      const con = this.sin.totalSupply;
      this.tub.eek = pro.lt(con);

      const min = wmul(con, this.tub.mat);
      this.tub.safe = pro.gte(min);
    }
  }

  calculateLiquidationPrice = (skr, dai) => {
    return wdiv(wmul(wmul(dai, this.vox.par), this.tub.mat), wmul(skr, this.tub.per));
  }

  calculateRatio = (skr, dai) => {
    return wdiv(wmul(skr, this.tub.tag).round(0), wmul(dai, this.vox.par));
  }

  getFromService = query => {
    const p = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', settings.chain[this.network.network].service, true);
      xhr.setRequestHeader("Content-type", "application/graphql");
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
          reject(xhr.status);
        }
      }
      // xhr.send();
      xhr.send(`query ${query}`);
    });
    return p;
  }

  getCupHistoryFromService = cupId => {
    return new Promise((resolve, reject) => {
      this.getFromService(`{ getCup(id: ${cupId}) { actions { nodes { act arg guy tx time } } } }`)
      .then(r => resolve(r.data.getCup ? r.data.getCup.actions.nodes : null), e => reject(e))
    });
  }

  getCup = id => {
    return new Promise((resolve, reject) => {
      Blockchain.objects.tub.cups.call(toBytes32(id), (e, cupData) => {
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

  getCupsFromService = lad => {
    return new Promise((resolve, reject) => {
      this.getFromService(`{ allCups( condition: { lad: "${toChecksumAddress(lad)}" } ) { nodes { id, block } } }`)
      .then(r => resolve(r.data.allCups.nodes), e => reject(e))
    });
  }

  getCupsFromChain = (lad, fromBlock, promisesCups = []) => {
    if (!Blockchain.getProviderUseLogs()) return promisesCups;
    return new Promise((resolve, reject) => {
      const promisesLogs = [];
      promisesLogs.push(
        new Promise((resolve, reject) => {
          Blockchain.objects.tub.LogNewCup({lad}, {fromBlock}).get((e, r) => {
            if (!e) {
              for (let i = 0; i < r.length; i++) {
                promisesCups.push(this.getCup(parseInt(r[i].args.cup, 16)));
              }
              resolve();
            } else {
              reject(e);
            }
          });
        })
      );
      promisesLogs.push(
        new Promise((resolve, reject) => {
          Blockchain.objects.tub.LogNote({sig: methodSig('give(bytes32,address)'), bar: toBytes32(lad)}, {fromBlock}).get((e, r) => {
            if (!e) {
              for (let i = 0; i < r.length; i++) {
                promisesCups.push(this.getCup(parseInt(r[i].args.foo, 16)));
              }
              resolve();
            } else {
              reject(e);
            }
          });
        })
      );
      Promise.all(promisesLogs).then(() => resolve(promisesCups), e => reject(e));
    });
  }

  getCups = async (type, keepTrying = false) => {
    const lad = type === 'new' ? this.profile.proxy : this.network.defaultAccount;
    const me = this;
    let promisesCups = [];
    let fromBlock = settings.chain[this.network.network].fromBlock;

    try {
      const serviceData = settings.chain[this.network.network].service ? await this.getCupsFromService(lad) : [];
      serviceData.forEach(v => {
        promisesCups.push(me.getCup(v.id));
        fromBlock = v.block > fromBlock ? v.block + 1 : fromBlock;
      });
    } finally {
      promisesCups = await this.getCupsFromChain(lad, fromBlock, promisesCups);
      this.filterCups(keepTrying, type, promisesCups);
    }
  }
  
  filterCups = (keepTrying, type, promisesCups = []) => {
    const lad = type === 'new' ? this.profile.proxy : this.network.defaultAccount;
    const conditions = {lad};
    conditions.closed = false;
    if (type === 'legacy' || this.tub.cupsLoading) {
      Promise.all(promisesCups).then(cups => {
        const cupsFiltered = {};
        for (let i = 0; i < cups.length; i++) {
          if (conditions.lad === cups[i].lad) {
              cupsFiltered[cups[i].id] = cups[i];
          }
        }
        const keys = Object.keys(cupsFiltered).sort((a, b) => a - b);
        if (type === 'new') {
          if (this.tub.cupsLoading) {
            this.tub.cups = cupsFiltered;

            this.tub.cupsLoading = keepTrying && keys.length === 0;
            if (this.tub.cupsLoading) {
              // If we know there is a new CDP and it still not available, keep trying & loading
              setTimeout(() => this.getMyCups(true), 3000)
            } else if (!this.network.stopIntervals && keys.length > 0 && settings.chain[this.network.network].service) {
              keys.forEach(key => {
                Promise.resolve(this.getCupHistoryFromService(key)).then(response => {
                  this.tub.cups[key].history = response
                  // this.calculateCupChart(); // TODO
                }, () => {});
              });
            }
          }
        } else if (type === 'legacy') {
          this.tub.legacyCups = cupsFiltered;
        }
      });
    }
  }

  getMyCups = (keepTrying = false) => {
    if (this.profile.proxy) {
      this.tub.cupsLoading = true;
      this.getCups('new', keepTrying);
    } else {
      this.tub.cupsLoading = false;
    }
  }

  getMyLegacyCups = () => {
    this.getCups('legacy');
  }

  addExtraCupData = cup => {
    cup = this.calculateCupData(cup);
    return new Promise((resolve, reject) => {
      Blockchain.objects.tub.safe['bytes32'].call(toBytes32(cup.id), (e, safe) => {
        if (!e) {
          cup.safe = safe;
          resolve(cup);
        } else {
          reject(e);
        }
      });
    });
  }

  calculateCupData = cup => {
    cup.pro = wmul(cup.ink, this.tub.tag).round(0);
    cup.ratio = cup.pro.div(wmul(this.tab(cup), this.vox.par));
    // This is to give a window margin to get the maximum value (as 'chi' is dynamic value per second)
    const marginTax = fromWei(this.tub.tax).pow(120);
    cup.avail_dai = wdiv(cup.pro, wmul(this.tub.mat, this.vox.par)).minus(this.tab(cup)).round(0).minus(1); // "minus(1)" to avoid rounding issues when dividing by mat (in the contract uses it mulvoxlying on safe function)
    cup.avail_dai_with_margin = wdiv(cup.pro, wmul(this.tub.mat, this.vox.par)).minus(this.tab(cup).times(marginTax)).round(0).minus(1);
    cup.avail_dai_with_margin = cup.avail_dai_with_margin.lt(0) ? toBigNumber(0) : cup.avail_dai_with_margin;
    cup.avail_skr = cup.ink.minus(wdiv(wmul(wmul(this.tab(cup), this.tub.mat), this.vox.par), this.tub.tag)).round(0);
    cup.avail_skr_with_margin = cup.ink.minus(wdiv(wmul(wmul(this.tab(cup).times(marginTax), this.tub.mat), this.vox.par), this.tub.tag)).round(0);
    cup.avail_skr_with_margin = cup.avail_skr_with_margin.lt(0) ? toBigNumber(0) : cup.avail_skr_with_margin;
    cup.liq_price = cup.ink.gt(0) && cup.art.gt(0) ? wdiv(wdiv(wmul(this.tab(cup), this.tub.mat), this.tub.per), cup.ink) : toBigNumber(0);
    return cup;
  }

  reloadCupData = (id) => {
    Promise.resolve(this.getCup(id).then(cup => {
      this.tub.cups[id] = {...cup};
      if (settings.chain[this.network.network].service) {
        Promise.resolve(this.getCupHistoryFromService(id)).then(response => {
          this.tub.cups[id].history = response;
        }, () => {});
      }
    }));
  }

  changeCup = e => {
    e.preventDefault();
    this.tub.cupId = e.target.getAttribute('data-cupid');
    // this.calculateCupChart();
  }

  tab = cup => {
    return wmul(cup.art, this.tub.chi).round(0);
  }
  
  rap = cup => {
    return wmul(cup.ire, this.tub.rhi).minus(this.tab(cup)).round(0);
  }

  setUpToken = token => {
    Blockchain.objects.tub[token.replace('dai', 'sai')].call((e, r) => {
      if (!e) {
        this[token].address = r;
        Blockchain.loadObject(token === 'gem' ? 'dsethtoken' : 'dstoken', r, token);
        this.getDataFromToken(token);
        this.setFilterToken(token);
      }
    })
  }
  
  getDataFromToken = token => {
    this.getTotalSupply(token);
  
    if (token !== 'sin' && isAddress(this.network.defaultAccount)) {
      this.getBalanceOf(token, this.network.defaultAccount, 'myBalance');
    }
    if (token === 'gem' || token === 'skr' || token === 'sin') {
      this.getBalanceOf(token, this.tub.address, 'tubBalance');
    }
    if (token === 'gem' || token === 'skr' || token === 'dai' || token === 'sin') {
      this.getBalanceOf(token, this.tap.address, 'tapBalance');
      this.getBoomBustValues();
    }
    if (token === 'gem' || token === 'skr') {
      this.getParameterFromTub('per', true);
    }
    if (token === 'gov') {
      this.getBalanceOf(token, this.pit.address, 'pitBalance');
    }
    if (token === 'gov' || token === 'dai') {
      this.getAllowance(token);
    }
  }
  
  getTotalSupply = token => {
    Blockchain.objects[token].totalSupply.call((e, r) => {
      if (!e) {
        this[token].totalSupply = r;
        if (token === 'sin') {
          this.calculateSafetyAndDeficit();
        }
      }
    })
  }
  
  getBalanceOf = (token, address, field) => {
    Blockchain.objects[token].balanceOf.call(address, (e, r) => {
      if (!e) {
        this[token][field] = r;
        if ((token === 'skr' || token === 'dai') && field === 'tubBalance') {
          this.calculateSafetyAndDeficit();
        }
      }
    })
  }

  getAllowance = token => {
    Blockchain.objects[token].allowance.call(this.network.defaultAccount, this.profile.proxy, (e, r) => {
      if (!e) {
        this[token].allowance = r;
      }
    })
  }

  setFilterToken = token => {
    if (!Blockchain.getProviderUseLogs()) return;
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
      if (Blockchain.objects[token][filters[i]]) {
        Blockchain.objects[token][filters[i]](conditions, {fromBlock: 'latest'}, (e, r) => {
          if (!e) {
            this.transactions.logTransactionConfirmed(r.transactionHash);
            this.getDataFromToken(token);
          }
        });
      }
    }
  }

  setAllowance = (token, value, callbacks = []) => {
    const title = `${token.replace('gem', 'weth').replace('gov', 'mkr').replace('skr', 'peth').toUpperCase()}: ${value ? 'unlock' : 'lock'}`;
    this.transactions.setPriceAndSend(title, Blockchain.objects[token].approve, [this.profile.proxy, value ? -1 : 0], {value: 0}, callbacks);
  }

  // Actions
  checkAllowance = (token, callbacks) => {
    Blockchain.getAllowance(token, this.network.defaultAccount, this.profile.proxy).then(r => {
      if (r.equals(BIGGESTUINT256)) {
        callbacks.forEach(callback => this.transactions.executeCallback(callback));
      } else {
        this.setAllowance(token, -1, callbacks);
      }
    }, () => {});
  }
  
  transferToken = (token, to, amount) => {
    const title = `${token.replace('gov', 'mkr').toUpperCase()}: transfer ${to} ${amount}`;
    if (token === 'eth') {
      this.transactions.setPriceAndSend(title, Blockchain.sendTransaction, [], {to, value: toWei(amount)}, [['system/setUpToken', token]]);
    } else {
      this.transactions.setPriceAndSend(title, Blockchain.objects[token].transfer, [to, toWei(amount)], {value: 0}, [['system/setUpToken', token]]);
    }
  }

  migrateCDP = async cup => {
    // We double check user has a proxy and owns it (transferring a CDP is a very risky action)
    const proxy = this.profile.proxy;
    if (proxy && isAddress(proxy) && await Blockchain.getProxyOwner(proxy) === this.network.defaultAccount) {
      const title = `Migrate CDP ${cup}`;
      this.transactions.setPriceAndSend(title, Blockchain.objects.tub.give, [toBytes32(cup), proxy], {value: 0}, [['system/getMyCups'], ['system/getMyLegacyCups']]);
    }
  }

  executeProxyTx = (action, value, notificator) => {
    this.transactions.setPriceAndSend(notificator.title, Blockchain.objects.proxy.execute['address,bytes'], [settings.chain[this.network.network].proxyContracts.sai, action], {value}, notificator.callbacks);
  }
  
  open = () => {
    const title = 'Open CDP';
    const action = `${methodSig(`open(address)`)}${addressToBytes32(this.tub.address, false)}`;
    this.executeProxyTx(action, 0, {title, callbacks: [['system/getMyCups']]});
  }
  
  shut = (cupId, useOTC = false) => {
    const title = `Shut CDP ${cupId}`;
    const action = `${methodSig(`shut(address,bytes32${useOTC ? ',address' : ''})`)}${addressToBytes32(this.tub.address, false)}${toBytes32(cupId, false)}${useOTC ? addressToBytes32(settings.chain[this.network.network].otc, false) : ''}`;
    this.executeProxyTx(action, 0, {title, callbacks: [['system/getMyCups'], ['profile/getAccountBalance'], ['system/setUpToken', 'dai'], ['system/setUpToken', 'sin']]});
  }
  
  give = (cupId, newOwner) => {
    const title = `Transfer CDP ${cupId} to ${newOwner}`;
    const action = `${methodSig(`give(address,bytes32,address)`)}${addressToBytes32(this.tub.address, false)}${toBytes32(cupId, false)}${addressToBytes32(newOwner, false)}`;
    this.executeProxyTx(action, 0, {title, callbacks: [['system/getMyCups']]});
  }
  
  lockAndDraw = (cupId, eth, dai) => {
    let action = false;
    let title = '';
  
    if (eth.gt(0) || dai.gt(0)) {
      if (!cupId) {
        title = `Create CDP + Lock ${eth.valueOf()} ETH + Draw ${dai.valueOf()} DAI`;
        action = `${methodSig(`lockAndDraw(address,uint256)`)}${addressToBytes32(this.tub.address, false)}${toBytes32(toWei(dai), false)}`;
      } else {
        if (dai.equals(0)) {
          title = `Lock ${eth.valueOf()} ETH`;
          action = `${methodSig(`lock(address,bytes32)`)}${addressToBytes32(this.tub.address, false)}${toBytes32(cupId, false)}`;
        } else if (eth.equals(0)) {
          title = `Draw ${dai.valueOf()} DAI`;
          action = `${methodSig(`draw(address,bytes32,uint256)`)}${addressToBytes32(this.tub.address, false)}${toBytes32(cupId, false)}${toBytes32(toWei(dai), false)}`;
        } else {
          title = `Lock ${eth.valueOf()} ETH + Draw ${dai.valueOf()} DAI`;
          action = `${methodSig(`lockAndDraw(address,bytes32,uint256)`)}${addressToBytes32(this.tub.address, false)}${toBytes32(cupId, false)}${toBytes32(toWei(dai), false)}`;
        }
      }

      this.executeProxyTx(action, toWei(eth), {
                                                title,
                                                callbacks:
                                                  cupId
                                                  ?
                                                    [
                                                      ['system/reloadCupData', cupId], ['profile/getAccountBalance'], ['system/setUpToken', 'dai'], ['system/setUpToken', 'sin']
                                                    ]
                                                  : [
                                                      ['system/getMyCups', true], ['profile/getAccountBalance'], ['system/setUpToken', 'dai'], ['system/setUpToken', 'sin']
                                                    ]
                                              });
    }
  }
  
  wipeAndFree = (cupId, eth, dai, useOTC = false) => {
    let action = false;
    let title = '';
    if (eth.gt(0) || dai.gt(0)) {
      if (dai.equals(0)) {
        title = `Withdraw ${eth.valueOf()} ETH`;
        action = `${methodSig(`free(address,bytes32,uint256)`)}${addressToBytes32(this.tub.address, false)}${toBytes32(cupId, false)}${toBytes32(toWei(eth), false)}`;
      } else if (eth.equals(0)) {
        title = `Wipe ${dai.valueOf()} DAI`;
        action = `${methodSig(`wipe(address,bytes32,uint256${useOTC ? ',address' : ''})`)}${addressToBytes32(this.tub.address, false)}${toBytes32(cupId, false)}${toBytes32(toWei(dai), false)}${useOTC ? addressToBytes32(settings.chain[this.network.network].otc, false) : ''}`;
      } else {
        title = `Wipe ${dai.valueOf()} DAI + Withdraw ${eth.valueOf()} ETH`;
        action = `${methodSig(`wipeAndFree(address,bytes32,uint256,uint256${useOTC ? ',address' : ''})`)}${addressToBytes32(this.tub.address, false)}${toBytes32(cupId, false)}${toBytes32(toWei(eth), false)}${toBytes32(toWei(dai), false)}${useOTC ? addressToBytes32(settings.chain[this.network.network].otc, false) : ''}`;
      }
        this.executeProxyTx(action, 0, {
                                        title,
                                        callbacks:  [
                                                      ['system/reloadCupData', cupId], ['profile/getAccountBalance'], ['system/setUpToken', 'dai'], ['system/setUpToken', 'sin']
                                                    ]
                                      });
    }
  }
  
  executeAction = params => {
    const value = params.value;
    let callbacks = [];
    let error = false;
    switch (this.dialog.method) {
      case 'open':
        callbacks = [
                      ['system/open']
                    ];
        break;
      case 'lock':
        callbacks = [
                      ['system/lockAndDraw', this.dialog.cupId, value, toBigNumber(0)]
                    ];
        break;
      case 'draw':
        callbacks = [
                      ['system/lockAndDraw', this.dialog.cupId, toBigNumber(0), value]
                    ];
        break;
      case 'wipe':
        callbacks = [
                      ['system/checkAllowance', 'dai',
                        [
                          ['system/wipeAndFree', this.dialog.cupId, toBigNumber(0), value, params.govFeeType === 'dai']
                        ]
                      ]
                    ];
        if (params.govFeeType === 'mkr') {
          // If fee will be paid with MKR it is necessary to check its allowance
          callbacks = [
                        ['system/checkAllowance', 'gov',
                          callbacks
                        ]
                      ];
        }
        break;
      case 'free':
        callbacks = [
                      ['system/wipeAndFree', this.dialog.cupId, value, toBigNumber(0)]
                    ];
        break;
      case 'shut':
        const futureGovFee = fromWei(this.tub.fee).pow(180).round(0); // 3 minutes of future fee
        const govDebtSai = wmul(this.rap(this.tub.cups[this.dialog.cupId]), futureGovFee);
        const govDebtGov = wmul(govDebtSai, this.pep.val);

        const valuePlusGovFee = params.govFeeType === 'dai' ? this.tab(this.tub.cups[this.dialog.cupId]).add(govDebtSai.times(1.25)) : this.tab(this.tub.cups[this.dialog.cupId]); // If fee is paid in DAI we add an extra 25% (spread)

        if (valuePlusGovFee.gt(this.dai.myBalance)) {
          error = 'Not enough DAI to close this CDP';
        } else if (params.govFeeType === 'mkr' && govDebtGov.gt(this.gov.myBalance)) {
          error = 'Not enough MKR to close this CDP';
        }
        callbacks = [
                      ['system/checkAllowance', 'dai',
                        [
                          ['system/shut', this.dialog.cupId, params.govFeeType === 'dai']
                        ]
                      ]
                    ];
        if (params.govFeeType === 'mkr') {
          // If fee will be paid with MKR it is necessary to check its allowance
          callbacks = [
                        ['system/checkAllowance', 'gov',
                          callbacks
                        ]
                      ];
        }
        break;
      case 'migrate':
        callbacks = [
                      ['system/migrateCDP', this.dialog.cupId]
                    ];
        break;
      default:
        break;
    }
  
    if (error) {
      this.dialog.error = error;
    } else {
      this.dialog.show = false;
      this.profile.checkProxy(callbacks);
    }
  }
}

decorate(SystemStore, {
  network: observable,
  profile: observable,
  tub: observable,
  top: observable,
  tap: observable,
  vox: observable,
  pit: observable,
  gem: observable,
  gov: observable,
  skr: observable,
  dai: observable,
  sin: observable,
  pip: observable,
  pep: observable,
});

const store = new SystemStore();
export default store;
