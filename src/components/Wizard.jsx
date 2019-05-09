// Libraries
import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import Steps, {Step} from "rc-steps";
import checkIsMobile from "ismobilejs";

// Components
import LegacyCupsAlert from "./LegacyCupsAlert";
import TooltipHint from "./TooltipHint";
import NewCup from "./NewCup";
import NewCupMobile from "./NewCupMobile";
import Confirm from "./Confirm";

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

  mobileHeaderText = () => {
    return this.state.step === 1
      ? 'Create CDP'
      : 'Confirm';
  }

  mobileEditButton = () => {
    if (this.state.step === 2) {
      return (
        <button
          className="text-btn right mobile-edit"
          onClick={ () => this.goToStep(1) }
          style={{
            background: 'transparent',
            fontSize: '1.3em',
            height: '30px',
            marginBottom: '5px',
            marginTop: '-2px',
            minWidth: '60px',
            padding: '0 0',
            textTransform: 'none'
          }}
        >
          Edit
        </button>
      );
    }
  }

  header = () => {
    return checkIsMobile.any
      ? (
        <header className="col">
          <h1 className="typo-h1 inline-headline">{this.mobileHeaderText()}</h1>
          {this.mobileEditButton()}
        </header>
      )
      : (
        <header className="col" style={ {borderBottom: "none"} }>
          <Steps current={this.state.step - 1}>
            <Step title="Collateralize &amp; generate DAI" icon={<StepIcon step="1" />} />
            <Step title="Confirm details" icon={<StepIcon step="2" />} />
          </Steps>
        </header>
      );
  }

  newCup = stabilityFee => {
    const newCupProps = {
      checkValues: this.checkValues,
      daiText: this.state.daiText,
      error: this.state.error,
      ethText: this.state.ethText,
      liqPrice: this.state.liqPrice,
      maxDaiAvail: this.state.maxDaiAvail,
      minETHReq: this.state.minETHReq,
      ratio: this.state.ratio,
      skr: this.state.skr,
      stabilityFee: stabilityFee,
      submitEnabled: this.state.submitEnabled,
      warning: this.state.warning
    }

    return checkIsMobile.any
      ? <NewCupMobile newCupProps={newCupProps}/>        
      : <NewCup newCupProps={newCupProps}/>;
  }

  confirm = stabilityFee => {
    const confirmProps = {
      check: this.check,
      checkTerms: this.state.checkTerms,
      dai: this.state.dai,
      eth: this.state.eth,
      execute: this.execute,
      goToStep: this.goToStep,
      stabilityFee: stabilityFee,
      steps: this.steps,
      stepsExpanded: this.state.stepsExpanded,
      toggleExpand: this.toggleExpand
    };

    return checkIsMobile.any
      ? <Confirm confirmProps={confirmProps} />
      : <Confirm confirmProps={confirmProps} />
  }

  render() {
    const stabilityFee = printNumber(toWei(fromWei(this.props.system.tub.fee).pow(60 * 60 * 24 * 365)).times(100).minus(toWei(100)), 1, true, true);
    const padding = checkIsMobile.any ? "10px" : ""

    return (
      <div className="wizard-section" style={{marginBottom: padding}}>
        <LegacyCupsAlert setOpenMigrate={ this.props.setOpenMigrate } />
        {this.header()}
        {
          this.state.step === 1
          ?
            <React.Fragment>
              <form ref={ input => this.wizardForm = input } onSubmit={ e => { e.preventDefault(); this.goToStep(2) } }>
                {this.newCup(stabilityFee)}
              </form>
            </React.Fragment>
          :
            <React.Fragment>
              {this.confirm(stabilityFee)}
            </React.Fragment>
        }
      </div>
    )
  }
}

export default Wizard;
