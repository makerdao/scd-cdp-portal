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
              toWei(cup.ratio).times(100)
            :
              "-"
        :
          "-"
      );
    }
  }

  ratioColor = cup => {
    if (this.ratio(cup)) {
      return this.ratio(cup).lt(2)
        ? (this.ratio(cup).lt(1.5) ? "text-red" : "text-yellow")
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
            printNumber(cup.liq_price)
          :
            "Loading..."
      );
    }
  }

  render() {
    const stabilityFee = printNumber(toWei(fromWei(this.props.system.tub.fee).pow(60 * 60 * 24 * 365)).times(100).minus(toWei(100)), 1, true, true);
    const cup = this.props.system.tub.cups[this.props.cupId];
    console.log(this.props);

    return (
      <div id="CupInfoMobile">
        <div className="col" style={{marginBottom: "30px"}}>
          <div>
            <h3 className="typo-cm typo-bold inline-headline">Liquidation price (ETH/USD)</h3>
            <div className="typo-cm right">{ this.liqPrice(cup) ? this.liqPrice(cup) : "--" } USD</div>
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
            <div className="typo-cm right"><span className={ this.ratioColor(cup) }>{ this.ratio(cup) ? printNumber(this.ratio(cup).times(100)) : "--" }%</span></div>
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