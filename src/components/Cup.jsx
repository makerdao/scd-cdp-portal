import React from 'react';
import web3 from '../web3';
import CupHistory from './CupHistory';
import { printNumber } from '../helpers';

const Cup = (props) => {
  const cupId = props.system.tub.cupId ? props.system.tub.cupId : Object.keys(props.system.tub.cups)[0];
  const cup = props.system.tub.cups[cupId];

  const actions = {
    lock: {
            active: props.system.tub.off === false && props.system.skr.myBalance && props.system.skr.myBalance.gt(0),
            helper: 'Add collateral to a CDP'
          },
    free: {
            active: props.system.pip.val.gt(0) && cup.ink.gt(0) && cup.safe && (props.system.tub.off === false || cup.art.eq(0)),
            helper: 'Remove collateral from a CDP'
          },
    draw: {
            active: props.system.pip.val.gt(0) && props.system.tub.off === false && cup.ink.gt(0) && cup.safe,
            helper: 'Create Dai against a CDP'
          },
    wipe: {
            active: props.system.tub.off === false && cup.art.gt(0),
            helper: 'Use Dai to cancel CDP debt'
          },
    shut: {
            active: props.system.pip.val.gt(0) && props.system.tub.off === false,
            helper: 'Close a CDP - Wipe all debt, Free all collateral, and delete the CDP'
          },
    give: {
            active: props.system.pip.val.gt(0) && props.system.tub.off === false,
            helper: 'Transfer CDP ownership'
          },
  };

  return (
    <div>
      <div className="row">
        <div className="col col-2">
          <h3 className="typo-c inline-headline">Collateralization</h3>
          <div className="value typo-cl right">
            {
              props.system.tub.off === false
              ? 
                cup.art.gt(web3.toBigNumber(0)) && cup.pro
                  ?
                    <span>
                      { printNumber(web3.toWei(cup.ratio).times(100)) }<span className="unit">%</span>
                    </span>
                  :
                    '-'
                :
                  '-'
            }
          </div>
        </div>
        <div className="col col-2">
          <h3 className="typo-c inline-headline">Liquidation price</h3>
          <div className="value typo-cl right">
            {
              props.system.tub.off === false && cup.liq_price && cup.liq_price.gt(0)
              ?
                <span>{ printNumber(cup.liq_price) }<span className="unit">&#36;</span></span>
              :
                '-'
            }
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col col-2">
          <h3 className="typo-cl inline-headline">Collateral</h3>
          <div className="inner-row">
            <h4 className="typo-c inline-headline">Locked</h4>
            <div className="right">
              <span className="value typo-cl">{ printNumber(cup.ink) }<span className="unit">PETH</span></span>
              <button className="text-btn disable-on-dialog" disabled={ !actions.lock.active } data-method="lock" data-cup={ cupId } onClick={ props.handleOpenDialog }>Lock</button>
            </div>	
          </div>
          <div className="inner-row">
            <h4 className="typo-c inline-headline">Available</h4>
            <div className="right">
              <span className="value typo-cl">
                {
                  props.system.tub.off === false
                  ?
                    <span>{ printNumber(cup.avail_skr) }<span className="unit">PETH</span></span>
                  :
                    '-'
                }
              </span>
              <button className="text-btn disable-on-dialog" disabled={ !actions.free.active } data-method="free" data-cup={ cupId } onClick={ props.handleOpenDialog }>Free</button>
            </div>	
          </div>
        </div>
        <div className="col col-2">
          <h3 className="typo-cl inline-headline">Loan</h3>
          <div className="inner-row">
            <h4 className="typo-c inline-headline">Debt</h4>
            <div className="right">
              <span className="value typo-cl">{ printNumber(props.tab(cup)) }<span className="unit">DAI</span></span>
              <button className="text-btn disable-on-dialog" disabled={ !actions.draw.active } data-method="draw" data-cup={ cupId } onClick={ props.handleOpenDialog }>Draw</button>
            </div>	
          </div>
          <div className="inner-row">
            <h4 className="typo-c inline-headline">Available</h4>
            <div className="right">
              <span className="value typo-cl">
                {
                  props.system.tub.off === false
                  ?
                    <span>{ printNumber(cup.avail_dai) }<span className="unit">DAI</span></span>
                  :
                    '-'
                }
              </span>
              <button className="text-btn disable-on-dialog" disabled={ !actions.wipe.active } data-method="wipe" data-cup={ cupId } onClick={ props.handleOpenDialog }>Wipe</button>
            </div>
          </div>
        </div>
      </div>
      <CupHistory actions={ cup.history }/>
      {/* <div className="row row-no-border">
        <div className="col">
          <div>
            <div className="button-switch disable-on-dialog">
              <button id="graph-view-days" className="disable-on-dialog active">Days</button>
              <button id="graph-view-hours" className="disable-on-dialog">Hours</button>
            </div>
            <ul className="legend typo-cs right">
              <li>
                <span className="dot dot-white"></span>
                <span>Collateral</span>
              </li>
              <li>
                <span className="dot dot-reddots"></span>
                <span>High risk</span>
              </li>
              <li>
                <span className="dot dot-red"></span>
                <span>Liquidation price</span>
              </li>
              <li>
                <span className="dot dot-blue"></span>
                <span>Loan</span>
              </li>
            </ul>
          </div>
          <div id="chart"></div>
        </div>
      </div> */}
    </div>
  )
}

export default Cup;
