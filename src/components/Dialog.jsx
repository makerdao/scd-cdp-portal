import React from 'react';
import {intercept} from 'mobx';
import {observer} from 'mobx-react';
import {WAD, wmul, wdiv, formatNumber, toBigNumber, fromWei, toWei, min, printNumber} from '../helpers';

class Dialog extends React.Component {
  constructor() {
    super();
    this.state = {
      skr: null,
      liqPrice: toBigNumber(0),
      ratio: toBigNumber(0),
      warning: null,
      error: null
    }
  }

  componentDidMount = () => {
    intercept(this.props.dialog, "show", change => {
      if (change.newValue) {
        if (this.updateVal) this.updateVal.value = "";
        this.setState({
          skr: null,
          liqPrice: toBigNumber(0),
          ratio: toBigNumber(0),
          warning: null,
          error: null
        });
      }
      return change;
    });
  }

  updateValue = e => {
    e.preventDefault();
    if (this.submitEnabled) {
      const value = this.updateVal !== 'undefined' && this.updateVal && typeof this.updateVal.value !== 'undefined' ? toBigNumber(this.updateVal.value) : false;
      this.props.system.executeAction(value);
    }
  }

  setMax = e => {
    e.preventDefault();
    let value = toBigNumber(0);
    switch(this.props.dialog.method) {
      case 'join':
        value = wdiv(this.props.system.gem.myBalance, wmul(this.props.system.tub.per, this.props.system.tub.gap));
        break;
      case 'exit':
      case 'lock':
        value = this.props.profile.accountBalance;
        break;
      case 'free':
        // value = this.props.system.tub.cups[this.props.dialog.cupId].avail_skr_with_margin;
        value = wmul(this.props.system.tub.cups[this.props.dialog.cupId].avail_skr, this.props.system.tub.per).round(0);
        break;
      // case 'draw':
      //   value = this.props.system.tub.cups[this.props.dialog.cupId].avail_dai_with_margin;
      //   break;
      case 'wipe':
        value = min(this.props.system.dai.myBalance, this.props.system.tab(this.props.system.tub.cups[this.props.dialog.cupId]));
        break;
      case 'boom':
        value = this.props.system.tub.avail_boom_skr.floor();
        break;
      case 'bust':
        value = this.props.system.tub.avail_bust_skr.floor();
        break;
      case 'cash':
        value = this.props.system.dai.myBalance;
        break;
      case 'mock':
        value = wdiv(this.props.system.gem.myBalance, this.props.system.tap.fix);
        break;
      default:
        break;
    }
    document.getElementById('inputValue').value = fromWei(value).valueOf();
    this.cond(document.getElementById('inputValue').value);
  }

  renderYesNoForm = () => {
    return (
      <form>
        <p id="warningMessage" className="error">
          { this.state.error }
        </p>
        <div>
          <button className="text-btn text-btn-primary" type="submit" onClick={ this.updateValue }>Yes</button>
          <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>No</button>
        </div>
      </form>
    )
  }

  renderInputTextForm = method => {
    return this.renderInputForm('text', method);
  }

  renderInputNumberForm = method => {
    return this.renderInputForm('number', method);
  }

  renderInputForm = (type, method) => {
    return (
      <form ref={ input => this.updateValueForm = input } onSubmit={ this.updateValue }>
        <input ref={ input => this.updateVal = input } type={ type } id="inputValue" className="number-input" required step="0.000000000000000001" onChange={ e => { this.cond(e.target.value) } } />
        {
          type === 'number' &&
          <span className="unit">
            {
              ['draw', 'wipe'].indexOf(method) !== -1
              ?
                'DAI'
              :
                'ETH'
            }
          </span>
        }
        {
          type === 'number' && method !== 'draw' && (method !== 'free' || this.props.system.tub.cups[this.props.dialog.cupId].art.eq(0)) &&
          <span>&nbsp;<a href="#action" onClick={ this.setMax }>Set max</a></span>
        }
        {
          type === 'number' && (method === 'lock' || method === 'free') &&
          <span style={ {clear: 'left', display: 'block'} }>{ printNumber(this.state.skr) } PETH</span>
        }
        {
          type === 'number' && method === 'wipe' &&
          <span style={ {clear: 'left', display: 'block'} }>DAI generated { printNumber(this.props.system.tab(this.props.system.tub.cups[this.props.dialog.cupId])) } DAI</span>
        }
        {
          type === 'number' && method === 'wipe' &&
          <span style={ {clear: 'left', display: 'block'} }>
            Stability fee @{ printNumber(toWei(fromWei(this.props.system.tub.fee).pow(60 * 60 * 24 * 365)).times(100).minus(toWei(100))) }%/year in MKR&nbsp;
            { printNumber(wdiv(this.props.system.rap(this.props.system.tub.cups[this.props.dialog.cupId]), this.props.system.pep.val)) } MKR
          </span>
        }
        {
          type === 'number' && method === 'draw' &&
          <span style={ {clear: 'left', display: 'block'} }>Max. available to generate { printNumber(this.props.system.tub.cups[this.props.dialog.cupId].avail_dai) } DAI</span>
        }
        {
          type === 'number' && (method === 'lock' || method === 'free' || method === 'draw' || method === 'wipe') &&
          <span style={ {clear: 'left', display: 'block'} }>Projected liquidation price (ETH/USD)  { this.state.liqPrice.gt(0) ? printNumber(this.state.liqPrice) : '--' } USD</span>
        }
        {
          type === 'number' && (method === 'lock' || method === 'free' || method === 'draw' || method === 'wipe') &&
          <span style={ {clear: 'left', display: 'block'} }>Current price information (ETH/USD)  { printNumber(this.props.system.pip.val) } USD</span>
        }
        {
          type === 'number' && (method === 'lock' || method === 'free' || method === 'draw' || method === 'wipe') &&
          <span style={ {clear: 'left', display: 'block'} }>Projected collateralization ratio { this.state.ratio.gt(0) && this.state.ratio.toNumber() !== Infinity ? printNumber(this.state.ratio.times(100)) : '--' } %</span>
        }
        {
          this.state.error &&
          <p id="warningMessage" className="error">
            { this.state.error }
          </p>
        }
        {
          this.state.warning &&
          <p id="warningMessage" className="warning">
            { this.state.warning }
          </p>
        }
        <br />
        <div>
          <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>Cancel</button>
          <button className="text-btn text-btn-primary" type="submit">Submit</button>
        </div>
      </form>
    )
  }
  
