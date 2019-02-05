// Libraries
import React from "react";
import {intercept} from "mobx";
import {inject, observer} from "mobx-react";
import {Link} from "react-router-dom";
import ReactGA from 'react-ga';

// Components
import InlineNotification from "./InlineNotification";
import TooltipHint from "./TooltipHint";

// Utils
import {BIGGESTUINT256, WAD, wmul, wdiv, formatNumber, toBigNumber, fromWei, toWei, min, printNumber, isAddress} from "../utils/helpers";
import * as blockchain from "../utils/blockchain";

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

@inject("profile")
@inject("system")
@inject("dialog")
@observer
class Dialog extends React.Component {
  constructor() {
    super();
    this.state = {
      submitEnabled: false,
      skr: null,
      liqPrice: toBigNumber(0),
      ratio: toBigNumber(0),
      govFeeType: "mkr",
      ownThisWallet: false,
      giveHasProxy: false,
      giveToProxy: true
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
        this.props.dialog.error = this.props.dialog.warning = "";
        this.setState({
          submitEnabled: false,
          skr: null,
          liqPrice: toBigNumber(0),
          ratio: toBigNumber(0),
          govFeeType: "mkr",
          ownThisWallet: false,
          giveHasProxy: false,
          giveToProxy: true
        });
        if (this.props.dialog.method === "wipe" && this.props.system.dai.myBalance.gt(0) && !this.props.system.gov.myBalance.gt(0)) {
          console.debug('Reporting 0 MKR balance on pay back DAI dialog');
          ReactGA.event({
            category: 'UX',
            action: 'Zero MKR balance on pay back DAI dialog'
          });
        }
      }
      return change;
    });
  }

  submitForm = e => {
    e.preventDefault();
    if (this.props.dialog.method === "shut" || this.props.dialog.method === "migrate" || this.state.submitEnabled) {
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
      if (this.props.dialog.method === "give") {
        params.giveHasProxy = this.state.giveHasProxy;
        params.giveToProxy = this.state.giveToProxy;
      }
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

  selectGiveToProxy = e => {
    this.setState({giveToProxy: e.target.checked});
  }

  selectOwnThisWallet = e => {
    this.setState({ownThisWallet: e.target.checked});
  }

  setMax = e => {
    e.preventDefault();
    let value = toBigNumber(0);
    switch(this.props.dialog.method) {
      case "wipe":
        value = min(this.props.system.dai.myBalance, this.props.system.tab(this.props.system.tub.cups[this.props.dialog.cupId]));
        break;
      case "free":
        value = wmul(this.props.system.tub.cups[this.props.dialog.cupId].avail_skr, this.props.system.tub.per).round(0);
        break;
      // case "join":
      //   value = wdiv(this.props.system.gem.myBalance, wmul(this.props.system.tub.per, this.props.system.tub.gap));
      //   break;
      // case "exit":
      // case "lock":
      //   value = this.props.system.eth.myBalance;
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
        <div className="info-heading">Current price information (ETH/USD)</div>
        <div className="info-value">{ printNumber(this.props.system.pip.val, 2) } USD</div>
        <div className="info-heading">Projected liquidation price (ETH/USD)</div>
        <div className="info-value">{ this.state.liqPrice.gt(0) ? printNumber(this.state.liqPrice, 2) : "--" } USD</div>
        <div className="info-heading">Projected collateralization ratio</div>
        <div className={ "info-value" + (this.state.ratio.gt(0) && this.state.ratio.toNumber() !== Infinity ? " text-green" : "") + (this.props.dialog.warning ? " text-yellow" : "") + (this.props.dialog.error ? " text-red" : "") }>{ this.state.ratio.gt(0) && this.state.ratio.toNumber() !== Infinity ? printNumber(this.state.ratio.times(100), 2) : "--" } %</div>
      </React.Fragment>
    )
  }

  renderNumberInput = currencyUnit => {
    return (
      <React.Fragment>
        <input autoFocus ref={ input => this.updateVal = input } type="number" id="inputValue" className={ "number-input" + (this.props.dialog.warning ? " has-warning" : "") + (this.props.dialog.error ? " has-error" : "") } required step="0.000000000000000001" onChange={ e => { this.cond(e.target.value) } } onKeyDown={ e => { if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 189) e.preventDefault() } } autoComplete="off" />
        { currencyUnit && <span className="unit">{ currencyUnit }</span> }
        <div className="clearfix"></div>
      </React.Fragment>
    )
  }

  renderFeeTypeSelector = () => {
    return (
      this.props.system.pep.val.gte(0) &&
      <React.Fragment>
        <div className="info-heading">Stability fee @{ printNumber(toWei(fromWei(this.props.system.tub.fee).pow(60 * 60 * 24 * 365)).times(100).minus(toWei(100)), 1, true, true) }%/year in MKR <TooltipHint tipKey="stability-fee" /></div>
        <div className="info-value" style={ { marginBottom: "0"} }>{ printNumber(wdiv(this.props.system.futureRap(this.props.system.tub.cups[this.props.dialog.cupId], 1200), this.props.system.pep.val)) } MKR</div>
        <div className="info-value-smaller">Your MKR balance: { printNumber(this.props.system.gov.myBalance, 3) } MKR <Link to="/help/how-do-i-get-mkr-tokens" style={ {marginLeft: "5px"} }>Get MKR</Link></div>
        <div className="fee-type-selector">
          <input type="radio" id="govFeeMkr" name="govFeeMkr" value="mkr" checked={ this.state.govFeeType === "mkr" } onChange={ this.selectGovFeeType } /><label htmlFor="govFeeMkr">Pay stability fee with MKR</label><br />
          <input type="radio" id="govFeeDai" name="govFeeDai" value="dai" checked={ this.state.govFeeType === "dai" } onChange={ this.selectGovFeeType } /><label htmlFor="govFeeDai">Pay stability fee with DAI</label>
        </div>
      </React.Fragment>
    )
  }

  render() {
    const dialog = this.props.dialog;
    const cup = dialog.cupId ? this.props.system.tub.cups[dialog.cupId] : null;

    switch(dialog.method) {
      case "migrate":
        this.cond = () => { return false };
        return (
          <DialogContent
            title={ `Migrate CDP #${dialog.cupId}` }
            text={ `Please confirm that you want to migrate CDP #${dialog.cupId} to be used in this CDP Portal. Once migrated, your CDP will no longer be accessible in the old dashboard.` }
            dialog={ this.props.dialog }
            form={
              <form ref={ input => this.updateValueForm = input } onSubmit={ this.submitForm }>
                <div style={ { marginTop: "4rem"} }>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>Cancel</button>
                  <button className="text-btn text-btn-primary" type="submit">Migrate</button>
                </div>
              </form>
            }
          />
        )

      case "give":
        this.cond = value => {
          this.setState({
            submitEnabled: false,
            giveHasProxy: false
          }, () => {
            this.props.dialog.error = "";
            if (isAddress(value)) {
              console.debug(`Checking proxy ownership of ${value}...`);
              blockchain.getProxy(value).then(proxyAddress => {
                if (proxyAddress) {
                  console.debug(`Proxy found: ${proxyAddress}`);
                  this.setState({ giveHasProxy: true, submitEnabled: true });
                } else {
                  console.debug(`No proxy found`);
                  this.setState({ giveHasProxy: false, submitEnabled: true });
                }
              });
            } else {
              this.props.dialog.error = "Invalid address entered.";
            }
          });
        };
        return (
          <DialogContent
            title={ `Move CDP #${dialog.cupId}` }
            text="Enter Ethereum address where you would like to move your CDP."
            indentedText="You may only move your CDP to an Ethereum address that you own. By clicking the box below, you (“You“) affirmatively represent that you alone own and control (i) the CDP that You will transfer, and (ii) the public Ethereum address to which it will be transferred."
            dialog={ this.props.dialog }
            form={
              <form ref={ input => this.updateValueForm = input } onSubmit={ this.submitForm }>
                <div className="input-section">
                  <input autoFocus ref={ input => this.updateVal = input } type="text" id="inputValue" className={ "address-input" + (this.props.dialog.warning ? " has-warning" : "") + (this.props.dialog.error ? " has-error" : "") } required onChange={ e => { this.cond(e.target.value) } } onKeyDown={ e => { if (e.keyCode === 38 || e.keyCode === 40) e.preventDefault() } } maxLength="42" placeholder="0x01234..." autoComplete="off" />
                  <div className="clearfix"></div>
                </div>
                <div style={ {marginTop: "0.75rem"} }>
                  <label className="checkbox-container">
                    <input type="checkbox" style={ {visibility: "initial", width: "0px"} } id="ownThisWallet" name="ownThisWallet" checked={ this.state.ownThisWallet } value="1" onChange={ this.selectOwnThisWallet } />
                    <span className="checkmark"></span>
                    I own this Ethereum address and agree to the disclaimer above
                  </label>
                </div>
                {
                  this.state.giveHasProxy &&
                  <div style={ {marginTop: "0.75rem"} }>
                    <label className="checkbox-container">
                      <input type="checkbox" style={ {visibility: "initial", width: "0px"} } id="giveToProxy" name="giveToProxy" checked={ this.state.giveToProxy } value="1" onChange={ this.selectGiveToProxy } />
                      <span className="checkmark"></span>
                      Move CDP to Ethereum's proxy address <TooltipHint tip="This address has a proxy associated with it. Checking this box will move the CDP to their proxy instead of their address directly, allowing them to manage it in the CDP Portal." />
                    </label>
                  </div>
                }
                <div className="info-section">
                  {/* <div className="transfer-cdp-id">CDP #{ dialog.cupId }</div>
                  <div className="info-heading">Dai generated</div>
                  <div className="info-value">{ printNumber(this.props.system.tab(cup), 3) } DAI</div>
                  <div className="info-heading">Liquidation price (ETH/USD)</div>
                  <div className="info-value">{ this.props.system.tub.off === false && cup.liq_price && cup.liq_price.gt(0) ? printNumber(cup.liq_price) : "--" } USD</div>
                  <div className="info-heading">Collateralization ratio</div>
                  <div className={ "info-value" + (cup.ratio.gt(0) && cup.ratio.toNumber() !== Infinity ? " text-green" : "") + (this.props.dialog.warning ? " text-yellow" : "") }>{ cup.ratio.gt(0) && cup.ratio.toNumber() !== Infinity ? printNumber(toWei(cup.ratio).times(100), 2) : "--" } %</div> */}
                  { this.renderErrors() }
                </div>
                <div>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>Cancel</button>
                  <button className="text-btn text-btn-primary" type="submit" disabled={ !this.state.submitEnabled || !this.state.ownThisWallet }>Move</button>
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
                  <button className="text-btn text-btn-primary" type="submit">Close</button>
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
            submitEnabled: false,
            skr: skrValue,
            liqPrice: this.props.system.calculateLiquidationPrice(cup.ink.add(skrValue), this.props.system.tab(cup)),
            ratio: this.props.system.calculateRatio(cup.ink.add(skrValue), this.props.system.tab(cup))
          }, () => {
            this.props.dialog.error = "";
            if (valueWei.gt(0)) {
              if (this.props.system.eth.myBalance.lt(valueWei)) {
                this.props.dialog.error = "Not enough balance to deposit this amount of ETH.";
              } else if (cup.avail_skr.round(0).add(skrValue).gt(0) && cup.avail_skr.add(skrValue).round(0).lte(toWei(0.005))) {
                this.props.dialog.error = `You are not allowed to deposit a low amount of ETH in a CDP. It needs to be higher than 0.005 PETH (${formatNumber(wmul(toBigNumber(toWei(0.005)), this.props.system.tub.per), 18)} ETH at actual price).`;
              } else {
                this.setState({submitEnabled: true});
              }
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
                  { this.renderNumberInput("ETH") }
                  <div className="peth-equiv">{ printNumber(this.state.skr) } PETH <TooltipHint tipKey="what-is-peth" /></div>
                </div>
                <div className="info-section">
                  <div className="info-heading">Current account balance</div>
                  <div className="info-value">{ printNumber(this.props.system.eth.myBalance, 2) } ETH</div>
                  { this.renderDetails() }
                  { this.renderErrors() }
                </div>
                <div>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>Cancel</button>
                  <button className="text-btn text-btn-primary" type="submit" disabled={ !this.state.submitEnabled }>Deposit</button>
                </div>
              </form>
            }
          />
        )

      case "free":
        // if (this.props.system.tub.off) {
        //   // Need to add support for this
        //   // "Are you sure you want to withdraw your available ETH?"
        //   this.setState({submitEnabled: false});
        // } else {
        this.cond = value => {
          const valueWei = toBigNumber(toWei(value));
          const skrValue = wdiv(valueWei, this.props.system.tub.per).round(0);
          this.setState({
            submitEnabled: false,
            skr: skrValue,
            liqPrice: this.props.system.calculateLiquidationPrice(cup.ink.minus(skrValue), this.props.system.tab(cup)),
            ratio: this.props.system.calculateRatio(cup.ink.minus(skrValue), this.props.system.tab(cup))
          }, () => {
            this.props.dialog.error = this.props.dialog.warning = "";
            if (valueWei.gt(0)) {
              if (cup.avail_skr.lt(skrValue)) {
                this.props.dialog.error = "This amount of ETH exceeds the maximum available to withdraw.";
              } else if (cup.ink.minus(skrValue).lte(toWei(0.005)) && !cup.avail_skr.round(0).eq(skrValue)) {
                this.props.dialog.error = `A CDP cannot be left with a dust amount lower than or equal to 0.005 PETH (${formatNumber(wmul(toBigNumber(toWei(0.005)), this.props.system.tub.per), 18)} ETH at actual price). You have to either leave more or withdraw the whole amount.`;
              } else if (valueWei.gt(0) && this.props.system.tub.off === false && cup.art.gt(0) && this.state.ratio.lt(WAD.times(2))) {
                this.props.dialog.warning = "The amount of ETH you are trying to withdraw is putting your CDP at risk.";
                this.setState({submitEnabled: true});
              } else {
                this.setState({submitEnabled: true});
              }
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
                  { this.renderNumberInput("ETH") }
                  {
                    this.props.system.tab(cup).eq(0) &&
                    <div className="set-max" style={ {float: 'right', marginLeft: '22px'} }><a href="#action" onClick={ this.setMax }>Set max</a></div>
                  }
                  <div className="peth-equiv" style={ {float: 'right'} }>{ printNumber(this.state.skr) } PETH <TooltipHint tipKey="what-is-peth" /></div>
                </div>
                <div className="info-section">
                  <div className="info-heading">Max. available to withdraw</div>
                  <div className="info-value">{ cup ? printNumber(cup.avail_eth, 3) : "--" } ETH</div>
                  { this.renderDetails() }
                  { this.renderErrors() }
                </div>
                <div>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>Cancel</button>
                  <button className="text-btn text-btn-primary" type="submit" disabled={ !this.state.submitEnabled }>Withdraw</button>
                </div>
              </form>
            }
          />
        )

      case "draw":
        this.cond = value => {
          const valueWei = toBigNumber(toWei(value));
          this.setState({
            submitEnabled: false,
            liqPrice: this.props.system.calculateLiquidationPrice(cup.ink, this.props.system.tab(cup).add(valueWei)),
            ratio: this.props.system.calculateRatio(cup.ink, this.props.system.tab(cup).add(valueWei))
          }, () => {
            this.props.dialog.error = this.props.dialog.warning = "";
            if (valueWei.gt(0)) {
              if (this.props.system.sin.totalSupply.add(valueWei).gt(this.props.system.tub.cap)) {
                this.props.dialog.error = "This amount of DAI exceeds the system debt ceiling.";
              } else if (cup.avail_dai.lt(valueWei)) {
                this.props.dialog.error = "You have insufficient collateral deposited to generate this amount of DAI. Deposit more collateral first.";
              } else if (this.state.ratio.lt(WAD.times(2))) {
                this.props.dialog.warning = "The amount of DAI you are trying to generate against the collateral is putting your CDP at risk.";
                this.setState({submitEnabled: true});
              } else {
                this.setState({submitEnabled: true});
              }
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
                  { this.renderNumberInput("DAI") }
                </div>
                <div className="info-section">
                  <div className="info-heading">Max. available to generate</div>
                  <div className="info-value">{ printNumber(this.props.system.tub.cups[this.props.dialog.cupId].avail_dai, 2) } DAI</div>
                  { this.renderDetails() }
                  { this.renderErrors() }
                </div>
                <div>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>Cancel</button>
                  <button className="text-btn text-btn-primary" type="submit" disabled={ !this.state.submitEnabled }>Generate</button>
                </div>
              </form>
            }
          />
        )

      case "wipe":
        this.cond = value => {
          const valueWei = toBigNumber(toWei(value));
          this.setState({
            submitEnabled: false,
            liqPrice: this.props.system.calculateLiquidationPrice(cup.ink, this.props.system.tab(cup).minus(valueWei)),
            ratio: this.props.system.calculateRatio(cup.ink, this.props.system.tab(cup).minus(valueWei))
          }, () => {
            this.props.dialog.error = this.props.dialog.warning = "";
            if (valueWei.gt(0)) {
              const futureGovDebtSai =  wmul(
                                          valueWei,
                                          wdiv(
                                            this.props.system.futureRap(this.props.system.tub.cups[dialog.cupId], 1200),
                                            this.props.system.tab(this.props.system.tub.cups[dialog.cupId])
                                          )
                                        ).round(0);
              const futureGovDebtMKR =  wdiv(
                                          futureGovDebtSai,
                                          this.props.system.pep.val
                                        ).round(0);
              const valuePlusGovFee = this.state.govFeeType === "dai" ? valueWei.add(futureGovDebtSai.times(1.25)) : valueWei; // If fee is paid in DAI we add an extra 25% (spread)
              if (this.props.system.dai.myBalance.lt(valuePlusGovFee)) {
                this.props.dialog.error = "You don't have enough DAI in your wallet to wipe this amount.";
              } else if (this.props.system.tab(cup).lt(valueWei)) {
                this.props.dialog.error = "You are trying to payback more DAI than the amount of DAI outstanding in your CDP.";
              } else if (this.state.govFeeType === "mkr" && futureGovDebtMKR.gt(this.props.system.gov.myBalance)) {
                this.props.dialog.error = "You don't have enough MKR in your wallet to wipe this amount.";
              } else if (this.state.ratio.lt(WAD.times(1.5))) {
                this.props.dialog.warning = "Your CDP is below the minimum collateralization ratio and currently at risk. You should payback DAI or deposit more collateral immediately.";
                this.setState({submitEnabled: true});
              } else if (this.state.ratio.lt(WAD.times(2))) {
                this.props.dialog.warning = "Even if you payback this amount of DAI, your CDP will still be at risk.";
                this.setState({submitEnabled: true});
              } else {
                this.setState({submitEnabled: true});
              }
            }
          });
        }
        const indentedText = (!this.props.system.dai.allowance.eq(BIGGESTUINT256) || !this.props.system.gov.allowance.eq(BIGGESTUINT256))
          ? "You might be requested to sign up to three transactions if there is not enough allowance in DAI and/or MKR to complete this transaction."
          : "";
        return (
          <DialogContent
            title="Payback DAI"
            text="How much DAI would you like to pay back?"
            indentedText={ indentedText }
            dialog={ this.props.dialog }
            form={
              <form ref={ input => this.updateValueForm = input } onSubmit={ this.submitForm }>
                <div className="input-section">
                  { this.renderNumberInput("DAI") }
                  <div className="set-max"><a href="#action" onClick={ this.setMax }>Set max</a></div>
                </div>
                <div className="info-section" style={ { marginTop: "2rem"} }>
                  <div className="info-heading">Outstanding Dai generated</div>
                  <div className="info-value">{ printNumber(this.props.system.tab(this.props.system.tub.cups[this.props.dialog.cupId])) } DAI</div>
                  { this.renderFeeTypeSelector() }
                  { this.renderDetails() }
                  { this.renderErrors() }
                </div>
                <div>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>Cancel</button>
                  <button className="text-btn text-btn-primary" type="submit" disabled={ !this.state.submitEnabled }>Payback</button>
                </div>
              </form>
            }
          />
        )

      default:
        return <DialogContent dialog={ this.props.dialog } />
    }
  }
}

export default Dialog;
