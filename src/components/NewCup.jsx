// Libraries
import React, {Component} from "react";
import {inject, observer} from "mobx-react";

// Components
import InlineNotification from "./InlineNotification";
import TooltipHint from "./TooltipHint";

//Utils
import {WAD, printNumber} from "../utils/helpers";

// Analytics
import { mixpanelInstance as mixpanel } from '../utils/analytics';

@inject("system")
@observer
export default class NewCup extends Component {
  render() {
    const {
      checkValues,
      daiText,
      error,
      ethText,
      liqPrice,
      maxDaiAvail,
      minETHReq,
      ratio,
      skr,
      stabilityFee,
      submitEnabled,
      warning
    } = this.props.newCupProps;

    return (
      <div id="newCup">
        <div className="row">
          <div className="col col-2" style={ {border: "none"} }>
            <label className="typo-cl no-select">How much ETH would you like to collateralize?</label>
            <div className="input-values-container">
              <input ref={ input => this.eth = input } type="number" id="inputETH" className="number-input" required step="0.000000000000000001" placeholder="0.000" value={ ethText } onChange={ e => { checkValues("eth", e.target.value) } } onKeyDown={ e => { if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 189) e.preventDefault() } } />
              <span className="unit" style={ {marginBottom: "0.35rem" } }>ETH</span>
              <div className="typo-cs align-right clearfix">
                { printNumber(skr) } PETH <TooltipHint tipKey="what-is-peth" />
              </div>
              {
                minETHReq &&
                <p className="typo-cs align-right">Min. ETH required: { printNumber(minETHReq) } ETH</p>
              }
            </div>
          </div>

          <div className="col col-2">
            <label className="typo-cl no-select">How much DAI would you like to generate?</label>
            <div className="input-values-container">
              <input ref={ input => this.dai = input } type="number" id="inputDAI" className="number-input" required step="0.000000000000000001" placeholder="0.000" value={ daiText } onChange={ e => { checkValues("dai", e.target.value)} } onKeyDown={ e => { if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 189) e.preventDefault() } } />
              <span className="unit" style={ {marginBottom: "0.35rem" } }>DAI</span>
              {
                maxDaiAvail &&
                <p className="typo-cs align-right">Max DAI available to generate: { printNumber(maxDaiAvail) } DAI</p>
              }
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col col-2">
            <div style={ {marginBottom: "1rem"}}>
              <h3 className="typo-cl inline-headline">Liquidation price (ETH/USD)</h3>
              <TooltipHint tipKey="liquidation-price" />
              <div className="value typo-cl typo-bold right">{ liqPrice ? printNumber(liqPrice) : "--" } USD</div>
            </div>
            <div>
              <h3 className="typo-c inline-headline">Current price information (ETH/USD)</h3>
              <TooltipHint tipKey="current-price-information" />
              <div className="value typo-c right">{ printNumber(this.props.system.pip.val) } USD</div>
            </div>
            <div>
              <h3 className="typo-c inline-headline">Liquidation penalty</h3>
              <TooltipHint tipKey="liquidation-penalty" />
              <div className="value typo-c right">{ printNumber(this.props.system.tub.axe.minus(WAD).times(100)) }%</div>
            </div>
          </div>

          <div className="col col-2">
            <div style={ {marginBottom: "1rem"}}>
              <h3 className="typo-cl inline-headline">Collateralization ratio</h3>
              <TooltipHint tipKey="collateralization-ratio" />
              <div className="value typo-cl typo-bold right">{ ratio ? printNumber(ratio.times(100)) : "--" }%</div>
            </div>
            <div>
              <h3 className="typo-c inline-headline">Minimum ratio</h3>
              <div className="value typo-c right">{ printNumber(this.props.system.tub.mat.times(100)) }%</div>
            </div>
          </div>
        </div>

        <div className="row" style={ {borderBottom: "none"} }>
          <p className="no-select">
            Stability fee @{ stabilityFee }%/year in MKR
            <TooltipHint tipKey="stability-fee" />
          </p>
        </div>

        <div className="row" style={ {borderBottom: "none"} }>
          { warning && <InlineNotification type="warning" message={ warning } /> }
          { error && <InlineNotification type="error" message={ error } /> }
        </div>

        <div className="row" style={ {borderBottom: "none"} }>
          <div className="col">
            <button className="bright-style text-btn text-btn-primary" type="submit" onClick={() => mixpanel.track('btn-click', { id: 'collateralize_generate', product: 'scd-cdp-portal' })} disabled={ !submitEnabled }>COLLATERALIZE &amp; generate Dai</button>
          </div>
        </div>
      </div>
    );
  }
}
