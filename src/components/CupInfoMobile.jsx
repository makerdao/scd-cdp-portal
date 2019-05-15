// Libraries
import React, {Component} from "react";
import {inject, observer} from "mobx-react";

// Utils
import {printNumber, WAD, fromWei, toWei} from "../utils/helpers";

@inject("system")
@inject("dialog")
@observer
export default class CupInfoMobile extends Component {
  ratio = cup => {
    if (cup && cup.ratio) {
      return (
        this.props.system.tub.off === false
        ?
          cup.ratio.lt(0)
          ?
            "-"
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
        ? ((adjustedRatio < 150) ? {color: "#C0392B"} : {color: "#FBAE17"})
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
            "-"
      );
    }
  }

  cupHeader = actions => {
    return (
      <div>
        <h2 className="inline-headline" style={{color: "#ffffff"}}>CDP #{this.props.cupId}</h2>
        <a
          className="text-btn right mobile-a-button"
          href="#action"
          data-method="shut"
          data-cup={ this.props.cupId }
          disabled={ !actions.free.shut }
          onClick={ this.props.dialog.handleOpenDialog }
          style={{
            background: 'transparent',
            fontSize: '1.3em',
            height: '30px',
            marginBottom: '5px',
            marginLeft: '7px',
            marginTop: '2px',
            width: '70px',
            textTransform: 'none'
          }}
        >
          Close
        </a>
        <a
          className="text-btn right mobile-a-button"
          href="#action"
          data-method="give"
          data-cup={ this.props.cupId }
          disabled={ !actions.free.give }
          onClick={ this.props.dialog.handleOpenDialog }
          style={{
            background: 'transparent',
            fontSize: '1.3em',
            height: '30px',
            marginBottom: '5px',
            marginTop: '2px',
            width: '70px',
            textTransform: 'none'
          }}
        >
          Move
        </a>
      </div>
    );
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
    const ratioColor = this.ratioColor(ratio);
    const actions = {
      lock: {
              active: this.props.system.tub.off === false && this.props.system.eth.myBalance && this.props.system.eth.myBalance.gt(0),
              helper: "Add collateral to a CDP"
            },
      free: {
              active: this.props.system.pip.val.gt(0) && cup.ink.gt(0) && cup.safe && (this.props.system.tub.off === false || cup.art.eq(0)),
              helper: "Remove collateral from a CDP"
            },
      draw: {
              active: this.props.system.pip.val.gt(0) && this.props.system.tub.off === false && cup.ink.gt(0) && cup.safe,
              helper: "Create Dai against a CDP"
            },
      wipe: {
              active: this.props.system.tub.off === false && cup.art.gt(0),
              helper: "Use Dai to cancel CDP debt"
            },
      shut: {
              active: this.props.system.pip.val.gt(0) && this.props.system.tub.off === false,
              helper: "Close a CDP - Wipe all debt, Free all collateral, and delete the CDP"
            },
      give: {
              active: this.props.system.tub.off === false,
              helper: "Transfer CDP ownership"
            }
    };

    return (
      <div id="CupInfoMobile">
        {
          cup ? this.cupHeader(actions) : <div></div>
        }
        <div className="col" style={{marginBottom: "30px"}}>
          <div>
            <h3 className="typo-cm typo-bold inline-headline">Collateralization</h3>
            <div className="typo-cm right"><span style={{...ratioColor}}>{ ratio ? printNumber(ratio.times(100)) : "--" }%</span></div>
          </div>
          <div>
            <h3 className="typo-cm typo-bold inline-headline">Minimum ratio</h3>
            <div className="typo-cm right">{ printNumber(this.props.system.tub.mat.times(100)) }%</div>
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
            <h3 className="typo-cm  typo-bold inline-headline">Stability fee</h3>
            <div className="typo-cm right">{ stabilityFee }%</div>
          </div>
        </div>
      </div>
    );
  }
}