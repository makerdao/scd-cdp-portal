// Libraries
import React from "react";
import Promise from "bluebird";

// Utils
import * as blockchain from "./blockchain";
import {toBigNumber, fromWei, fromRaytoWad, wmul, wdiv, toChecksumAddress, toBytes32, methodSig, formatDate, printNumber, toWei} from "./helpers";

import * as settings from "../settings";

export const calculateSafetyAndDeficit = (mat, skrTubBalance, tag, sinTotalSupply) => {
  if (mat.gte(0) && skrTubBalance.gte(0) && tag.gte(0) && sinTotalSupply.gte(0)) {
    const pro = wmul(skrTubBalance, tag);
    const con = sinTotalSupply;
    const min = wmul(con, mat);
    return {tub: {eek: pro.lt(con), safe: pro.gte(min)}};
  }
  return {tub: {eek: null, safe: null}};
}

export const calculateLiquidationPrice = (par, per, mat, skr, dai) => {
  return wdiv(wmul(wmul(dai, par), mat), wmul(skr, per));
}

export const calculateRatio = (tag, par, skr, dai) => {
  return wdiv(wmul(skr, tag).round(0), wmul(dai, par));
}

export const tab = (cup, chi) => {
  return wmul(cup.art, chi).round(0);
}

export const rap = (cup, rhi) => {
  return wmul(cup.ire, rhi).minus(tab(cup)).round(0);
}

export const getParameterFromTub = (field, ray = false) => {
  return new Promise((resolve, reject) => {
    blockchain.objects.tub[field].call((e, value) => {
      if (!e) {
        resolve(ray ? fromRaytoWad(value) : value);
      } else {
        reject(e);
      }
    });
  });
}

export const getParameterFromTap = (field, ray = false) => {
  const p = new Promise((resolve, reject) => {
    blockchain.objects.tap[field].call((e, value) => {
      if (!e) {
        resolve(ray ? fromRaytoWad(value) : value);
      } else {
        reject(e);
      }
    });
  });
  return p;
}

export const getParameterFromVox = (field, ray = false) => {
  const p = new Promise((resolve, reject) => {
    blockchain.objects.vox[field].call((e, value) => {
      if (!e) {
        resolve(ray ? fromRaytoWad(value) : value);
      } else {
        reject(e);
      }
    });
  });
  return p;
}

export const getValFromFeed = obj => {
  const p = new Promise((resolve, reject) => {
    blockchain.objects[obj].peek.call((e, r) => {
      if (!e) {
        resolve(toBigNumber(r[1] ? parseInt(r[0], 16) : -1));
      } else {
        reject(e);
      }
    });
  });
  return p;
}

