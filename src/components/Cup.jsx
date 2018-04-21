import React from 'react';
import {observer} from 'mobx-react';

// import CupChart from './CupChart'
import CupHistory from './CupHistory';
// import {printNumber, toBytes32, wmul, toBigNumber, toWei, methodSig} from '../helpers';
import {WAD, printNumber, wmul, toBigNumber, toWei} from '../helpers';


class Cup extends React.Component {
  actions = {
    lock: {
            active: this.props.system.tub.off === false && this.props.profile.accountBalance && this.props.profile.accountBalance.gt(0),
            helper: 'Add collateral to a CDP'
          },
    free: {
            active: this.props.system.pip.val.gt(0) && this.props.system.tub.cups[this.props.cupId].ink.gt(0) && this.props.system.tub.cups[this.props.cupId].safe && (this.props.system.tub.off === false || this.props.system.tub.cups[this.props.cupId].art.eq(0)),
            helper: 'Remove collateral from a CDP'
          },
    draw: {
            active: this.props.system.pip.val.gt(0) && this.props.system.tub.off === false && this.props.system.tub.cups[this.props.cupId].ink.gt(0) && this.props.system.tub.cups[this.props.cupId].safe,
            helper: 'Create Dai against a CDP'
          },
    wipe: {
            active: this.props.system.tub.off === false && this.props.system.tub.cups[this.props.cupId].art.gt(0),
            helper: 'Use Dai to cancel CDP debt'
          },
    shut: {
            active: this.props.system.pip.val.gt(0) && this.props.system.tub.off === false,
            helper: 'Close a CDP - Wipe all debt, Free all collateral, and delete the CDP'
          },
    give: {
            active: this.props.system.pip.val.gt(0) && this.props.system.tub.off === false,
            helper: 'Transfer CDP ownership'
          },
  };

  render() {
    const cup = this.props.system.tub.cups[this.props.cupId];

    return (
      <div>
        <div className="row">
          <div className="col col-2">
            <div>
              <h3 className="typo-c inline-headline">Liquidation price (ETH/USD)</h3>
              <div className="value typo-cl right">
                {
                  this.props.system.tub.off === false && cup.liq_price && cup.liq_price.gt(0)
                  ?
                    <span>{ printNumber(cup.liq_price) }<span className="unit">USD</span></span>
                  :
                    '-'
                }
              </div>
            </div>
            <div>
              <h3 className="typo-c inline-headline">Current price information (ETH/USD)</h3>
              <div className="value typo-cl right">
                <span>{ printNumber(this.props.system.pip.val) }<span className="unit">USD</span></span>
              </div>
            </div>
            <div>
              <h3 className="typo-c inline-headline">Liquidation penalty</h3>
              <div className="value typo-cl right">
                <span>{ printNumber(this.props.system.tub.axe.minus(WAD).times(100)) }<span className="unit">%</span></span>
              </div>
            </div>
          </div>
          <div className="col col-2">
            <div>
              <h3 className="typo-c inline-headline">Collateralization ratio</h3>
              <div className="value typo-cl right">
                {
                  this.props.system.tub.off === false
                  ?
                    cup.art.gt(toBigNumber(0)) && cup.pro
                      ?
                        <span>
                          { printNumber(toWei(cup.ratio).times(100)) }<span className="unit">%</span>
                        </span>
                      :
                        '-'
                    :
                      '-'
                }
              </div>
            </div>
            <div>
              <h3 className="typo-c inline-headline">Minimum ratio</h3>
              <div className="value typo-cl right">
                {
                  printNumber(this.props.system.tub.mat.times(100))
                }
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col col-2">
            <h3 className="typo-cl inline-headline">ETH collateral</h3>
            <div className="inner-row">
              <h4 className="typo-c inline-headline">Deposited</h4>
              <div className="right">
                <span className="value typo-cl">{ printNumber(wmul(cup.ink, this.props.system.tub.per)) }<span className="unit">ETH</span> / { printNumber(cup.ink) }<span className="unit">PETH</span> / { printNumber(wmul(wmul(cup.ink, this.props.system.tub.per), this.props.system.pip.val)) }<span className="unit">USD</span></span>
                <button className="text-btn disable-on-dialog" disabled={ !this.actions.lock.active } data-method="lock" data-cup={ this.props.cupId } onClick={ this.props.handleOpenDialog }>Deposit</button>
              </div>	
            </div>
            <div className="inner-row">
              <h4 className="typo-c inline-headline">Max. available to withdraw</h4>
              <div className="right">
                <span className="value typo-cl">
                  {
                    this.props.system.tub.off === false
                    ?
                      <span>{ printNumber(wmul(cup.avail_skr, this.props.system.tub.per)) }<span className="unit">ETH</span> / { printNumber(cup.avail_skr) }<span className="unit">PETH</span> / { printNumber(wmul(wmul(cup.avail_skr, this.props.system.tub.per), this.props.system.pip.val)) }<span className="unit">USD</span></span>
                    :
                      '-'
                  }
                </span>
                <button className="text-btn disable-on-dialog" disabled={ !this.actions.free.active } data-method="free" data-cup={ this.props.cupId } onClick={ this.props.handleOpenDialog }>Withdraw</button>
              </div>
            </div>
          </div>
          <div className="col col-2">
            <h3 className="typo-cl inline-headline">DAI position</h3>
            <div className="inner-row">
              <h4 className="typo-c inline-headline">Generated</h4>
              <div className="right">
                <span className="value typo-cl">{ printNumber(this.props.system.tab(cup)) }<span className="unit">DAI</span> / { printNumber(wmul(this.props.system.tab(cup), this.props.system.vox.par)) }<span className="unit">USD</span></span>
                <button className="text-btn disable-on-dialog" disabled={ !this.actions.wipe.active } data-method="wipe" data-cup={ this.props.cupId } onClick={ this.props.handleOpenDialog }>Payback</button>
              </div>
            </div>
            <div className="inner-row">
              <h4 className="typo-c inline-headline">Max. availble to generate</h4>
              <div className="right">
                <span className="value typo-cl">
                  {
                    this.props.system.tub.off === false
                    ?
                      <span>{ printNumber(cup.avail_dai) }<span className="unit">DAI</span> / { printNumber(wmul(cup.avail_dai, this.props.system.vox.par)) }<span className="unit">USD</span></span>
                    :
                      '-'
                  }
                </span>
                <button className="text-btn disable-on-dialog" disabled={ !this.actions.draw.active } data-method="draw" data-cup={ this.props.cupId } onClick={ this.props.handleOpenDialog }>Generate</button>
              </div>
            </div>
          </div>
        </div>
        {
          cup.history &&
          <CupHistory actions={ cup.history }/>
        }
      </div>
    )
  }
}

export default observer(Cup);
