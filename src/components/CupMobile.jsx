// Libraries
import React from "react";
import {inject, observer} from "mobx-react";

// Components
import CupHistory from "./CupHistory";
import TooltipHint from "./TooltipHint";
import CupInfoMobile from "./CupInfoMobile";

// Utils
import {printNumber, wmul} from "../utils/helpers";

@inject("profile")
@inject("system")
@inject("dialog")
@observer
export default class CupMobile extends React.Component {
  componentDidMount() {
    TooltipHint.rebuildTooltips();
  }

  usdValue = eth => {
    const ethPrice = this.props.system.pip.val / 1000000000000000000;
    return eth * ethPrice;
  }

  ethSection = (actions, cup, buttonStyle) => {
    return (
      <div style={{marginTop: "-10px"}}>
        <a
          className="text-btn right mobile-a-button"
          href="#action"
          data-method="free"
          data-cup={ this.props.cupId }
          disabled={ !actions.free.active }
          onClick={ this.props.dialog.handleOpenDialog }
          style={{ ...buttonStyle, marginLeft: '7px' }}
        >
          Withdraw
        </a>
        <a
          className="text-btn right mobile-a-button"
          href="#action"
          data-method="lock"
          data-cup={ this.props.cupId }
          disabled={ !actions.lock.active }
          onClick={ this.props.dialog.handleOpenDialog }
          style={{ ...buttonStyle }}
        >
          Deposit
        </a>
        <div className="block typo-c" style={{fontSize: "1.3em", lineHeight: "1"}}>ETH Collateral</div>
        <div>
          {
            cup.ink.gte(0) && this.props.system.tub.per.gte(0) && this.props.system.pip.val.gte(0)
            ?
              <React.Fragment>
                <div className="value block typo-cxl" style={ {fontSize: "1.7em", lineHeight: "1.5"} }>
                  { printNumber(wmul(cup.ink, this.props.system.tub.per)) }<span className="unit" style={{color: "#ffffff"}}>ETH</span>
                </div>
                <div className="block typo-c" style={ {fontSize: "1.3em", lineHeight: "0.7"} }>
                  ${ printNumber(wmul(wmul(cup.ink, this.props.system.tub.per), this.props.system.pip.val)) }
                </div>
              </React.Fragment>
            :
              "Loading..."
          }
        </div>
      </div>
    );
  }

  daiSection = (actions, cup, buttonStyle) => {
    return (
      <div style={{marginTop: "20px", marginBottom: "30px"}}>
        <a
          className="text-btn right mobile-a-button"
          href="#action"
          data-method="draw"
          data-cup={ this.props.cupId }
          disabled={ !actions.draw.active }
          onClick={ this.props.dialog.handleOpenDialog }
          style={{ ...buttonStyle, marginLeft: '7px' }}
        >
          Generate
        </a>
        <a
          className="text-btn right mobile-a-button"
          href="#action"
          data-method="wipe"
          data-cup={ this.props.cupId }
          disabled={ !actions.wipe.active }
          onClick={ this.props.dialog.handleOpenDialog }
          style={{ ...buttonStyle }}
        >
          Pay Back
        </a>
        <div className="block typo-c" style={{fontSize: "1.3em", lineHeight: "1"}}>DAI Position</div>
        <div>
          {
            this.props.system.tab(cup).gte(0) && this.props.system.vox.par.gte(0)
              ?
                <React.Fragment>
                  <div className="value block typo-cxl" style={ {fontSize: "1.7em", lineHeight: "1.5"} }>
                    { printNumber(this.props.system.tab(cup)) }<span className="unit" style={{color: "#ffffff"}}>DAI</span>
                  </div>
                  <div className="block typo-c" style={ {fontSize: "1.3em", lineHeight: "0.7"} }>
                    ${ printNumber(wmul(this.props.system.tab(cup), this.props.system.vox.par)) }
                  </div>
                </React.Fragment>
              :
                "Loading..."
            }
        </div>
      </div>
    );
  }

  render() {
    const cup = this.props.system.tub.cups[this.props.cupId];
    const buttonStyle = {
      background: 'transparent',
      fontSize: '1.3em',
      height: '30px',
      marginBottom: '5px',
      marginTop: '2px',
      width: '75px',
      textTransform: 'none'
    }
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
            },
    };

    return (
      <React.Fragment>
        <header className="col" style={{marginBottom: "20px"}}>
          <h1 className="typo-h1 inline-headline dashboard-headline">CDP Portal</h1>
        </header>
        <div className="row" style={{marginBottom: "-20px"}}>
          <CupInfoMobile actions={actions} buttonStyle={buttonStyle} cupId={this.props.cupId} />
          <div className="col">
            {this.ethSection(actions, cup, buttonStyle)}
          </div>
          <div className="col">
            {this.daiSection(actions, cup, buttonStyle)}
          </div>
        </div>
        <CupHistory history={ cup.history } />
      </React.Fragment>
    )
  }
}
