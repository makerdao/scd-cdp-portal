// Libraries
import React, {Component} from "react";
import {inject, observer} from "mobx-react";

// Components
import TooltipHint from "./TooltipHint";

//Utils
import {WAD, printNumber} from "../utils/helpers";

@inject("system")
@observer
export default class NewCupDetails extends Component {
  render() {
    return (
      <div>
        <div className="row">
          <div className="col col-2">
            <div style={ {marginBottom: "1rem"}}>
              <h3 className="typo-cl inline-headline">Liquidation price (ETH/USD)</h3>
              <TooltipHint tipKey="liquidation-price" />
              <div className="value typo-cl typo-bold right">{ this.props.liqPrice ? printNumber(this.props.liqPrice) : "--" } USD</div>
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
              <div className="value typo-cl typo-bold right">{ this.props.ratio ? printNumber(this.props.ratio.times(100)) : "--" }%</div>
            </div>
            <div>
              <h3 className="typo-c inline-headline">Minimum ratio</h3>
              <div className="value typo-c right">{ printNumber(this.props.system.tub.mat.times(100)) }%</div>
            </div>
          </div>
        </div>

        <div className="row" style={ {borderBottom: "none"} }>
          <p className="no-select">
            Stability fee @{ this.props.stabilityFee }%/year in MKR
            <TooltipHint tipKey="stability-fee" />
          </p>
        </div>
      </div>
    );
  }
}