export const getCup = (id, par, tag, tax, mat, per, chi) => {
  return new Promise((resolve, reject) => {
    blockchain.objects.tub.cups.call(toBytes32(id), (e, cupData) => {
      if (!e) {
        let cupBaseData = {
          id: parseInt(id, 10),
          lad: cupData[0],
          ink: cupData[1],
          art: cupData[2],
          ire: cupData[3],
        };

        Promise.resolve(addExtraCupData(cupBaseData, par, tag, tax, mat, per, chi)).then(cup => {
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

export const addExtraCupData = (cup, par, tag, tax, mat, per, chi) => {
  cup.pro = wmul(cup.ink, tag).round(0);
  cup.ratio = cup.pro.div(wmul(tab(cup, chi), par));
  // This is to give a window margin to get the maximum value (as "chi" is dynamic value per second)
  const marginTax = fromWei(tax).pow(120);
  cup.avail_dai = wdiv(cup.pro, wmul(mat, par)).minus(tab(cup, chi)).round(0).minus(1); // "minus(1)" to avoid rounding issues when dividing by mat (in the contract uses it mulvoxlying on safe function)
  cup.avail_dai_with_margin = wdiv(cup.pro, wmul(mat, par)).minus(tab(cup, chi).times(marginTax)).round(0).minus(1);
  cup.avail_dai_with_margin = cup.avail_dai_with_margin.lt(0) ? toBigNumber(0) : cup.avail_dai_with_margin;
  cup.avail_skr = cup.ink.minus(wdiv(wmul(wmul(tab(cup, chi), mat), par), tag)).round(0);
  cup.avail_skr_with_margin = cup.ink.minus(wdiv(wmul(wmul(tab(cup, chi).times(marginTax), mat), par), tag)).round(0);
  cup.avail_skr_with_margin = cup.avail_skr_with_margin.lt(0) ? toBigNumber(0) : cup.avail_skr_with_margin;
  cup.liq_price = cup.ink.gt(0) && cup.art.gt(0) ? wdiv(wdiv(wmul(tab(cup, chi), mat), per), cup.ink) : toBigNumber(0);

  return new Promise((resolve, reject) => {
    blockchain.objects.tub.safe["bytes32"].call(toBytes32(cup.id), (e, safe) => {
      if (!e) {
        cup.safe = safe;
        resolve(cup);
      } else {
        reject(e);
      }
    });
  });
}

export const getCupsFromChain = (lad, fromBlock, par, tag, tax, mat, per, chi, promisesCups = []) => {
  if (!blockchain.getProviderUseLogs()) return promisesCups;
  return new Promise((resolve, reject) => {
    const promisesLogs = [];
    promisesLogs.push(
      new Promise((resolve, reject) => {
        blockchain.objects.tub.LogNewCup({lad}, {fromBlock}).get((e, r) => {
          if (!e) {
            for (let i = 0; i < r.length; i++) {
              promisesCups.push(getCup(parseInt(r[i].args.cup, 16), par, tag, tax, mat, per, chi));
            }
            resolve(true);
          } else {
            reject(e);
          }
        });
      })
    );
    promisesLogs.push(
      new Promise((resolve, reject) => {
        blockchain.objects.tub.LogNote({sig: methodSig("give(bytes32,address)"), bar: toBytes32(lad)}, {fromBlock}).get((e, r) => {
          if (!e) {
            for (let i = 0; i < r.length; i++) {
              promisesCups.push(getCup(parseInt(r[i].args.foo, 16), par, tag, tax, mat, per, chi));
            }
            resolve(true);
          } else {
            reject(e);
          }
        });
      })
    );
    Promise.all(promisesLogs).then(() => resolve(promisesCups), e => reject(e));
  });
}

export const getFromService = (network, query) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", settings.chain[network].service, true);
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
}

export const getCupsFromService = (network, lad) => {
  return new Promise((resolve, reject) => {
    getFromService(network, `{ allCups( condition: { lad: "${toChecksumAddress(lad)}" } ) { nodes { id, block } } }`)
    .then(r => resolve(r.data.allCups.nodes), e => reject(e))
  });
}

export const getCupHistoryFromService = (network, cupId) => {
  return new Promise((resolve, reject) => {
    getFromService(network, `{ getCup(id: ${cupId}) { actions { nodes { act arg guy tx time ink art per pip } } } }`)
    .then(r => resolve(r.data.getCup ? r.data.getCup.actions.nodes : null), e => reject(e))
  });
}

export const getBiteNotification = (cupId, history, alreadyClosed) => {
  const latestAction = history[0];
  if (latestAction && latestAction.act === "BITE" && !alreadyClosed) {
    const prevlatestAction = history[1];
    const date = formatDate((new Date(latestAction.time)).getTime() / 1000);
    const art = toWei(prevlatestAction.art);
    const liqPrice =  (art * 1.5 / latestAction.per) / prevlatestAction.ink;
    const liqInk = toWei(prevlatestAction.ink - latestAction.ink);
    const liqETH = liqInk * latestAction.per;
    const liqInkCol = liqInk / 1.13;
    const liqETHCol = liqInkCol * latestAction.per;
    const liqInkPen = liqInk - liqInkCol;
    const liqETHPen = liqInkPen * latestAction.per;
    const pip = toWei(latestAction.pip);
    return <React.Fragment>
              <div>
                Your CDP #{cupId} was liquidated on { date } to pay back { printNumber(art) } DAI.
              </div>
              <div>
                <div className="dark-text">Total ETH (PETH) liquidated</div>
                <div style={ {fontSize: "1.3rem", fontWeight: "600" } }>{ printNumber(liqETH) } ETH</div>
                <div className="dark-text">{ printNumber(liqInk) } PETH</div>
              </div>
              <div className="indented-section">
                <div className="line-indent"></div>
                <div>
                  <div className="dark-text">Collateral</div>
                  <div style={ {fontSize: "1.1rem", fontWeight: "600" } }>{ printNumber(liqETHCol) } ETH</div>
                  <div className="dark-text">{ printNumber(liqInkCol) } PETH</div>
                </div>
                <div>
                  <div className="dark-text">13% liquidation penalty</div>
                  <div style={ {fontSize: "1.1rem", fontWeight: "600" } }>{printNumber(liqETHPen)} ETH</div>
                  <div className="dark-text">{printNumber(liqInkPen)} PETH</div>
                </div>
              </div>
              <div>
                <div className="dark-text">Became vulnerable to liquidation @ price</div>
                <div style={ {fontSize: "1.3rem", fontWeight: "600" } }>{ printNumber(liqPrice)} USD</div>
                <div className="dark-text">Liquidated @ price</div>
                <div style={ {fontSize: "1.3rem", fontWeight: "600" } }>{ printNumber(pip) } USD</div>
              </div>
            </React.Fragment>;
  }
  return null;
}
