// Libraries
import React from "react";
import Promise from "bluebird";

// Utils
import * as blockchain from "./blockchain";
import {fromWei, wmul, wdiv, toChecksumAddress, toBytes32, formatDate, printNumber, toWei} from "./helpers";

import * as settings from "../settings";

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

export const getCup = id => {
  console.debug(`getCup: ${id}`)
  return new Promise((resolve, reject) => {
    blockchain.objects.saiValuesAggregator.aggregateCDPValues(toBytes32(id), (e, cup) => {
      if (!e) {
        const cupData = {
          id: parseInt(id, 10),
          lad: cup[1],
          safe: cup[2],
          ink: cup[3][0],
          art: cup[3][1],
          ire: cup[3][2],
          ratio: fromWei(cup[3][3]),
          avail_dai: cup[3][4],
          avail_skr: cup[3][5],
          avail_eth: cup[3][6],
          liq_price: cup[3][7]
        };
        resolve({block: cup[0].toNumber(), cupData});
      } else {
        reject(e);
      }
    });
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
              <div className="grouped-section">
                Your CDP #{cupId} was liquidated on { date } to pay back { printNumber(art) } DAI.
              </div>
              <div className="grouped-section">
                <div className="dark-text">Total ETH (PETH) liquidated</div>
                <div style={ {fontSize: "1.3rem", fontWeight: "600" } }>{ printNumber(liqETH) } ETH</div>
                <div className="dark-text">{ printNumber(liqInk) } PETH</div>
              </div>
              <div className="indented-section">
                <div className="line-indent"></div>
                <div className="grouped-section">
                  <div className="dark-text">Collateral</div>
                  <div style={ {fontSize: "1.1rem", fontWeight: "600" } }>{ printNumber(liqETHCol) } ETH</div>
                  <div className="dark-text">{ printNumber(liqInkCol) } PETH</div>
                </div>
                <div className="grouped-section">
                  <div className="dark-text">13% liquidation penalty</div>
                  <div style={ {fontSize: "1.1rem", fontWeight: "600" } }>{printNumber(liqETHPen)} ETH</div>
                  <div className="dark-text">{printNumber(liqInkPen)} PETH</div>
                </div>
              </div>
              <div className="grouped-section">
                <div className="dark-text">Became vulnerable to liquidation @ price</div>
                <div style={ {fontSize: "1.3rem", fontWeight: "600" } }>{ printNumber(liqPrice)} USD</div>
                <div className="dark-text">Liquidated @ price</div>
                <div style={ {fontSize: "1.3rem", fontWeight: "600" } }>{ printNumber(pip) } USD</div>
              </div>
            </React.Fragment>;
  }
  return null;
}

export const futureRap = (cup, age, chi, rhi, tax, fee) => {
  return  wmul(
            wmul(
              cup.ire,
              rhi
            ),
            toWei(
              fromWei(
                wmul(
                  tax,
                  fee
                )
              ).pow(age)
            )
          ).minus(
            wmul(
              wmul(
                cup.art,
                chi
              ),
              toWei(
                fromWei(
                  tax
                ).pow(age)
              )
            )
          ).round(0);
}

export const getContracts = (proxyRegistry, address) => {
  return new Promise((resolve, reject) => {
    blockchain.objects.saiValuesAggregator.getContractsAddrs(proxyRegistry, address, (e, r) => {
      if (!e) {
        resolve(r);
      } else {
        reject(e);
      }
    });
  });
}

export const getAggregatedValues = (account, proxy) => {
  return new Promise((resolve, reject) => {
    blockchain.objects.saiValuesAggregator.aggregateValues.call(account, proxy, { from: "0x0000000000000000000000000000000000000000" }, (e, r) => {
      if (!e) {
        resolve(r);
      } else {
        reject(e);
      }
    });
  });
}
