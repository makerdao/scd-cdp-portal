// Libraries
import {computed, observable} from "mobx";
import Maker from '@makerdao/dai';

// Utils
import * as blockchain from "../utils/blockchain";
import * as daisystem from "../utils/dai-system";

import {BIGGESTUINT256, toBigNumber, fromWei, toWei, wdiv, toBytes32, addressToBytes32, methodSig, isAddress, toAscii} from "../utils/helpers";

// Settings
import * as settings from "../settings";

export default class SystemStore {
  @observable tub = {};
  @observable top = {};
  @observable tap = {};
  @observable vox = {};
  @observable pit = {};
  @observable gem = {};
  @observable gov = {};
  @observable skr = {};
  @observable dai = {};
  @observable sin = {};
  @observable pip = {};
  @observable pep = {};
  @observable currentEthPrice = null;
  @observable currentMkrPrice = null;
  @observable currentWethToPethRatio = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.reset();
  }

  @computed get showLegacyAlert() {
    return !Object.keys(this.tub.legacyCups).every(elem => Object.keys(this.tub.cups).indexOf(elem) > -1);
  }

  reset = () => {
    this.tub = {
      address: null,
      authority: null,
      eek: "undefined",
      safe: "undefined",
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
      // This field will keep an estimated value of new sin which is being generated due the "stability/issuer fee".
      // It will return to zero each time "drip" is called
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

    this.currentEthPrice = null;
    this.currentMkrPrice = null;
    this.currentWethToPethRatio = null;
  }

  init = (top, tub, tap, vox, pit) => {
    // TODO: Maybe put the transaction manager tx monitor in here?

    if (this.rootStore.network.network && !this.rootStore.network.stopIntervals) {
      this.top.address = top;
      this.tub.address = tub;
      this.tap.address = tap;

      this.vox.address = vox;
      this.pit.address = pit;

      this.setVariables();

      this.setMyCupsFromChain();
      this.setMyLegacyCupsFromChain();

      this.setFiltersTub();
      this.setFiltersTap();
      this.setFiltersVox();

      // Monitor blockchain price of DAI
      this.setFilterFeedValue("pip");
      // Monitor blockchain price of GOV
      this.setFilterFeedValue("pep");

      const priceService = window.maker.service('price');

      priceService.getMkrPrice().then(price => this.currentMkrPrice = price._amount);
      priceService.getWethToPethRatio().then(ratio => this.currentWethToPethRatio = toBigNumber(ratio));
      priceService.getEthPrice().then(price => this.currentEthPrice = price._amount);

      window.maker.on('price/ETH_USD', price => {
        console.log('Got price/ETH_USD update event:', price);
      })

    }
  }

  setVariables = (onlySecondDependent = false) => {
    if (!onlySecondDependent) {
      this.setUpTokenFromChain("gem");
      this.setUpTokenFromChain("gov");
      this.setUpTokenFromChain("skr");
      this.setUpTokenFromChain("dai");
      this.setUpTokenFromChain("sin");
      this.setParameterFromTub("authority");
      this.setParameterFromTub("off");
      this.setParameterFromTub("out");
      this.setParameterFromTub("axe", true);
      this.setParameterFromTub("mat", true, this.calculateSafetyAndDeficit);
      this.setParameterFromTub("cap");
      this.setParameterFromTub("fit");
      this.setParameterFromTub("tax", true);
      this.setParameterFromTub("fee", true);
      this.setParameterFromTub("per", true);
      this.setParameterFromTub("gap");
      this.setParameterFromTub("tag", true, this.calculateSafetyAndDeficit);
      this.setParameterFromTap("fix", true);
      this.setParameterFromTap("gap", false);
      this.setParameterFromVox("way", true);
    }
    this.setParameterFromTub("chi", true);
    this.setParameterFromTub("rhi", true);
    this.setParameterFromVox("par", true);
    this.setEraRho();
  }

  setEraRho = () => {
    const promises = [
                      daisystem.getParameterFromTub("rho"),
                      daisystem.getParameterFromVox("era")
                      ];
    Promise.all(promises)
    .then(r => {
      if (r[0] === true && r[1] === true && this.tub.tax.gte(0) && this.sin.tubBalance.gte(0)) {
        this.sin.issuerFee = this.sin.tubBalance.times(fromWei(this.tub.tax).pow(this.vox.era.minus(this.tub.rho))).minus(this.sin.tubBalance).round(0);
      }
    })
    .catch(e => {
      console.log(e);
    });
  }

  loadExtraCupData = type => {
    const promises = [];
    Object.keys(this.tub[type]).forEach(key => {
      if (this.vox.par.gte(0) && this.tub.tag.gte(0) && this.tub.tax.gte(0) && this.tub.mat.gte(0) && this.tub.per.gte(0) && this.tub.chi.gte(0)) {
        promises.push(daisystem.addExtraCupData(this.tub[type][key], this.vox.par, this.tub.tag, this.tub.tax, this.tub.mat, this.tub.per, this.tub.chi));
      }
    });
    Promise.all(promises).then(r => {
      if (r.length > 0) {
        for (let i = 0; i < r.length; i++) {
          if (typeof this.tub[type][r[i].id] !== "undefined") {
            this.tub[type][r[i].id].pro = r[i].pro;
            this.tub[type][r[i].id].ratio = r[i].ratio;
            this.tub[type][r[i].id].avail_dai = r[i].avail_dai;
            this.tub[type][r[i].id].avail_dai_with_margin = r[i].avail_dai_with_margin;
            this.tub[type][r[i].id].avail_skr = r[i].avail_skr;
            this.tub[type][r[i].id].avail_skr_with_margin = r[i].avail_skr_with_margin;
            this.tub[type][r[i].id].liq_price = r[i].liq_price;
            this.tub[type][r[i].id].safe = r[i].safe;
          }
        }
      }
    });
  }

  setParameterFromTub = async (field, ray = false, callback = false) => {
    try {
      const value = await daisystem.getParameterFromTub(field, ray);
      this.tub[field] = value;
      this.loadExtraCupData('cups');
      this.loadExtraCupData('legacyCups');
      if (callback) {
        callback(value);
      }
    } catch(e) {
      console.log(e)
    }
  }

  setParameterFromTap = async (field, ray = false) => {
    try {
      this.tap[field] = await daisystem.getParameterFromTap(field, ray);
    } catch(e) {
      console.log(e);
    }
  }

  setParameterFromVox = async (field, ray = false) => {
    try {
      this.vox[field] = await daisystem.getParameterFromVox(field, ray);
    } catch(e) {
      console.log(e);
    }
  }

  setValFromFeed = async obj => {
    try {
      this[obj].val = await daisystem.getValFromFeed(obj);
    } catch(e) {
      console.log(e);
    }
  }

  calculateSafetyAndDeficit = () => {
    const values = daisystem.calculateSafetyAndDeficit(this.tub.mat, this.skr.tubBalance, this.tub.tag, this.sin.totalSupply);
    Object.keys(values).forEach(key => {
      this[key] = {...this[key], ...values[key]};
    });
  }

  getCup = id => {
    return daisystem.getCup(id, this.vox.par, this.tub.tag, this.tub.tax, this.tub.mat, this.tub.per, this.tub.chi);
  }

  setCups = async (type, keepTrying = false, callbacks = []) => {
    const lad = type === "new" ? this.rootStore.profile.proxy : this.rootStore.network.defaultAccount;
    const me = this;
    let promisesCups = [];
    let fromBlock = settings.chain[this.rootStore.network.network].fromBlock;

    try {
      const serviceData = settings.chain[this.rootStore.network.network].service ? await daisystem.getCupsFromService(this.rootStore.network.network, lad) : [];
      serviceData.forEach(v => {
        promisesCups.push(me.getCup(v.id));
        fromBlock = v.block > fromBlock ? v.block + 1 : fromBlock;
      });
    } finally {
      promisesCups = await daisystem.getCupsFromChain(lad, fromBlock, this.vox.par, this.tub.tag, this.tub.tax, this.tub.mat, this.tub.per, this.tub.chi, promisesCups);

      if (type === "legacy" || this.tub.cupsLoading) {
        Promise.all(promisesCups).then(cups => {
          const cupsFiltered = {};
          for (let i = 0; i < cups.length; i++) {
            if (lad === cups[i].lad) {
                cupsFiltered[cups[i].id] = cups[i];
            }
          }
          const keys = Object.keys(cupsFiltered).sort((a, b) => a - b);
          if (type === "new") {
            if (this.tub.cupsLoading) {
              this.tub.cupId = null;
              this.tub.cups = cupsFiltered;

              this.tub.cupsLoading = keepTrying && keys.length === 0;
              if (this.tub.cupsLoading) {
                // If we know there is a new CDP and it still not available, keep trying & loading
                setTimeout(() => this.setMyCupsFromChain(true), 3000)
              } else if (!this.rootStore.network.stopIntervals && keys.length > 0 && settings.chain[this.rootStore.network.network].service) {
                keys.forEach(key => {
                  this.loadCupHistory(key);
                });
                this.rootStore.transactions.executeCallbacks(callbacks);
              }
            }
          } else if (type === "legacy") {
            this.tub.legacyCups = cupsFiltered;
            this.rootStore.transactions.executeCallbacks(callbacks);
          }
        });
      }
    }
  }

  setMyCupsFromChain = (keepTrying = false, callbacks = []) => {
    if (this.rootStore.profile.proxy) {
      this.tub.cupsLoading = true;
      this.setCups("new", keepTrying, callbacks);
    } else {
      this.tub.cupsLoading = false;
    }
  }

  setMyLegacyCupsFromChain = (callbacks = []) => {
    this.setCups("legacy", false, callbacks);
  }

  moveLegacyCDP = (cupId, callbacks = []) => {
    const cups = {...this.tub.cups};
    cups[cupId] = {...this.tub.legacyCups[cupId]};
    this.tub.cups = cups;
    this.loadCupHistory(cupId);
    this.rootStore.transactions.executeCallbacks(callbacks);
  }

  loadCupHistory = id => {
    let cup = {...this.tub.cups[id]};
    cup.history = "loading";
    this.tub.cups[id] = cup;
    if (settings.chain[this.rootStore.network.network].service) {
      Promise.resolve(daisystem.getCupHistoryFromService(this.rootStore.network.network, id)).then(history => {
        let cup = {...this.tub.cups[id]};
        cup.history = history;
        this.tub.cups[id] = cup;
        const notification = daisystem.getBiteNotification(id, history, localStorage.getItem(`CDPLiquidated${history[0].time}Closed`));
        if (notification) {
          this.rootStore.transactions.notificator.notice(Math.random(), "CDP Liquidated", notification, 0, () => localStorage.setItem(`CDPLiquidated${history[0].time}Closed`, true));
        }
      }, () => {
        let cup = {...this.tub.cups[id]};
        cup.history = false;
        this.tub.cups[id] = cup;
      });
    } else {
      cup.history = false;
      this.tub.cups[id] = cup;
    }
  }

  reloadCupData = id => {
    this.getCup(id).then(cup => {
      this.tub.cups[id] = {...cup};
      this.loadCupHistory(id);
    });
  }

  calculateLiquidationPrice = (skr, dai) => {
    return daisystem.calculateLiquidationPrice(this.vox.par, this.tub.per, this.tub.mat, skr, dai);
  }

  calculateRatio = (skr, dai) => {
    return daisystem.calculateRatio(this.tub.tag, this.vox.par, skr, dai);
  }

  tab = cup => {
    return daisystem.tab(cup, this.tub.chi);
  }

  rap = cup => {
    return daisystem.tab(cup, this.tub.rhi);
  }

  futureRap = (cup, age) => {
    return daisystem.futureRap(cup, age, this.tub.chi, this.tub.rhi, this.tub.tax, this.tub.fee);
  }

  changeCup = cupId => {
    this.tub.cupId = cupId;
  }

  // Token Data
  setUpTokenFromChain = token => {
    blockchain.objects.tub[token.replace("dai", "sai")].call((e, r) => {
      if (!e) {
        this[token].address = r;
        blockchain.loadObject(token === "gem" ? "dsethtoken" : "dstoken", r, token);
        this.setTokenDataFromChain(token);
        this.setFilterToken(token);
      }
    })
  }

  setTokenDataFromChain = token => {
    this.setTotalSupplyFromChain(token);
    if (token !== "sin" && isAddress(this.rootStore.network.defaultAccount)) {
      this.setBalanceOfFromChain(token, this.rootStore.network.defaultAccount, "myBalance");
    }
    if (token === "gem" || token === "skr" || token === "sin") {
      this.setBalanceOfFromChain(token, this.tub.address, "tubBalance");
    }
    if (token === "gem" || token === "skr" || token === "dai" || token === "sin") {
      this.setBalanceOfFromChain(token, this.tap.address, "tapBalance");
    }
    if (token === "gem" || token === "skr") {
      this.setParameterFromTub("per", true);
    }
    if (token === "gov") {
      this.setBalanceOfFromChain(token, this.pit.address, "pitBalance");
    }
    if (token === "gov" || token === "dai") {
      this.setAllowanceFromChain(token);
    }
  }

  setTotalSupplyFromChain = async token => {
    try {
      this[token].totalSupply = await blockchain.totalSupply(token);
      if (token === "sin") {
        this.calculateSafetyAndDeficit();
      }
    } catch(e) {
      console.log(e);
    }
  }

  setBalanceOfFromChain = async (token, address, field) => {
    try {
      this[token][field] = await blockchain.balanceOf(token, address);
      if ((token === "skr" || token === "dai") && field === "tubBalance") {
        this.calculateSafetyAndDeficit();
      }
    } catch(e) {
      console.log(e);
    }
  }

  setAllowanceFromChain = async (token, callbacks = []) => {
    try {
      this[token].allowance = await blockchain.allowance(token, this.rootStore.network.defaultAccount, this.rootStore.profile.proxy);
      this.rootStore.transactions.executeCallbacks(callbacks);
    } catch(e) {
      console.log(e);
    }
  }

  // Blockchain filters
  setFiltersTub = () => {
    if (!blockchain.getProviderUseLogs()) return;
    const cupSignatures = [
      "lock(bytes32,uint256)",
      "free(bytes32,uint256)",
      "draw(bytes32,uint256)",
      "wipe(bytes32,uint256)",
      "bite(bytes32)",
      "shut(bytes32)",
      "give(bytes32,address)",
    ].map(v => methodSig(v));

    blockchain.objects.tub.LogNote({}, {fromBlock: "latest"}, (e, r) => {
      if (!e) {
        this.rootStore.transactions.logTransactionConfirmed(r.transactionHash);
        if (cupSignatures.indexOf(r.args.sig) !== -1 && typeof this.tub.cups[r.args.foo] !== "undefined") {
          this.reloadCupData(parseInt(r.args.foo, 16));
        } else if (r.args.sig === methodSig("mold(bytes32,uint256)")) {
          const ray = ["axe", "mat", "tax", "fee"].indexOf(toAscii(r.args.foo).substring(0,3)) !== -1;
          const callback = ["mat"].indexOf(toAscii(r.args.foo).substring(0,3)) !== -1 ? this.calculateSafetyAndDeficit: () => {};
          this.setParameterFromTub(toAscii(r.args.foo).substring(0,3), ray, callback);
        } else if (r.args.sig === methodSig("cage(uint256,uint256)")) {
          this.setParameterFromTub("off");
          this.setParameterFromTub("fit");
          this.setParameterFromTap("fix", true);
        } else if (r.args.sig === methodSig("flow()")) {
          this.setParameterFromTub("out");
        }
        if (r.args.sig === methodSig("drip()") ||
            r.args.sig === methodSig("chi()") ||
            r.args.sig === methodSig("rhi()") ||
            r.args.sig === methodSig("draw(bytes32,uint256)") ||
            r.args.sig === methodSig("wipe(bytes32,uint256)") ||
            r.args.sig === methodSig("shut(bytes32)") ||
            (r.args.sig === methodSig("mold(bytes32,uint256)") && toAscii(r.args.foo).substring(0,3) === "tax")) {
          this.setParameterFromTub("chi", true);
          this.setParameterFromTub("rhi", true);
          this.setEraRho();
        }
      }
    });
  }

  setFiltersTap = () => {
    if (!blockchain.getProviderUseLogs()) return;
    blockchain.objects.tap.LogNote({}, {fromBlock: "latest"}, (e, r) => {
      if (!e) {
        this.rootStore.transactions.logTransactionConfirmed(r.transactionHash);
        if (r.args.sig === methodSig("mold(bytes32,uint256)")) {
          this.setParameterFromTap("gap", false);
        }
      }
    });
  }

  setFiltersVox = () => {
    if (!blockchain.getProviderUseLogs()) return;
    blockchain.objects.vox.LogNote({}, {fromBlock: "latest"}, (e, r) => {
      if (!e) {
        this.rootStore.transactions.logTransactionConfirmed(r.transactionHash);
        if (r.args.sig === methodSig("mold(bytes32,uint256)")) {
          this.setParameterFromVox("way", true);
        }
      }
    });
  }

  setFilterFeedValue = obj => {
    blockchain.objects.tub[obj].call((e, r) => {
      if (!e) {
        this[obj].address = r;
        blockchain.loadObject("dsvalue", r, obj);
        this.setValFromFeed(obj);

        if (blockchain.getProviderUseLogs()){
          blockchain.objects[obj].LogNote({}, {fromBlock: "latest"}, (e, r) => {
            if (!e) {
              if (
                r.args.sig === methodSig("poke(bytes32)") ||
                r.args.sig === methodSig("poke()")
              ) {
                this.setValFromFeed(obj);
                if (obj === "pip") {
                  this.setParameterFromTub("tag", true, this.calculateSafetyAndDeficit);
                }
              }
            }
          });
        }
      }
    })
  }

  setFilterToken = token => {
    if (!blockchain.getProviderUseLogs()) return;
    const filters = ["Transfer", "Approval"];

    if (token === "gem") {
      filters.push("Deposit");
      filters.push("Withdrawal");
    } else {
      filters.push("Mint");
      filters.push("Burn");
    }

    for (let i = 0; i < filters.length; i++) {
      const conditions = {};
      if (blockchain.objects[token][filters[i]]) {
        blockchain.objects[token][filters[i]](conditions, {fromBlock: "latest"}, (e, r) => {
          if (!e) {
            this.rootStore.transactions.logTransactionConfirmed(r.transactionHash);
            this.setTokenDataFromChain(token);
          }
        });
      }
    }
  }

  // Blockchain actions
  changeAllowance = (token, value, callbacks = []) => {
    const title = `${token.replace("gem", "weth").replace("gov", "mkr").replace("skr", "peth").toUpperCase()}: ${value ? "unlock" : "lock"}`;
    this.rootStore.transactions.askPriceAndSend(title, blockchain.objects[token].approve, [this.rootStore.profile.proxy, value ? -1 : 0], {value: 0}, callbacks);
  }

  checkAllowance = (token, callbacks) => {
    blockchain.allowance(token, this.rootStore.network.defaultAccount, this.rootStore.profile.proxy).then(r => {
      if (r.equals(BIGGESTUINT256)) {
        this.rootStore.transactions.executeCallbacks(callbacks);
      } else {
        this.changeAllowance(token, true, callbacks);
      }
    }, () => {});
  }

  checkProxyAndSetAllowance = (token, value) => {
    this.rootStore.transactions.addLoading("changeAllowance", token);
    this.rootStore.profile.checkProxy([["system/changeAllowance", token, value, [["system/setAllowanceFromChain", token, [["transactions/cleanLoading", "changeAllowance", token]]]]]]);
  }

  transferToken = (token, to, amount) => {
    const title = `${token.replace("gov", "mkr").toUpperCase()}: transfer ${to} ${amount}`;
    if (token === "eth") {
      this.rootStore.transactions.askPriceAndSend(title, blockchain.sendTransaction, [], {to, value: toWei(amount)}, [["system/setUpTokenFromChain", token]]);
    } else {
      this.rootStore.transactions.askPriceAndSend(title, blockchain.objects[token].transfer, [to, toWei(amount)], {value: 0}, [["system/setUpTokenFromChain", token]]);
    }
  }

  migrateCDP = async (cup, callbacks) => {
    // We double check user has a proxy and owns it (transferring a CDP is a very risky action)
    const proxy = this.rootStore.profile.proxy;
    if (proxy && isAddress(proxy) && await blockchain.getProxyOwner(proxy) === this.rootStore.network.defaultAccount) {
      const title = `Migrate CDP ${cup}`;
      this.rootStore.transactions.askPriceAndSend(title, blockchain.objects.tub.give, [toBytes32(cup), proxy], {value: 0}, callbacks);
    }
  }

  executeProxyTx = (action, value, notificator) => {
    this.rootStore.transactions.askPriceAndSend(notificator.title, blockchain.objects.proxy.execute["address,bytes"], [settings.chain[this.rootStore.network.network].proxyContracts.sai, action], {value}, notificator.callbacks);
  }

  open = () => {
    const title = "Open CDP";
    const action = `${methodSig(`open(address)`)}${addressToBytes32(this.tub.address, false)}`;
    this.executeProxyTx(action, 0, {title, callbacks: [["system/setMyCupsFromChain"]]});
  }

  shut = (cupId, useOTC = false) => {
    const title = `Shut CDP ${cupId}`;
    const action = `${methodSig(`shut(address,bytes32${useOTC ? ",address" : ""})`)}${addressToBytes32(this.tub.address, false)}${toBytes32(cupId, false)}${useOTC ? addressToBytes32(settings.chain[this.rootStore.network.network].otc, false) : ""}`;
    this.executeProxyTx(action, 0, {title, callbacks: [["system/setMyCupsFromChain"], ["profile/setEthBalanceFromChain"], ["system/setUpTokenFromChain", "dai"], ["system/setUpTokenFromChain", "sin"]]});
  }

  give = (cupId, newOwner) => {
    const title = `Transfer CDP ${cupId} to ${newOwner}`;
    const action = `${methodSig(`give(address,bytes32,address)`)}${addressToBytes32(this.tub.address, false)}${toBytes32(cupId, false)}${addressToBytes32(newOwner, false)}`;
    this.executeProxyTx(action, 0, {title, callbacks: [["system/setMyCupsFromChain"]]});
  }

  lockAndDraw = (cupId, eth, dai) => {
    let action = false;
    let title = "";
    let callbacks = [];

    if (eth.gt(0) || dai.gt(0)) {
      if (!cupId) {
        callbacks = [
          ["system/setMyCupsFromChain", true], ["profile/setEthBalanceFromChain"], ["system/setUpTokenFromChain", "dai"], ["system/setUpTokenFromChain", "sin"]
        ];

        if (this.rootStore.profile.proxy) {
          title = `Create CDP + Lock ${eth.valueOf()} ETH + Draw ${dai.valueOf()} DAI`;
          action = `${methodSig(`lockAndDraw(address,uint256)`)}${addressToBytes32(this.tub.address, false)}${toBytes32(toWei(dai), false)}`;
        } else {
          title = `Create Proxy + Create CDP + Lock ${eth.valueOf()} ETH + Draw ${dai.valueOf()} DAI`;
          this.rootStore.transactions.askPriceAndSend(
                                            title,
                                            blockchain.loadObject("proxycreationandexecute", settings.chain[this.rootStore.network.network].proxyCreationAndExecute).createLockAndDraw,
                                            [settings.chain[this.rootStore.network.network].proxyRegistry, this.tub.address, toWei(dai)],
                                            {value: toWei(eth)},
                                            [["profile/setProxyFromChain", callbacks]]
                                            );
          return;
        }
      } else {
        callbacks = [
          ["system/reloadCupData", cupId], ["profile/setEthBalanceFromChain"], ["system/setUpTokenFromChain", "dai"], ["system/setUpTokenFromChain", "sin"]
        ];
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
                                                callbacks
                                              });
    }
  }

  wipeAndFree = (cupId, eth, dai, useOTC = false) => {
    let action = false;
    let title = "";
    if (eth.gt(0) || dai.gt(0)) {
      if (dai.equals(0)) {
        title = `Withdraw ${eth.valueOf()} ETH`;
        action = `${methodSig(`free(address,bytes32,uint256)`)}${addressToBytes32(this.tub.address, false)}${toBytes32(cupId, false)}${toBytes32(toWei(eth), false)}`;
      } else if (eth.equals(0)) {
        title = `Wipe ${dai.valueOf()} DAI`;
        action = `${methodSig(`wipe(address,bytes32,uint256${useOTC ? ",address" : ""})`)}${addressToBytes32(this.tub.address, false)}${toBytes32(cupId, false)}${toBytes32(toWei(dai), false)}${useOTC ? addressToBytes32(settings.chain[this.rootStore.network.network].otc, false) : ""}`;
      } else {
        title = `Wipe ${dai.valueOf()} DAI + Withdraw ${eth.valueOf()} ETH`;
        action = `${methodSig(`wipeAndFree(address,bytes32,uint256,uint256${useOTC ? ",address" : ""})`)}${addressToBytes32(this.tub.address, false)}${toBytes32(cupId, false)}${toBytes32(toWei(eth), false)}${toBytes32(toWei(dai), false)}${useOTC ? addressToBytes32(settings.chain[this.rootStore.network.network].otc, false) : ""}`;
      }
        this.executeProxyTx(action, 0, {
                                        title,
                                        callbacks:  [
                                                      ["system/reloadCupData", cupId], ["profile/setEthBalanceFromChain"], ["system/setUpTokenFromChain", "dai"], ["system/setUpTokenFromChain", "sin"]
                                                    ]
                                      });
    }
  }

  executeAction = params => {
    const value = params.value;
    let callbacks = [];
    let error = false;
    switch (this.rootStore.dialog.method) {
      case "open":
        callbacks = [
                      ["system/open"]
                    ];
        break;
      case "lock":
        callbacks = [
                      ["system/lockAndDraw", this.rootStore.dialog.cupId, value, toBigNumber(0)]
                    ];
        break;
      case "draw":
        callbacks = [
                      ["system/lockAndDraw", this.rootStore.dialog.cupId, toBigNumber(0), value]
                    ];
        break;
      case "wipe":
        callbacks = [
                      ["system/checkAllowance", "dai",
                        [
                          ["system/wipeAndFree", this.rootStore.dialog.cupId, toBigNumber(0), value, params.govFeeType === "dai"]
                        ]
                      ]
                    ];
        if (params.govFeeType === "mkr") {
          // If fee will be paid with MKR it is necessary to check its allowance
          callbacks = [
                        ["system/checkAllowance", "gov",
                          callbacks
                        ]
                      ];
        }
        break;
      case "free":
        callbacks = [
                      ["system/wipeAndFree", this.rootStore.dialog.cupId, value, toBigNumber(0)]
                    ];
        break;
      case "shut":
        callbacks = [
          ["system/shut", this.rootStore.dialog.cupId, this.tub.cups[this.rootStore.dialog.cupId].art.gt(0) && params.govFeeType === "dai"]
        ];
        if (this.tub.cups[this.rootStore.dialog.cupId].art.gt(0)) {
          const futureGovDebtSai = this.futureRap(this.tub.cups[this.rootStore.dialog.cupId], 1200);
          const futureGovDebtMKR = wdiv(
                                      futureGovDebtSai,
                                      this.pep.val
                                    ).round(0);
          const valuePlusGovFee = params.govFeeType === "dai" ? this.tab(this.tub.cups[this.rootStore.dialog.cupId]).add(futureGovDebtSai.times(1.25)) : this.tab(this.tub.cups[this.rootStore.dialog.cupId]); // If fee is paid in DAI we add an extra 25% (spread)
          if (valuePlusGovFee.gt(this.dai.myBalance)) {
            error = "Not enough DAI to close this CDP";
          } else if (params.govFeeType === "mkr" && futureGovDebtMKR.gt(this.gov.myBalance)) {
            error = "Not enough MKR to close this CDP";
          }
          callbacks = [
                        ["system/checkAllowance", "dai", callbacks]
                      ];
          if (params.govFeeType === "mkr") {
            // If fee will be paid with MKR it is necessary to check its allowance
            callbacks = [
                          ["system/checkAllowance", "gov", callbacks]
                        ];
          }
        }
        break;
      case "give":
        callbacks = [["system/give", this.rootStore.dialog.cupId, params.value]];
        if (!isAddress(params.value) || params.value.slice(0, 2) !== "0x") {
          error = "Invalid address";
        }
        break;
      case "migrate":
        this.rootStore.transactions.addLoading("migrate", this.rootStore.dialog.cupId);
        callbacks = [
                      ["system/migrateCDP", this.rootStore.dialog.cupId, [["system/moveLegacyCDP", this.rootStore.dialog.cupId, [["transactions/cleanLoading", "migrate", this.rootStore.dialog.cupId]]]]]
                    ];
        break;
      default:
        break;
    }

    if (error) {
      this.rootStore.dialog.setError(error);
    } else {
      this.rootStore.dialog.reset();
      this.rootStore.profile.checkProxy(callbacks);
    }
  }
}
