import * as Blockchain from "../blockchainHandler";
import { toBigNumber, isAddress, toBytes32, addressToBytes32, toWei, fromWei, methodSig, wmul, wdiv } from '../helpers';
const settings = require('../settings');

export function getMyCups() {
  if (this.state.profile.proxy) {
    this.setState(prevState => {
      const system = {...prevState.system};
      const tub = {...system.tub};
      tub.cupsLoading = true;
      system.tub = tub;
      return {system};
    }, () => this.getCups('new'));
  }
}

export function getMyLegacyCups() {
  this.getCups('legacy');
}

export function getFromService(service, conditions = {}, sort = {}, limit = null) {
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

export function getCups(type) {
  const lad = type === 'new' ? this.state.profile.proxy : this.state.network.defaultAccount;
  const me = this;
  if (settings.chain[this.state.network.network].service) {
    Promise.resolve(this.getFromService('cups', {lad}, {cupi: 'asc'})).then(response => {
      const promises = [];
      response.results.forEach(v => {
        promises.push(me.getCup(v.cupi));
      });
      me.getCupsFromChain(type, response.lastBlockNumber, promises);
    }).catch(error => {
      me.getCupsFromChain(type, settings.chain[this.state.network.network].fromBlock);
    });
  } else {
    this.getCupsFromChain(type, settings.chain[this.state.network.network].fromBlock);
  }
}

export function getCupsFromChain(type, fromBlock, promises = []) {
  const lad = type === 'new' ? this.state.profile.proxy : this.state.network.defaultAccount;
  const conditions = {lad};
  const promisesLogs = [];
  promisesLogs.push(
    new Promise((resolve, reject) => {
      Blockchain.objects.tub.LogNewCup(conditions, {fromBlock}).get((e, r) => {
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
  promisesLogs.push(
    new Promise((resolve, reject) => {
      Blockchain.objects.tub.LogNote({sig: methodSig('give(bytes32,address)'), bar: toBytes32(conditions.lad)}, {fromBlock}).get((e, r) => {
        if (!e) {
          for (let i = 0; i < r.length; i++) {
            promises.push(this.getCup(parseInt(r[i].args.foo, 16)));
          }
          resolve();
        } else {
          reject(e);
        }
      });
    })
  );
  Promise.all(promisesLogs).then(r => {
    conditions.closed = false;
    if (type === 'legacy' || this.state.system.tub.cupsLoading) {
      Promise.all(promises).then(cups => {
        const cupsFiltered = {};
        for (let i = 0; i < cups.length; i++) {
          if (conditions.lad === cups[i].lad) {
              cupsFiltered[cups[i].id] = cups[i];
          }
        }
        const keys = Object.keys(cupsFiltered).sort((a, b) => a - b);
        if (type === 'new') {
          if (this.state.system.tub.cupsLoading) {
            this.setState((prevState, props) => {
              const system = {...prevState.system};
              const tub = {...system.tub};
              tub.cupsLoading = false;
              tub.cups = cupsFiltered;
              system.tub = tub;
              return {system};
            }, () => {
              if (keys.length > 0 && settings.chain[this.state.network.network].service) {
                keys.forEach(key => {
                  Promise.resolve(this.getFromService('cupHistoryActions', {cupi: key}, {timestamp:'asc'})).then(response => {
                    this.setState((prevState, props) => {
                      const system = {...prevState.system};
                      const tub = {...system.tub};
                      const cups = {...tub.cups};
                      cups[key].history = response.results
                      tub.cups = cups;
                      system.tub = tub;
                      return {system};
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
        } else if (type === 'legacy') {
          this.setState((prevState, props) => {
            const system = {...prevState.system};
            const tub = {...system.tub};
            tub.legacyCups = cupsFiltered;
            system.tub = tub;
            return {system};
          });
        }
      });
    }
  });
}

export function getCup(id) {
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

export function calculateCupData(cup) {
  cup.pro = wmul(cup.ink, this.state.system.tub.tag).round(0);
  cup.ratio = cup.pro.div(wmul(this.tab(cup), this.state.system.vox.par));
  // This is to give a window margin to get the maximum value (as 'chi' is dynamic value per second)
  const marginTax = fromWei(this.state.system.tub.tax).pow(120);
  cup.avail_dai = wdiv(cup.pro, wmul(this.state.system.tub.mat, this.state.system.vox.par)).minus(this.tab(cup)).round(0).minus(1); // "minus(1)" to avoid rounding issues when dividing by mat (in the contract uses it mulvoxlying on safe function)
  cup.avail_dai_with_margin = wdiv(cup.pro, wmul(this.state.system.tub.mat, this.state.system.vox.par)).minus(this.tab(cup).times(marginTax)).round(0).minus(1);
  cup.avail_dai_with_margin = cup.avail_dai_with_margin.lt(0) ? toBigNumber(0) : cup.avail_dai_with_margin;
  cup.avail_skr = cup.ink.minus(wdiv(wmul(wmul(this.tab(cup), this.state.system.tub.mat), this.state.system.vox.par), this.state.system.tub.tag)).round(0);
  cup.avail_skr_with_margin = cup.ink.minus(wdiv(wmul(wmul(this.tab(cup).times(marginTax), this.state.system.tub.mat), this.state.system.vox.par), this.state.system.tub.tag)).round(0);
  cup.avail_skr_with_margin = cup.avail_skr_with_margin.lt(0) ? toBigNumber(0) : cup.avail_skr_with_margin;
  cup.liq_price = cup.ink.gt(0) && cup.art.gt(0) ? wdiv(wdiv(wmul(this.tab(cup), this.state.system.tub.mat), this.state.system.tub.per), cup.ink) : toBigNumber(0);
  return cup;
}

export function addExtraCupData(cup) {
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

export function reloadCupData(id) {
  Promise.resolve(this.getCup(id).then(cup => {
    this.setState((prevState, props) => {
      const system = {...prevState.system};
      const tub = {...system.tub};
      const cups = {...tub.cups};
      cups[id] = {...cup};
      tub.cups = cups;
      system.tub = tub;
      return {system};
    }, () => {
      if (settings.chain[this.state.network.network].service) {
        Promise.resolve(this.getFromService('cupHistoryActions', {cupi: id}, {timestamp:'asc'})).then(response => {
          this.setState((prevState, props) => {
            const system = {...prevState.system};
            const tub = {...system.tub};
            const cups = {...tub.cups};
            cups[id].history = response.results
            tub.cups = cups;
            system.tub = tub;
            return {system};
          });
        }).catch(error => {
          // this.setState({});
        });
      }
    });
  }));
}

export function tab(cup) {
  return wmul(cup.art, this.state.system.tub.chi).round(0);
}

export function rap(cup) {
  return wmul(cup.ire, this.state.system.tub.rhi).minus(this.tab(cup)).round(0);
}

export function changeCup(e) {
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
    return {system};
  }, () => {
    this.calculateCupChart();
  });
}

export function saiProxyAddr() {
  return settings.chain[this.state.network.network].proxyContracts.sai
}

export function open() {
  const id = Math.random();
  const title = 'Open CDP';
  this.logRequestTransaction(id, title);
  Blockchain.objects.proxy.execute['address,bytes'](
    this.saiProxyAddr(),
    `${methodSig(`open()`)}`,
    (e, tx) => this.log(e, tx, id, title, [['getMyCups']])
  );  
}

export function shut(cup) {
  const id = Math.random();
  const title = `Shut CDP ${cup}`;
  this.logRequestTransaction(id, title);
  Blockchain.objects.proxy.execute['address,bytes'](
    this.saiProxyAddr(),
    `${methodSig(`shut(bytes32)`)}${toBytes32(cup, false)}`,
    (e, tx) => this.log(e, tx, id, title, [['getMyCups'], ['getAccountBalance'], ['setUpToken', 'sai'], ['setUpToken', 'sin']])
  );
}

export function give(cup, newOwner) {
  const id = Math.random();
  const title = `Transfer CDP ${cup} to ${newOwner}`;
  this.logRequestTransaction(id, title);
  Blockchain.objects.proxy.execute['address,bytes'](
    this.saiProxyAddr(),
    `${methodSig(`give(bytes32, address)`)}${toBytes32(cup, false)}${addressToBytes32(newOwner, false)}`,
    (e, tx) => this.log(e, tx, id, title, [['getMyCups']])
  );
}

export function lockAndDraw(cup, eth, dai) {
  let action = false;
  let title = '';

  if (eth.gt(0) || dai.gt(0)) {
    if (!cup) {
      title = `Lock ${eth.valueOf()} ETH + Draw ${dai.valueOf()} DAI`;
      action = `${methodSig(`lockAndDraw(address,uint256)`)}${addressToBytes32(this.state.system.tub.address, false)}${toBytes32(toWei(dai), false)}`;
    } else {
      if (dai.equals(0)) {
        title = `Lock ${eth.valueOf()} ETH`;
        action = `${methodSig(`lock(address,bytes32)`)}${addressToBytes32(this.state.system.tub.address, false)}${toBytes32(cup, false)}`;
      } else if (eth.equals(0)) {
        title = `Draw ${dai.valueOf()} DAI`;
        action = `${methodSig(`draw(address,bytes32,uint256)`)}${addressToBytes32(this.state.system.tub.address, false)}${toBytes32(cup, false)}${toBytes32(toWei(dai), false)}`;
      } else {
        title = `Lock ${eth.valueOf()} ETH + Draw ${dai.valueOf()} DAI`;
        action = `${methodSig(`lockAndDraw(address,bytes32,uint256)`)}${addressToBytes32(this.state.system.tub.address, false)}${toBytes32(cup, false)}${toBytes32(toWei(dai), false)}`;
      }
    }

    const id = Math.random();
    this.logRequestTransaction(id, title);
    Blockchain.objects.proxy.execute['address,bytes'](
      this.saiProxyAddr(),
      action,
      {value: toWei(eth)},
      (e, tx) => this.log(e, tx, id, title, cup ? [['reloadCupData', cup], ['getAccountBalance'], ['setUpToken', 'sai'], ['setUpToken', 'sin']] : [['getMyCups'], ['getAccountBalance'], ['setUpToken', 'sai'], ['setUpToken', 'sin']])
    );
  }
}

export function wipeAndFree(cup, eth, dai) {
  let action = false;
  let title = '';
  if (eth.gt(0) || dai.gt(0)) {
    if (dai.equals(0)) {
      title = `Withdraw ${eth.valueOf()} ETH`;
      action = `${methodSig(`free(address,bytes32,uint256)`)}${addressToBytes32(this.state.system.tub.address, false)}${toBytes32(cup, false)}${toBytes32(toWei(eth), false)}`;
    } else if (eth.equals(0)) {
      title = `Wipe ${dai.valueOf()} DAI`;
      action = `${methodSig(`wipe(address,bytes32,uint256)`)}${addressToBytes32(this.state.system.tub.address, false)}${toBytes32(cup, false)}${toBytes32(toWei(dai), false)}`;
    } else {
      title = `Wipe ${dai.valueOf()} DAI + Withdraw ${eth.valueOf()} ETH`;
      action = `${methodSig(`wipeAndFree(address,bytes32,uint256,uint256)`)}${addressToBytes32(this.state.system.tub.address, false)}${toBytes32(cup, false)}${toBytes32(toWei(eth), false)}${toBytes32(toWei(dai), false)}`;
    }
    const id = Math.random();
    this.logRequestTransaction(id, title);
    Blockchain.objects.proxy.execute['address,bytes'](
      this.saiProxyAddr(),
      action,
      (e, tx) => this.log(e, tx, id, title, [['reloadCupData', cup], ['getAccountBalance'], ['setUpToken', 'sai'], ['setUpToken', 'sin']])
    );
  }
}

export async function migrateCDP(cup) {
  // We double check user has a proxy and owns it (transferring a CDP is a very risky action)
  const proxy = this.state.profile.proxy;
  if (proxy && isAddress(proxy) && await Blockchain.getProxyOwner(proxy) === this.state.network.defaultAccount) {
    const id = Math.random();
    const title = `Migrate CDP ${cup}`;
    this.logRequestTransaction(id, title);
    Blockchain.objects.tub.give(toBytes32(cup), proxy, (e, tx) => this.log(e, tx, id, title, [['getMyCups'], ['getMyLegacyCups']]));
  }
}

export function executeAction(value) {
  let callbacks = [];
  let error = false;
  switch (this.state.dialog.method) {
    case 'open':
      callbacks = [
                    ['open']
                  ];
      break;
    case 'lock':
      callbacks = [
                    ['lockAndDraw', this.state.dialog.cup, value, toBigNumber(0)]
                  ];
      break;
    case 'draw':
      callbacks = [
                    ['lockAndDraw', this.state.dialog.cup, toBigNumber(0), value]
                  ];
      break;
    case 'wipe':
      callbacks = [
                    ['checkAllowance', 'gov',
                      [
                        ['checkAllowance', 'dai',
                          [
                            ['wipeAndFree', this.state.dialog.cup, toBigNumber(0), value]
                          ]
                        ]
                      ]
                    ]
                  ];
      break;
    case 'free':
      callbacks = [
                    ['wipeAndFree', this.state.dialog.cup, value, toBigNumber(0)]
                  ];
      break;
    case 'shut':
      callbacks = [
                    ['checkAllowance', 'gov',
                      [
                        ['checkAllowance', 'dai',
                          [
                            ['shut', this.state.dialog.cup]
                          ]
                        ]
                      ]
                    ]
                  ];
      break;
    case 'migrate':
      callbacks = [
                    ['migrateCDP', this.state.dialog.cup]
                  ];
      break;
    default:
      break;
  }

  if (error) {
    const dialog = {...this.state.dialog}
    dialog.error = error;
    this.setState({dialog});
  } else {
    this.setState({dialog: {show: false}}, () => {
      this.checkProxy(callbacks);
    });
  }
}