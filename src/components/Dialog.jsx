// Libraries
import React from "react";
import {intercept} from "mobx";
import {inject, observer} from "mobx-react";

// Components
import InlineNotification from "./InlineNotification";
import TooltipHint from "./TooltipHint";

// Utils
import {WAD, wmul, wdiv, formatNumber, toBigNumber, fromWei, toWei, min, printNumber} from "../utils/helpers";

class DialogContent extends React.Component {
  render() {
    return (
      <div id="dialog" className="dialog bright-style">
        <button id="dialog-close-caller" className="close-box" onClick={ this.props.dialog.handleCloseDialog }></button>
        <div className="dialog-content">
          <h2 className="typo-h1">{ this.props.title }</h2>
          { this.props.indentedText && <p className="indented-text" dangerouslySetInnerHTML={ {__html: this.props.indentedText} }></p> }
          { this.props.text && <p className="main-text" dangerouslySetInnerHTML={ {__html: this.props.text} }></p> }
          { this.props.form ? this.props.form : "" }
        </div>
      </div>
    )
  }
}

class Dialog extends React.Component {
  constructor() {
    super();
    this.state = {
      skr: null,
      liqPrice: toBigNumber(0),
      ratio: toBigNumber(0),
      govFeeType: "mkr",
    }
  }

  componentDidUpdate = () => {
    TooltipHint.rebuildTooltips();
  }

  componentDidMount = () => {
    intercept(this.props.dialog, "show", change => {
      if (change.newValue) {
        if (this.updateVal) {
          this.updateVal.value = "";
          this.updateVal.focus();
        }
        this.submitEnabled = true;
        this.props.dialog.error = this.props.dialog.warning = "";
        this.setState({
          skr: null,
          liqPrice: toBigNumber(0),
          ratio: toBigNumber(0),
          govFeeType: "mkr",
        });
      }
      return change;
    });
  }

  submitForm = e => {
    e.preventDefault();
    if (this.submitEnabled) {
      const value = this.updateVal && typeof this.updateVal.value !== "undefined"
                    ?
                      this.props.dialog.method !== "give"
                      ?
                        toBigNumber(this.updateVal.value)
                      :
                        this.updateVal.value
                    :
                      false;
      const params = { value };
      if (["wipe", "shut"].indexOf(this.props.dialog.method) !== -1) {
        params.govFeeType = this.state.govFeeType;
      }
      this.props.system.executeAction(params);
    }
  }

  selectGovFeeType = e => {
    this.setState({govFeeType: e.target.value}, () => {
      this.props.dialog.error = this.props.dialog.warning = "";
      if (this.updateVal !== "undefined" && this.updateVal && typeof this.updateVal.value !== "undefined") {
        this.cond(this.updateVal.value);
      }
    });
  }

  setMax = e => {
    e.preventDefault();
    let value = toBigNumber(0);
    switch(this.props.dialog.method) {
      case "wipe":
        value = min(this.props.system.dai.myBalance, this.props.system.tab(this.props.system.tub.cups[this.props.dialog.cupId]));
        break;
      // case "join":
      //   value = wdiv(this.props.system.gem.myBalance, wmul(this.props.system.tub.per, this.props.system.tub.gap));
      //   break;
      // case "exit":
      // case "lock":
      //   value = this.props.profile.accountBalance;
      //   break;
      // case "free":
      //  value = this.props.system.tub.cups[this.props.dialog.cupId].avail_skr_with_margin;
      //  value = wmul(this.props.system.tub.cups[this.props.dialog.cupId].avail_skr, this.props.system.tub.per).round(0);
      //  break;
      // case "draw":
      //   value = this.props.system.tub.cups[this.props.dialog.cupId].avail_dai_with_margin;
      //   break;
      // case "boom":
      //   value = this.props.system.tub.avail_boom_skr.floor();
      //   break;
      // case "bust":
      //   value = this.props.system.tub.avail_bust_skr.floor();
      //   break;
      // case "cash":
      //   value = this.props.system.dai.myBalance;
      //   break;
      // case "mock":
      //   value = wdiv(this.props.system.gem.myBalance, this.props.system.tap.fix);
      //   break;
      default:
        break;
    }
    document.getElementById("inputValue").value = fromWei(value).valueOf();
    this.cond(document.getElementById("inputValue").value);
  }

