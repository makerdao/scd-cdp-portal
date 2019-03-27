// Libraries
import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {Link} from "react-router-dom";
import Steps, {Step} from "rc-steps";

// Components
import InlineNotification from "./InlineNotification";
import LegacyCupsAlert from "./LegacyCupsAlert";
import TooltipHint from "./TooltipHint";

// Utils
import {WAD, wmul, wdiv, toBigNumber, fromWei, toWei, printNumber, formatNumber} from "../utils/helpers";

import "rc-steps/assets/index.css";

const StepIcon = ({ step }) => <div className="rc-steps-item-icon-inner">{ step }</div>;

@inject("profile")
@inject("system")
@observer
class Wizard extends Component {
  constructor() {
    super();
    this.state = {
      step: 1,
      eth: toBigNumber(0),
      ethText: "",
      skr: toBigNumber(0),
      dai: toBigNumber(0),
      daiText: "",
      maxDaiAvail: null,
      minETHReqText: null,
      liqPrice: null,
      ratio: null,
      error: false,
      warning: false,
      submitEnabled: false,
      checkTerms: false,
      stepsExpanded: false
    }
  }

  steps = () => {
    const steps= [
                    { text: "Creation of your proxy" },
                    { text: "Creation of your CDP" },
                    {
                      text: "Wrap your ETH to WETH - ERC20 tokenization",
                      tip: <TooltipHint tipKey="wizard-wrap-eth-to-weth" />
                    },
                    {
                      text: "Convert your WETH to PETH",
                      tip: <TooltipHint tipKey="wizard-convert-weth-to-peth" />
                    },
                    { text: "CDP collateralized with PETH - Your converted ETH is locked" },
                    { text: "DAI generated -  Your requested DAI is generated" },
                    { text: "DAI transferred - Your requested DAI is transferred to your wallet" }
                  ];
    if (this.props.profile.proxy && this.props.profile.proxy !== -1) {
      steps.shift();
    }

    return steps;
  }

  checkValues = (token, amount) => {
    const amountBN = toBigNumber(amount);
    const state = {...this.state};
    state[token] = toWei(amountBN);
    state[`${token}Text`] = amount;
    state.skr = toBigNumber(0);
    state.maxDaiAvail = null;
    state.liqPrice = null;
    state.ratio = null;
    state.error = "";
    state.warning = "";

    if (state.eth.gt(0)) {
      state.skr = wdiv(state.eth, this.props.system.tub.per).floor();
      state.maxDaiAvail = wdiv(wmul(state.skr, this.props.system.tub.tag), wmul(this.props.system.tub.mat, this.props.system.vox.par)).floor();
    }

    if (state.dai.gt(0)) {
      state.minETHReq = wmul(wdiv(wmul(state.dai, wmul(this.props.system.tub.mat, this.props.system.vox.par)), this.props.system.tub.tag), this.props.system.tub.per).round(0);
    }

    this.setState(state, () => {
      this.setState(prevState => {
        const state = {...prevState};

        state.submitEnabled = false;
        state.error = false;

        if (state.eth.gt(0) && this.props.system.eth.myBalance.lt(state.eth)) {
          state.error = "The amount of ETH to be deposited exceeds your current balance.";
          return state;
        } else if (state.skr.gt(0) && state.skr.round(0).lte(toWei(0.005))) {
          state.error = `You are not allowed to deposit a low amount of ETH in a CDP. It needs to be higher than 0.005 PETH (${formatNumber(wmul(toBigNumber(toWei(0.005)), this.props.system.tub.per), 18)} ETH at actual price).`;
          return state;
        }

        if (state.eth.gt(0) && state.dai.gt(0)) {
          if (this.props.system.sin.totalSupply.add(state.dai).gt(this.props.system.tub.cap)) {
            state.error = "The amount of DAI you are trying to generate exceeds the current system debt ceiling.";
          } else if (state.dai.gt(state.maxDaiAvail)) {
            state.error = "The amount of ETH to be deposited is not enough to draw this amount of DAI.";
          } else {
            state.liqPrice = this.props.system.calculateLiquidationPrice(state.skr, state.dai);
            state.ratio = this.props.system.calculateRatio(state.skr, state.dai);
            if (state.ratio.lt(WAD.times(2))) {
              state.warning = "The amount of DAI you are trying to generate against the collateral is putting your CDP at risk.";
            }
            state.submitEnabled = true;
          }
          return state;
        }
      })
    });
  }

