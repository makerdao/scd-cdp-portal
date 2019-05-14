// Libraries
import React, {Component} from "react";
import {inject, observer} from "mobx-react";

// Utils
import {printNumber, WAD, fromWei, toWei} from "../utils/helpers";

@inject("system")
@observer
export default class CupInfoMobile extends Component {
  ratio = cup => {
    if (cup && cup.ratio) {
      return (
        this.props.system.tub.off === false
        ?
          cup.ratio.lt(0)
          ?
            "Loading..."
          :
            cup.ratio.gt(0) && cup.ratio.toNumber() !== Infinity
            ?
              toWei(cup.ratio)
            :
              "-"
        :
          "-"
      );
    }
  }

  ratioColor = ratio => {
    const adjustedRatio = parseFloat(ratio) / 10000000000000000;
    if (adjustedRatio && this.props.cupId) {
      return adjustedRatio < 200 
        ? ((adjustedRatio < 150) ? "text-red" : "text-yellow")
        : "" 
    }
  }

  liqPrice = cup => {
    if (cup && cup.liq_price) {
      return (
        this.props.system.tub.off === true || (cup.liq_price && cup.liq_price.eq(0))
        ?
          "-"
        :
          cup.liq_price && cup.liq_price.gte(0)
          ?
            cup.liq_price
          :
            <div>"Loading..."</div>
      );
    }
  }

  render() {
    let cup;
    const stabilityFee = printNumber(toWei(fromWei(this.props.system.tub.fee).pow(60 * 60 * 24 * 365)).times(100).minus(toWei(100)), 1, true, true);
    if (this.props.cupId) {
      cup = this.props.system.tub.cups[this.props.cupId];
    }
    const liqPrice = this.props.liqPrice
      ? this.props.liqPrice
      : this.liqPrice(cup);
    const ratio = this.props.ratio
      ? this.props.ratio
      : this.ratio(cup);

    return (
      <div id="CupInfoMobile">
        <div className="col" style={{marginBottom: "30px"}}>
          <div>
            <h3 className="typo-cm typo-bold inline-headline">Collateralization ratio</h3>
            <div className="typo-cm right"><span className={this.ratioColor(ratio)} style={{color: "#FBAE17"}}>{ ratio ? printNumber(ratio.times(100)) : "--" }%</span></div>
          </div>
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
            <h3 className="typo-cm typo-bold inline-headline">Minimum ratio</h3>
            <div className="typo-cm right">{ printNumber(this.props.system.tub.mat.times(100)) }%</div>
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