  renderErrors = () => {
    return (
      <React.Fragment>
      { this.props.dialog.error && <InlineNotification type="error" message={ this.props.dialog.error } /> }
      { this.props.dialog.warning && <InlineNotification type="warning" message={ this.props.dialog.warning } /> }
      </React.Fragment>
    )
  }

  renderDetails = () => {
    return (
      <React.Fragment>
        <div className="info-heading">Projected liquidation price (ETH/USD)</div>
        <div className="info-value">{ this.state.liqPrice.gt(0) ? printNumber(this.state.liqPrice, 2) : "--" } USD</div>
        <div className="info-heading">Current price information (ETH/USD)</div>
        <div className="info-value">{ printNumber(this.props.system.pip.val, 2) } USD</div>
        <div className="info-heading">Projected collateralization ratio</div>
        <div className={ "info-value" + (this.state.ratio.gt(0) && this.state.ratio.toNumber() !== Infinity ? " text-green" : "") + (this.props.dialog.warning ? " text-yellow" : "") + (this.props.dialog.error ? " text-red" : "") }>{ this.state.ratio.gt(0) && this.state.ratio.toNumber() !== Infinity ? printNumber(this.state.ratio.times(100), 2) : "--" } %</div>
      </React.Fragment>
    )
  }

  renderNumberInput = currencyUnit => {
    return (
      <React.Fragment>
        <input autoFocus ref={ input => this.updateVal = input } type="number" id="inputValue" className={ "number-input" + (this.props.dialog.warning ? " has-warning" : "") + (this.props.dialog.error ? " has-error" : "") } required step="0.000000000000000001" onChange={ e => { this.cond(e.target.value) } } onKeyDown={ e => { if (e.keyCode === 38 || e.keyCode === 40) e.preventDefault() } } autoComplete="off" />
        { currencyUnit && <span className="unit">{ currencyUnit }</span> }
        <div className="clearfix"></div>
      </React.Fragment>
    )
  }

  renderAddressInput = () => {
    return (
      <React.Fragment>
        <input autoFocus ref={ input => this.updateVal = input } type="text" id="inputValue" className={ "address-input" + (this.props.dialog.warning ? " has-warning" : "") + (this.props.dialog.error ? " has-error" : "") } required onChange={ e => { this.cond(e.target.value) } } onKeyDown={ e => { if (e.keyCode === 38 || e.keyCode === 40) e.preventDefault() } } maxLength="42" placeholder="0x01234..." autoComplete="off" />
        <div className="clearfix"></div>
      </React.Fragment>
    )
  }

  renderFeeTypeSelector = () => {
    return (
      this.props.system.pep.val.gte(0) &&
      <React.Fragment>
        <div className="info-heading">Stability fee @{ printNumber(toWei(fromWei(this.props.system.tub.fee).pow(60 * 60 * 24 * 365)).times(100).minus(toWei(100))) }%/year in MKR <TooltipHint tip="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." /></div>
        <div className="info-value" style={ { marginBottom: '0'} }>{ printNumber(wdiv(this.props.system.rap(this.props.system.tub.cups[this.props.dialog.cupId]), this.props.system.pep.val)) } MKR</div>
        <div className="info-value-smaller">Your MKR balance: { printNumber(this.props.system.gov.myBalance, 3) } MKR <a href="#action" style={ {marginLeft: '5px'} }>Get MKR</a></div>
        <div className="fee-type-selector">
          <input type="radio" id="govFeeMkr" name="govFeeMkr" value="mkr" checked={ this.state.govFeeType === "mkr" } onChange={ this.selectGovFeeType } /><label htmlFor="govFeeMkr">Pay Gov Fee with MKR</label><br />
          <input type="radio" id="govFeeDai" name="govFeeDai" value="dai" checked={ this.state.govFeeType === "dai" } onChange={ this.selectGovFeeType } /><label htmlFor="govFeeDai">Pay Gov Fee with DAI <span>(via Oasisdex best offer)</span></label>
        </div>
      </React.Fragment>
    )
  }

