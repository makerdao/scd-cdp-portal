import React from 'react';
import {observer} from 'mobx-react';

// import CupChart from './CupChart'
import CupHistory from './CupHistory';
import TooltipHint from './TooltipHint';
import {WAD, printNumber, wmul, toBigNumber, toWei} from '../helpers';

class Cup extends React.Component {
  componentDidMount() {
    TooltipHint.rebuildTooltips();
  }
  render() {
    const cup = this.props.system.tub.cups[this.props.cupId];

    const actions = {
      lock: {
              active: this.props.system.tub.off === false && this.props.profile.accountBalance && this.props.profile.accountBalance.gt(0),
              helper: 'Add collateral to a CDP'
            },
      free: {
              active: this.props.system.pip.val.gt(0) && cup.ink.gt(0) && cup.safe && (this.props.system.tub.off === false || cup.art.eq(0)),
              helper: 'Remove collateral from a CDP'
            },
      draw: {
              active: this.props.system.pip.val.gt(0) && this.props.system.tub.off === false && cup.ink.gt(0) && cup.safe,
              helper: 'Create Dai against a CDP'
            },
      wipe: {
              active: this.props.system.tub.off === false && cup.art.gt(0),
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

    return (
      <div>
        <div className="row">
          <div className="col col-2">
            <div style={ {marginBottom: '1rem'}}>
              <h3 className="typo-cl inline-headline">Liquidation price (ETH/USD)</h3>
              <TooltipHint tip="Lorem ipsum dolor sit amet, consectetur adipisicing elit,<br />sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
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
              <TooltipHint tip="Lorem ipsum dolor sit amet, consectetur adipisicing elit,<br />sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
              <div className="value typo-c right">
                <span>{ printNumber(this.props.system.pip.val) }<span className="unit">USD</span></span>
              </div>
            </div>
            <div>
              <h3 className="typo-c inline-headline">Liquidation penalty</h3>
              <TooltipHint tip="Lorem ipsum dolor sit amet, consectetur adipisicing elit,<br />sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
              <div className="value typo-c right">
                <span>{ printNumber(this.props.system.tub.axe.minus(WAD).times(100)) }<span className="unit">%</span></span>
              </div>
            </div>
          </div>
          <div className="col col-2">
            <div style={ {marginBottom: '1rem'}}>
              <h3 className="typo-cl inline-headline">Collateralization ratio</h3>
              <TooltipHint tip="Lorem ipsum dolor sit amet, consectetur adipisicing elit,<br />sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
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
                <button className="text-btn disable-on-dialog" style={ {minWidth: '8rem' } } disabled={ !actions.lock.active } data-method="lock" data-cup={ this.props.cupId } onClick={ this.props.handleOpenDialog }>Deposit</button>
              </div>
              <div className="right align-right" style={ {marginRight: '1rem'} }>
                <div className="value block typo-cl">
                  { printNumber(wmul(cup.ink, this.props.system.tub.per)) }<span className="unit">ETH</span>
                </div>
                <div className="value block typo-c" style={ {lineHeight: '1rem'} }>
                  { printNumber(cup.ink) }<span className="unit">PETH</span>
                  <span className="separator">&nbsp;|&nbsp;</span>
                  { printNumber(wmul(wmul(cup.ink, this.props.system.tub.per), this.props.system.pip.val)) }<span className="unit">USD</span>
                </div>
              </div>
            </div>
            <div className="inner-row">
              <h4 className="typo-c inline-headline" style={ {maxWidth: '8rem' } }>Max. available to withdraw
                <TooltipHint tip="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
              </h4>
              <div className="right">
                <button className="text-btn disable-on-dialog" style={ {minWidth: '8rem' } } disabled={ !actions.free.active } data-method="free" data-cup={ this.props.cupId } onClick={ this.props.handleOpenDialog }>Withdraw</button>
              </div>
              {
                this.props.system.tub.off === false
                ?
                <div className="right align-right" style={ {marginRight: '1rem'} }>
                  <div className="value block typo-cl">
                    { printNumber(wmul(cup.avail_skr, this.props.system.tub.per)) }<span className="unit">ETH</span>
                  </div>
                  <div className="value block typo-c" style={ {lineHeight: '1rem'} }>
                    { printNumber(cup.avail_skr) }<span className="unit">PETH</span>
                    <span className="separator">&nbsp;|&nbsp;</span>
                    { printNumber(wmul(wmul(cup.avail_skr, this.props.system.tub.per), this.props.system.pip.val)) }<span className="unit">USD</span>
                  </div>
                </div>
                :
                  '-'
              }
            </div>
          </div>
          <div className="col col-2">
            <h3 className="typo-cl inline-headline">DAI position</h3>
            <div className="inner-row">
              <h4 className="typo-c inline-headline">Generated</h4>
              <div className="right">
                <button className="text-btn disable-on-dialog" style={ {minWidth: '8rem' } } disabled={ !actions.wipe.active } data-method="wipe" data-cup={ this.props.cupId } onClick={ this.props.handleOpenDialog }>Payback</button>
              </div>
              <div className="right align-right" style={ {marginRight: '1rem'} }>
                <div className="value block typo-cl">
                  { printNumber(this.props.system.tab(cup)) }<span className="unit">DAI</span>
                </div>
                <div className="value block typo-c" style={ {lineHeight: '1rem'} }>
                  { printNumber(wmul(this.props.system.tab(cup), this.props.system.vox.par)) }<span className="unit">USD</span>
                </div>
              </div>
            </div>
            <div className="inner-row">
              <h4 className="typo-c inline-headline">Max. availble to generate</h4>
              <div className="right">
                <button className="text-btn disable-on-dialog" style={ {minWidth: '8rem' } } disabled={ !actions.draw.active } data-method="draw" data-cup={ this.props.cupId } onClick={ this.props.handleOpenDialog }>Generate</button>
              </div>
              {
                this.props.system.tub.off === false
                ?
                <div className="right align-right" style={ {marginRight: '1rem'} }>
                  <div className="value block typo-cl">
                    { printNumber(cup.avail_dai) }<span className="unit">DAI</span>
                  </div>
                  <div className="value block typo-c" style={ {lineHeight: '1rem'} }>
                    { printNumber(wmul(cup.avail_dai, this.props.system.vox.par)) }<span className="unit">USD</span>
                  </div>
                </div>
                :
                  '-'
              }
            </div>
          </div>
        </div>
        <button className="text-btn" data-method="shut" data-cup={ this.props.cupId } onClick={ this.props.handleOpenDialog }>Close this CDP</button>
        {
          cup.history &&
          <CupHistory actions={ cup.history } network={ this.props.network }/>
        }
      </div>
    )
  }
}

export default observer(Cup);