  render() {
    const dialog = this.props.dialog;
    const cup = dialog.cupId ? this.props.system.tub.cups[dialog.cupId] : null;

    let text = '';
    let renderForm = '';
    this.cond = () => { return false };
    switch(dialog.method) {
      case 'open':
        text = 'Are you sure you want to open a new CDP?';
        renderForm = 'renderYesNoForm';
        this.submitEnabled = true;
        break;
      case 'shut':
        text = `Are you sure you want to close CDP ${dialog.cupId}?`;
        if (!this.props.proxyEnabled) {
          text += '<br />You might be requested for signing up to three transactions if there is not enough allowance in DAI and/or MKR to complete this transaction.';;
        }
        renderForm = 'renderYesNoForm';
        this.submitEnabled = true;
        break;
      case 'lock':
        text = 'How much ETH would you like to deposit?';
        renderForm = 'renderInputNumberForm';
        this.cond = value => {
          const valueWei = toBigNumber(toWei(value));
          const skrValue = wdiv(valueWei, this.props.system.tub.per).round(0);
          this.setState({
                          skr: skrValue,
                          liqPrice: this.props.system.calculateLiquidationPrice(cup.ink.add(skrValue), this.props.system.tab(cup)),
                          ratio: this.props.system.calculateRatio(cup.ink.add(skrValue), this.props.system.tab(cup))
                        }, () => {
                          let error = '';
                          this.submitEnabled = true;
                          if (this.props.profile.accountBalance.lt(valueWei)) {
                            error = 'Not enough balance to deposit this amount of ETH.';
                            this.submitEnabled = false;
                          } else if (cup.avail_skr.round(0).add(skrValue).gt(0) && cup.avail_skr.add(skrValue).round(0).lte(toWei(0.005))) {
                            error = `It is not allowed to deposit a low amount of ETH in a CDP. It needs to be higher than 0.005 PETH (${formatNumber(wmul(toBigNumber(toWei(0.005)), this.props.system.tub.per), 18)} ETH at actual price).`;
                            this.submitEnabled = false;
                          }
                          this.setState({error});
                        });
        }
        break;
      case 'free':
        if (this.props.system.tub.off) {
          text = `Are you sure you want to withdraw your available ETH?`;
          renderForm = 'renderYesNoForm';
          this.submitEnabled = true;
        } else {
          text = 'How much ETH would you like to withdraw?';
          renderForm = 'renderInputNumberForm';
          this.cond = value => {
            const valueWei = toBigNumber(toWei(value));
            const skrValue = wdiv(valueWei, this.props.system.tub.per).round(0);
            this.setState({
                            skr: skrValue,
                            liqPrice: this.props.system.calculateLiquidationPrice(cup.ink.minus(skrValue), this.props.system.tab(cup)),
                            ratio: this.props.system.calculateRatio(cup.ink.minus(skrValue), this.props.system.tab(cup))
                          }, () => {
                            let error = '';
                            let warning = '';
                            this.submitEnabled = true;
                            if (cup.avail_skr.lt(skrValue)) {
                              error = 'This amount of ETH exceeds the maximum available to withdraw.';
                              this.submitEnabled = false;
                            } else if (cup.avail_skr.minus(skrValue).lte(toWei(0.005)) && !cup.avail_skr.round(0).eq(skrValue)) {
                              error = `CDP can not be left with a dust amount lower or equal than 0.005 PETH (${formatNumber(wmul(toBigNumber(toWei(0.005)), this.props.system.tub.per), 18)} ETH at actual price). You have to either leave more or withdraw the whole amount.`;
                              this.submitEnabled = false;
                            } else if (this.props.system.tub.off === false && cup.art.gt(0) && this.state.ratio.lt(WAD.times(2))) {
                              warning = 'The amount of ETH you are trying to withdraw is putting your CDP at risk.';
                            }
                            this.setState({error, warning});
                          });
          }
        }
        break;
      case 'draw':
        text = 'How much DAI would you like to generate?';
        renderForm = 'renderInputNumberForm';
        this.cond = value => {
          const valueWei = toBigNumber(toWei(value));
          this.setState({
                          liqPrice: this.props.system.calculateLiquidationPrice(cup.ink, this.props.system.tab(cup).add(valueWei)),
                          ratio: this.props.system.calculateRatio(cup.ink, this.props.system.tab(cup).add(valueWei))
                        }, () => {
                          let error = '';
                          let warning = '';
                          this.submitEnabled = true;
                          if (this.props.system.sin.totalSupply.add(valueWei).gt(this.props.system.tub.cap)) {
                            error = 'This amount of DAI exceeds the system debt ceiling.';
                            this.submitEnabled = false;
                          } else if (cup.avail_dai.lt(valueWei)) {
                            error = 'You have insufficient amount of DAI available to generate. Deposit more collateral first.';
                            this.submitEnabled = false;
                          } else if (this.state.ratio.lt(WAD.times(2))) {
                            warning = 'The amount of DAI you are trying to generate against the collateral is putting your CDP at risk.';
                          }
                          this.setState({error, warning});
                        });
        }
        break;
      case 'wipe':
        text = 'How much DAI would you like to pay back?';
        text += '<br />You might be requested for signing up to three transactions if there is not enough allowance in DAI and/or MKR to complete this transaction.';
        renderForm = 'renderInputNumberForm';
        this.cond = value => {
          const valueWei = toBigNumber(toWei(value));
          this.setState({
            liqPrice: this.props.system.calculateLiquidationPrice(cup.ink, this.props.system.tab(cup).minus(valueWei)),
            ratio: this.props.system.calculateRatio(cup.ink, this.props.system.tab(cup).minus(valueWei))
          }, () => {
            let error = '';
            this.submitEnabled = true;
            if (this.props.system.dai.myBalance.lt(valueWei)) {
              error = 'Not enough balance of DAI to wipe this amount.';
              this.submitEnabled = false;
            } else if (this.props.system.tab(cup).lt(valueWei)) {
              error = `Debt in CDP ${dialog.cupId} is lower than this amount of DAI.`;
              this.submitEnabled = false;
            } else {
              const futureGovFee = fromWei(wdiv(this.props.system.tub.fee, this.props.system.tub.tax)).pow(180).round(0); // 3 minutes of future fee
              const govDebt = wmul(
                                wmul(
                                  wmul(
                                    valueWei,
                                    wdiv(
                                      this.props.system.rap(cup),
                                      this.props.system.tab(cup)
                                    )
                                  ),
                                  this.props.system.pep.val
                                ),
                                futureGovFee
                              );
              if (govDebt.gt(this.props.system.gov.myBalance)) {
                error = `Not enough balance of MKR to wipe this amount.`;
                this.submitEnabled = false;
              }
            }
            this.setState({error});
          });
        }
        break;
      case 'give':
        text = `Please set the new address to be owner of CDP ${dialog.cupId}`;
        renderForm = 'renderInputTextForm';
        this.submitEnabled = true;
        break;
      case 'migrate':
        text = `Are you sure you want to migrate your CDP ${dialog.cupId} for being used in this Dashboard? (you will not be able to use it in the old one anymore)`;
        renderForm = 'renderYesNoForm';
        this.submitEnabled = true;
        break;
      default:
        break;
    }

    return (
      <div id="dialog" className="dialog bright-style">
        <button id="dialog-close-caller" className="close-box" onClick={ this.props.dialog.handleCloseDialog }></button>
        <div className="dialog-content">
          <h2 className="typo-h1" style={ {textTransform: 'capitalize'} }>
            {
              dialog.method === 'lock' &&
              <React.Fragment>Deposit collateral</React.Fragment>
            }
            {
              dialog.method === 'free' &&
              <React.Fragment>Withdraw collateral</React.Fragment>
            }
            {
              dialog.method === 'draw' &&
              <React.Fragment>Generate DAI</React.Fragment>
            }
            {
              dialog.method === 'wipe' &&
              <React.Fragment>Payback DAI</React.Fragment>
            }
          </h2>
          <div>
            <fieldset>
              <label htmlFor="lend-sai" className="typo-h3" dangerouslySetInnerHTML={ {__html: text} }></label>
              { renderForm ? this[renderForm](dialog.method) : '' }
            </fieldset>
          </div>
        </div>
      </div>
    )
  }
}

export default observer(Dialog);
