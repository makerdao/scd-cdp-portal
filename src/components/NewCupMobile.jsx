// Libraries
import React, {Component} from "react";
import {inject, observer} from "mobx-react";

// Components
import InlineNotification from "./InlineNotification";

//Utils
import {WAD, printNumber} from "../utils/helpers";

@inject("system")
@observer
export default class NewCupMobile extends Component {
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
      <div id="newCupMobile">
        <div className="row">
          <div className="col" style={ {border: "none"} }>
            <label className="typo-cm no-select typo-bolder" style={{color: "#ffffff", marginTop: "8px"}}>How much ETH would you like to collateralize?</label>
            <div className="input-values-container">
              <input ref={ input => this.eth = input } type="number" id="inputETH" className="number-input" required step="0.000000000000000001" placeholder="0.000" value={ ethText } onChange={ e => { checkValues("eth", e.target.value) } } onKeyDown={ e => { if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 189) e.preventDefault() } } />
              <span className="unit">ETH</span>
              <div className="typo-cs align-right clearfix">
                { printNumber(skr) } PETH
              </div>
              {
                minETHReq &&
                <p className="typo-cs align-right">Min. ETH required: { printNumber(minETHReq) } ETH</p>
              }
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <label className="typo-cm no-select typo-bolder" style={{color: "#ffffff"}}>How much DAI would you like to generate?</label>
            <div className="input-values-container" style={{marginBottom: "25px"}}>
              <input ref={ input => this.dai = input } type="number" id="inputDAI" className="number-input" required step="0.000000000000000001" placeholder="0.000" value={ daiText } onChange={ e => { checkValues("dai", e.target.value) } } onKeyDown={ e => { if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 189) e.preventDefault() } } />
              <span className="unit">DAI</span>
              {
                maxDaiAvail &&
                <p className="typo-cs align-right">Max DAI available to generate: { printNumber(maxDaiAvail) } DAI</p>
              }
            </div>
          </div>
        </div>
              
        <div className="col" style={{marginBottom: "30px"}}>
          <div>
            <h3 className="typo-cm typo-bold inline-headline">Liquidation price (ETH/USD)</h3>
            <div className="typo-cm right">{ liqPrice ? printNumber(liqPrice) : "--" } USD</div>
          </div>
          <div>
            <h3 className="typo-cm typo-bold inline-headline">Current price (ETH/USD)</h3>
            <div className="typo-cm right">{ printNumber(this.props.system.pip.val) } USD</div>
          </div>
          <div>
            <h3 className="typo-cm typo-bold inline-headline">Liquidation penalty</h3>
            <div className="typo-cm right">{ printNumber(this.props.system.tub.axe.minus(WAD).times(100)) }%</div>
          </div>
          <div>
            <h3 className="typo-cm typo-bold inline-headline">Collateralization ratio</h3>
            <div className="typo-cm right">{ ratio ? printNumber(ratio.times(100)) : "--" }%</div>
          </div>
          <div>
            <h3 className="typo-cm typo-bold inline-headline">Minimum ratio</h3>
            <div className="typo-cm right">{ printNumber(this.props.system.tub.mat.times(100)) }%</div>
          </div>
          <div>
            <h3 className="typo-cm  typo-bold inline-headline">Stability Fee</h3>
            <div className="typo-cm right">{ stabilityFee }%</div>
          </div>
        </div>

        <div className="row" style={ {borderBottom: "none"} }>
          { warning && <InlineNotification type="warning" message={ warning } /> }
          { error && <InlineNotification type="error" message={ error } /> }
        </div>

        <div className="row" style={ {borderBottom: "none", marginBottom: "30px"}}>
          <div className="col">
            <button className={"bright-style text-btn text-btn-primary-mobile"} type="submit" disabled={ !submitEnabled }>continue</button>
          </div>
        </div>
      </div>
    );
  }
}