// Libraries
import React, {Component} from "react";
import {inject, observer} from "mobx-react";

//Utils
import {WAD, printNumber} from "../utils/helpers";

@inject("system")
@observer
export default class NewCupDetailsMobile extends Component {
  render() {
    const { liqPrice, ratio, stabilityFee, system } = this.props;
    
    return (
      <div>
        <div className="col" style={{marginBottom: "30px"}}>
          <div>
            <h3 className="typo-cm typo-bold inline-headline">Liquidation price (ETH/USD)</h3>
            <div className="typo-cm right">{ liqPrice ? printNumber(liqPrice) : "--" } USD</div>
          </div>
          <div>
            <h3 className="typo-cm typo-bold inline-headline">Current price (ETH/USD)</h3>
            <div className="typo-cm right">{ printNumber(system.pip.val) } USD</div>
          </div>
          <div>
            <h3 className="typo-cm typo-bold inline-headline">Liquidation penalty</h3>
            <div className="typo-cm right">{ printNumber(system.tub.axe.minus(WAD).times(100)) }%</div>
          </div>
          <div>
            <h3 className="typo-cm typo-bold inline-headline">Collateralization ratio</h3>
            <div className="typo-cm right">{ ratio ? printNumber(ratio.times(100)) : "--" }%</div>
          </div>
          <div>
            <h3 className="typo-cm typo-bold inline-headline">Minimum ratio</h3>
            <div className="typo-cm right">{ printNumber(system.tub.mat.times(100)) }%</div>
          </div>
          <div>
            <h3 className="typo-cm  typo-bold inline-headline">Stability Fee</h3>
            <div className="typo-cm right">{ stabilityFee }%</div>
          </div>
        </div>
      </div>
    );
  }
}