  goToStep = step => {
    this.setState({step}, () => {
      TooltipHint.rebuildTooltips();
    });
  }

  toggleExpand = () => {
    this.setState({stepsExpanded: !this.state.stepsExpanded});
  }

  execute = e => {
    e.preventDefault();
    this.props.system.lockAndDraw(false, fromWei(this.state.eth), fromWei(this.state.dai));
  }

  check = (checked, type) => {
    const state = {...this.state};
    state[type] = checked;
    this.setState(state);
  }

  render() {
    return (
      <div className="wizard-section">
        <LegacyCupsAlert setOpenMigrate={ this.props.setOpenMigrate } />
        <header className="col" style={ {borderBottom: "none"} }>
          <Steps current={this.state.step - 1}>
            <Step title="Collateralize &amp; generate DAI" icon={<StepIcon step="1" />} />
            <Step title="Confirm details" icon={<StepIcon step="2" />} />
          </Steps>
        </header>
        {
          this.state.step === 1
          ?
            <React.Fragment>
              <form ref={ input => this.wizardForm = input } onSubmit={ e => { e.preventDefault(); this.goToStep(2) } }>

                <div className="row">
                  <div className="col col-2" style={ {border: "none"} }>
                    <label className="typo-cl no-select">How much ETH would you like to collateralize?</label>
                    <div className="input-values-container">
                      <input ref={ input => this.eth = input } type="number" id="inputETH" className="number-input" required step="0.000000000000000001" placeholder="0.000" value={ this.state.ethText } onChange={ e => { this.checkValues("eth", e.target.value) } } onKeyDown={ e => { if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 189) e.preventDefault() } } />
                      <span className="unit" style={ {marginBottom: "0.35rem" } }>ETH</span>
                      <div className="typo-cs align-right clearfix">
                        { printNumber(this.state.skr) } PETH <TooltipHint tipKey="what-is-peth" />
                      </div>
                      {
                        this.state.minETHReq &&
                        <p className="typo-cs align-right">Min. ETH required: { printNumber(this.state.minETHReq) } ETH</p>
                      }
                    </div>
                  </div>

                  <div className="col col-2">
                    <label className="typo-cl no-select">How much DAI would you like to generate?</label>
                    <div className="input-values-container">
                      <input ref={ input => this.dai = input } type="number" id="inputDAI" className="number-input" required step="0.000000000000000001" placeholder="0.000" value={ this.state.daiText } onChange={ e => { this.checkValues("dai", e.target.value) } } onKeyDown={ e => { if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 189) e.preventDefault() } } />
                      <span className="unit" style={ {marginBottom: "0.35rem" } }>DAI</span>
                      {
                        this.state.maxDaiAvail &&
                        <p className="typo-cs align-right">Max DAI available to generate: { printNumber(this.state.maxDaiAvail) } DAI</p>
                      }
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col col-2">
                    <div style={ {marginBottom: "1rem"}}>
                      <h3 className="typo-cl inline-headline">Liquidation price (ETH/USD)</h3>
                      <TooltipHint tipKey="liquidation-price" />
                      <div className="value typo-cl typo-bold right">{ this.state.liqPrice ? printNumber(this.state.liqPrice) : "--" } USD</div>
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
                      <div className="value typo-cl typo-bold right">{ this.state.ratio ? printNumber(this.state.ratio.times(100)) : "--" }%</div>
                    </div>
                    <div>
                      <h3 className="typo-c inline-headline">Minimum ratio</h3>
                      <div className="value typo-c right">{ printNumber(this.props.system.tub.mat.times(100)) }%</div>
                    </div>
                  </div>
                </div>

                <div className="row" style={ {borderBottom: "none"} }>
                  <p className="no-select">
                    Stability fee @{ printNumber(toWei(fromWei(this.props.system.tub.fee).pow(60 * 60 * 24 * 365)).times(100).minus(toWei(100)), 1, true, true) }%/year in MKR
                    <TooltipHint tipKey="stability-fee" />
                  </p>
                </div>

                <div className="row" style={ {borderBottom: "none"} }>
                  { this.state.warning && <InlineNotification type="warning" message={ this.state.warning } /> }
                  { this.state.error && <InlineNotification type="error" message={ this.state.error } /> }
                </div>

                <div className="row" style={ {borderBottom: "none"} }>
                  <div className="col">
                    <button className="bright-style text-btn text-btn-primary" type="submit" disabled={ !this.state.submitEnabled }>COLLATERALIZE &amp; generate Dai</button>
                  </div>
                </div>
              </form>
            </React.Fragment>
          :
            <React.Fragment>
              <div className="row">
                <div className="col">
                  <h3 className="typo-cl">Collateralize &amp; generate Dai</h3>
                </div>
              </div>

              <div className="row">
                <div className="col col-2">
                  <div>
                    <h3 className="typo-cl inline-headline">Collateral:</h3>
                    <div className="value typo-cl typo-bold right">{ printNumber(this.state.eth) } ETH</div>
                  </div>
                </div>
                <div className="col col-2">
                  <div>
                    <h3 className="typo-cl inline-headline">Generate:</h3>
                    <div className="value typo-cl typo-bold right">{ printNumber(this.state.dai) } DAI</div>
                  </div>
                </div>
              </div>

              <div className="row" style={ {marginTop: "50px"} }>
                <div className="col">
                  <h3 className="typo-cl">Transaction details</h3>
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <h3 className="typo-cl" style={ {marginBottom: "1rem"} }>Automated smart contract transaction</h3>

                  <div className="typo-c no-select clear-left">
                    {
                      this.state.stepsExpanded ?
                      <svg className="wizard expand-section-btn" width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" onClick={ () => this.toggleExpand() }>
                        <path d="m1022.95113 481.269219-4.95267-4.953847-4.95267 4.953847-1.50733-1.507693 6.46-6.461538 6.46 6.461538zm-4.95113 10.730781c-7.73199 0-14-6.268014-14-14s6.26801-14 14-14 14 6.268014 14 14-6.26801 14-14 14zm0-2.153846c6.54245 0 11.84615-5.303704 11.84615-11.846154s-5.3037-11.846154-11.84615-11.846154-11.84615 5.303704-11.84615 11.846154 5.3037 11.846154 11.84615 11.846154z" fill="#9aa3ad" transform="translate(-1004 -464)"/>
                      </svg>
                      :
                      <svg className="wizard expand-section-btn" width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" onClick={ () => this.toggleExpand() }>
                        <path d="m1080.95385 474.769231-4.95385 4.953846-4.95385-4.953846-1.50769 1.507692 6.46154 6.461539 6.46154-6.461539zm-4.95385 17.230769c-7.73199 0-14-6.268014-14-14s6.26801-14 14-14 14 6.268014 14 14-6.26801 14-14 14zm0-2.153846c6.54245 0 11.84615-5.303704 11.84615-11.846154s-5.3037-11.846154-11.84615-11.846154-11.84615 5.303704-11.84615 11.846154 5.3037 11.846154 11.84615 11.846154z" transform="translate(-1062 -464)"/>
                      </svg>
                    }
                    There are { this.steps().length } steps needed to complete the creation of your CDP.&nbsp;&nbsp;These will be automated for your convenience.
                  </div>

                  <div className={"typo-c wizard-automated-transactions" + (this.state.stepsExpanded ? " expanded" : "") }>
                  {
                    this.steps().map((s, key) => (
                      <div className="step-cointainer" key={ key }>
                        <div className="step-icon">
                          <div className="steps-item"><div className="steps-item-inner">{ key + 1 }</div></div>
                          <div className="vertical-line"></div>
                        </div>
                        <div className="step-message">
                          <span>{ s.text }{ s.tip }</span>
                        </div>
                      </div>
                    ))
                  }
                  </div>

                </div>
              </div>

              <div className="inline-notification is-error">When you open a CDP, the stability fee might vary due to changing market conditions. Find out more here. The Stability Fee is currently</div>


              <div className="row" style={ {marginTop: "50px", border: "none"} }>
                <div className="col">
                  <div style={ {marginBottom: "2rem"} }>
                    <label className="checkbox-container">
                      <input type="checkbox" checked={ this.state.checkTerms } value="1" onChange={e => this.check(e.target.checked, "checkTerms")}/>
                      <span className="checkmark"></span>
                      I have read and accept the <Link to="/terms" target="_blank">Terms of Service</Link>
                    </label>
                  </div>
                  <div>
                    <button className="bright-style text-btn" onClick={ () => this.goToStep(1) }>GO BACK</button>
                    <button className="bright-style text-btn text-btn-primary" onClick={ this.execute } disabled={ !this.state.checkTerms }>FINALIZE AND CREATE CDP</button>
                  </div>
                </div>
              </div>
            </React.Fragment>
        }
      </div>
    )
  }
}

export default Wizard;