  render() {
    const dialog = this.props.dialog;
    const cup = dialog.cupId ? this.props.system.tub.cups[dialog.cupId] : null;

    switch(dialog.method) {
      case "give":
        this.cond = () => { return false };
        return (
          <DialogContent
            title={ `Transfer CDP #${dialog.cupId}` }
            text="Enter the address where you would like to transfer your CDP."
            indentedText="Transferring ownership to an address which you do not control will result in loss of funds."
            dialog={ this.props.dialog }
            form={
              <form ref={ input => this.updateValueForm = input } onSubmit={ this.submitForm }>
                <div className="input-section">
                  { this.renderAddressInput() }
                </div>
                <div className="info-section">
                  { this.renderErrors() }
                </div>
                <div>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>Cancel</button>
                  <button className="text-btn text-btn-primary" type="submit" disabled={ !this.submitEnabled }>Transfer</button>
                </div>
              </form>
            }
          />
        )

      case "shut":
        this.cond = () => { return false };
        return (
          <DialogContent
            title={ `Close CDP #${dialog.cupId}` }
            text="Closing your CDP requires paying back your outstanding Dai debt, as well as the accumulated stability fee. The stability fee can be paid in either DAI or MKR."
            dialog={ this.props.dialog }
            form={
              <form ref={ input => this.updateValueForm = input } onSubmit={ this.submitForm }>
                <div className="info-section">
                  <div className="info-heading">Outstanding Dai generated</div>
                  <div className="info-value">{ printNumber(this.props.system.tab(cup), 3) } DAI</div>
                  { cup && cup.art.gt(0) && this.renderFeeTypeSelector() }
                  {/* <div className="info-heading">Total Closing Payment</div>
                  <div className="info-value">{ printNumber(this.props.system.tab(cup), 3) } + 0.00 MKR</div> */}
                  { this.renderErrors() }
                </div>
                <div>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>Cancel</button>
                  <button className="text-btn text-btn-primary" type="submit" disabled={ !this.submitEnabled }>Close</button>
                </div>
              </form>
            }
          />
        )

      case "lock":
        this.cond = value => {
          const valueWei = toBigNumber(toWei(value));
          const skrValue = wdiv(valueWei, this.props.system.tub.per).round(0);
          this.setState({
            skr: skrValue,
            liqPrice: this.props.system.calculateLiquidationPrice(cup.ink.add(skrValue), this.props.system.tab(cup)),
            ratio: this.props.system.calculateRatio(cup.ink.add(skrValue), this.props.system.tab(cup))
          }, () => {
            this.props.dialog.error = ""
            this.submitEnabled = true;
            if (this.props.profile.accountBalance.lt(valueWei)) {
              this.props.dialog.error = "Not enough balance to deposit this amount of ETH.";
              this.submitEnabled = false;
            } else if (cup.avail_skr.round(0).add(skrValue).gt(0) && cup.avail_skr.add(skrValue).round(0).lte(toWei(0.005))) {
              this.props.dialog.error = `You are not allowed to deposit a low amount of ETH in a CDP. It needs to be higher than 0.005 PETH (${formatNumber(wmul(toBigNumber(toWei(0.005)), this.props.system.tub.per), 18)} ETH at actual price).`;
              this.submitEnabled = false;
            }
          });
        }
        return (
          <DialogContent
            title="Deposit Collateral"
            text="How much ETH would you like to deposit?"
            dialog={ this.props.dialog }
            form={
              <form ref={ input => this.updateValueForm = input } onSubmit={ this.submitForm }>
                <div className="input-section">
                  { this.renderNumberInput('ETH') }
                  <div className="peth-equiv">{ printNumber(this.state.skr) } PETH <TooltipHint tip="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." /></div>
                </div>
                <div className="info-section">
                  { this.renderDetails() }
                  { this.renderErrors() }
                </div>
                <div>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>Cancel</button>
                  <button className="text-btn text-btn-primary" type="submit" disabled={ !this.submitEnabled }>Deposit</button>
                </div>
              </form>
            }
          />
        )

      case "free":
        // if (this.props.system.tub.off) {
        //   // Need to add support for this
        //   // 'Are you sure you want to withdraw your available ETH?'
        //   this.submitEnabled = false;
        // } else {
        this.cond = value => {
          const valueWei = toBigNumber(toWei(value));
          const skrValue = wdiv(valueWei, this.props.system.tub.per).round(0);
          this.setState({
            skr: skrValue,
            liqPrice: this.props.system.calculateLiquidationPrice(cup.ink.minus(skrValue), this.props.system.tab(cup)),
            ratio: this.props.system.calculateRatio(cup.ink.minus(skrValue), this.props.system.tab(cup))
          }, () => {
            this.props.dialog.error = this.props.dialog.warning = "";
            this.submitEnabled = true;
            if (cup.avail_skr.lt(skrValue)) {
              this.props.dialog.error = "This amount of ETH exceeds the maximum available to withdraw.";
              this.submitEnabled = false;
            } else if (cup.avail_skr.minus(skrValue).lte(toWei(0.005)) && !cup.avail_skr.round(0).eq(skrValue)) {
              this.props.dialog.error = `A CDP cannot be left with a dust amount lower than or equal to 0.005 PETH (${formatNumber(wmul(toBigNumber(toWei(0.005)), this.props.system.tub.per), 18)} ETH at actual price). You have to either leave more or withdraw the whole amount.`;
              this.submitEnabled = false;
            } else if (this.props.system.tub.off === false && cup.art.gt(0) && this.state.ratio.lt(WAD.times(2))) {
              this.props.dialog.warning = "The amount of ETH you are trying to withdraw is putting your CDP at risk.";
            }
          });
        }
        // }
        return (
          <DialogContent
            title="Withdraw Collateral"
            text="How much ETH would you like to withdraw?"
            dialog={ this.props.dialog }
            form={
              <form ref={ input => this.updateValueForm = input } onSubmit={ this.submitForm }>
                <div className="input-section">
                  { this.renderNumberInput('ETH') }
                  <div className="peth-equiv">{ printNumber(this.state.skr) } PETH <TooltipHint tip="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." /></div>
                </div>
                <div className="info-section">
                  { this.renderDetails() }
                  { this.renderErrors() }
                </div>
                <div>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>Cancel</button>
                  <button className="text-btn text-btn-primary" type="submit" disabled={ !this.submitEnabled }>Withdraw</button>
                </div>
              </form>
            }
          />
        )

      case "draw":
        this.cond = value => {
          const valueWei = toBigNumber(toWei(value));
          this.setState({
            liqPrice: this.props.system.calculateLiquidationPrice(cup.ink, this.props.system.tab(cup).add(valueWei)),
            ratio: this.props.system.calculateRatio(cup.ink, this.props.system.tab(cup).add(valueWei))
          }, () => {
            this.submitEnabled = true;
            this.props.dialog.error = this.props.dialog.warning = ""
            if (this.props.system.sin.totalSupply.add(valueWei).gt(this.props.system.tub.cap)) {
              this.props.dialog.error = "This amount of DAI exceeds the system debt ceiling.";
              this.submitEnabled = false;
            } else if (cup.avail_dai.lt(valueWei)) {
              this.props.dialog.error = "You have insufficient collateral deposited to generate this amount of DAI. Deposit more collateral first.";
              this.submitEnabled = false;
            } else if (this.state.ratio.lt(WAD.times(2))) {
              this.props.dialog.warning = "The amount of DAI you are trying to generate against the collateral is putting your CDP at risk.";
            }
          });
        }
        return (
          <DialogContent
            title="Generate DAI"
            text="How much DAI would you like to generate?"
            dialog={ this.props.dialog }
            form={
              <form ref={ input => this.updateValueForm = input } onSubmit={ this.submitForm }>
                <div className="input-section">
                  { this.renderNumberInput('DAI') }
                </div>
                <div className="info-section">
                  <div className="info-heading">Max. available to generate</div>
                  <div className="info-value">{ printNumber(this.props.system.tub.cups[this.props.dialog.cupId].avail_dai, 2) } DAI</div>
                  { this.renderDetails() }
                  { this.renderErrors() }
                </div>
                <div>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>Cancel</button>
                  <button className="text-btn text-btn-primary" type="submit" disabled={ !this.submitEnabled }>Generate</button>
                </div>
              </form>
            }
          />
        )

      case "wipe":
        this.cond = value => {
          const valueWei = toBigNumber(toWei(value));
          this.setState({
            liqPrice: this.props.system.calculateLiquidationPrice(cup.ink, this.props.system.tab(cup).minus(valueWei)),
            ratio: this.props.system.calculateRatio(cup.ink, this.props.system.tab(cup).minus(valueWei))
          }, () => {
            this.props.dialog.error = "";
            this.submitEnabled = true;
            const futureGovFee = fromWei(this.props.system.tub.fee).pow(180).round(0); // 3 minutes of future fee
            const govDebtSai = wmul(wmul(valueWei,wdiv(this.props.system.rap(cup), this.props.system.tab(cup))), futureGovFee);
            const govDebtGov = wmul(govDebtSai, this.props.system.pep.val);
            const valuePlusGovFee = this.state.govFeeType === "dai" ? valueWei.add(govDebtSai.times(1.25)) : valueWei; // If fee is paid in DAI we add an extra 25% (spread)
            if (this.props.system.dai.myBalance.lt(valuePlusGovFee)) {
              this.props.dialog.error = "You don't have enough DAI in your wallet to wipe this amount.";
              this.submitEnabled = false;
            } else if (this.props.system.tab(cup).lt(valueWei)) {
              this.props.dialog.error = `The amount of DAI generated in your CDP ${dialog.cupId} is lower than this amount of DAI.`;
              this.submitEnabled = false;
            } else if (this.state.govFeeType === "mkr" && govDebtGov.gt(this.props.system.gov.myBalance)) {
              this.props.dialog.error = `You don't have enough MKR in your wallet to wipe this amount.`;
              this.submitEnabled = false;
            }
          });
        }
        return (
          <DialogContent
            title="Payback DAI"
            text="How much DAI would you like to pay back?"
            indentedText="You might be requested for signing up to three transactions if there is not enough allowance in DAI and/or MKR to complete this transaction."
            dialog={ this.props.dialog }
            form={
              <form ref={ input => this.updateValueForm = input } onSubmit={ this.submitForm }>
                <div className="input-section">
                  { this.renderNumberInput('DAI') }
                  <div className="set-max"><a href="#action" onClick={ this.setMax }>Set max</a></div>
                </div>
                <div className="info-section" style={ { marginTop: '2rem'} }>
                  <div className="info-heading">Outstanding Dai generated</div>
                  <div className="info-value">{ printNumber(this.props.system.tab(this.props.system.tub.cups[this.props.dialog.cupId])) } DAI</div>
                  { this.renderFeeTypeSelector() }
                  { this.renderDetails() }
                  { this.renderErrors() }
                </div>
                <div>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>Cancel</button>
                  <button className="text-btn text-btn-primary" type="submit" disabled={ !this.submitEnabled }>Payback</button>
                </div>
              </form>
            }
          />
        )

      default:
        return <DialogContent title="Unsupported dialog" dialog={ this.props.dialog } />
    }
  }
}

export default inject("profile")(inject("system")(inject("dialog")(observer(Dialog))));
