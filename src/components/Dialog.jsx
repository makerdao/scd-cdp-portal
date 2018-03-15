import React, {Component} from 'react';
import web3 from  '../web3';
import {wmul, wdiv, formatNumber} from '../helpers';

class Dialog extends Component {
  constructor() {
    super();
    this.state = {
      message: ''
    }
  }

  updateValue = e => {
    e.preventDefault();
    if (this.submitEnabled) {
      const value = this.updateVal !== 'undefined' && this.updateVal && typeof this.updateVal.value !== 'undefined' ? web3.toBigNumber(this.updateVal.value) : false;
      this.props.executeAction(value);
    }
  }

  setMax = e => {
    e.preventDefault();
    let value = web3.toBigNumber(0);
    switch(this.props.dialog.method) {
      case 'join':
        value = wdiv(this.props.system.gem.myBalance, wmul(this.props.system.tub.per, this.props.system.tub.gap));
        break;
      case 'exit':
      case 'lock':
        value = this.props.profile.accountBalance;
        break;
      case 'free':
        // value = this.props.system.tub.cups[this.props.dialog.cup].avail_skr_with_margin;
        value = wmul(this.props.system.tub.cups[this.props.dialog.cup].avail_skr, this.props.system.tub.per).round(0);
        break;
      // case 'draw':
      //   value = this.props.system.tub.cups[this.props.dialog.cup].avail_dai_with_margin;
      //   break;
      case 'wipe':
        value = web3.BigNumber.min(this.props.system.dai.myBalance, this.props.tab(this.props.system.tub.cups[this.props.dialog.cup]));
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
    document.getElementById('inputValue').value = web3.fromWei(value).valueOf();
    this.cond(document.getElementById('inputValue').value);
  }

  renderYesNoForm = () => {
    return (
      <form>
        <p id="warningMessage" className="error">
          { this.props.dialog.error }
        </p>
        <div>
          <button className="text-btn text-btn-primary" type="submit" onClick={ this.updateValue }>Yes</button>
          <button className="text-btn" type="submit" onClick={ this.props.handleCloseDialog }>No</button>
        </div>
      </form>
    )
  }

  renderInputTextForm = (method) => {
    return this.renderInputForm('text', method);
  }

  renderInputNumberForm = (method) => {
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
          type === 'number' && method !== 'draw' && (method !== 'free' || this.props.system.tub.cups[this.props.dialog.cup].art.eq(0))
          ? <span>&nbsp;<a href="#action" onClick={ this.setMax }>Set max</a></span>
          : ''
        }
        <p id="warningMessage" className="error">
          { this.props.dialog.error }
        </p>
        <br />
        <div>
          <button className="text-btn" type="submit" onClick={ this.props.handleCloseDialog }>Cancel</button>
          <button className="text-btn text-btn-primary" type="submit">Submit</button>
        </div>
      </form>
    )
  }
  
  render() {
    const dialog = this.props.dialog;

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
        text = `Are you sure you want to close CDP ${dialog.cup}?`;
        if (!this.props.proxyEnabled) {
          text += '<br />You might be requested for signing up to three transactions if there is not enough allowance in DAI and/or MKR to complete this transaction.';;
        }
        renderForm = 'renderYesNoForm';
        this.submitEnabled = true;
        break;
      case 'lock':
        text = `Please set amount of collateral (ETH) you want to lock in CDP ${dialog.cup}.`;
        renderForm = 'renderInputNumberForm';
        this.cond = (value) => {
          const valueWei = web3.toBigNumber(web3.toWei(value));
          const skrValue = wdiv(valueWei, this.props.system.tub.per).round(0);
          let error = '';
          this.submitEnabled = true;
          const cup = this.props.dialog.cup;
          if (this.props.profile.accountBalance.lt(valueWei)) {
            error = 'Not enough balance to lock this amount of ETH.';
            this.submitEnabled = false;
          } else if (this.props.system.tub.cups[cup].avail_skr.round(0).add(skrValue).gt(0) && this.props.system.tub.cups[cup].avail_skr.add(skrValue).round(0).lte(web3.toWei(0.005))) {
            error = `It is not allowed to lock a low amount of ETH in a CDP. It needs to be higher than 0.005 PETH (${formatNumber(wmul(web3.toBigNumber(web3.toWei(0.005)), this.props.system.tub.per), 18)} ETH at actual price).`;
            this.submitEnabled = false;
          }
          document.getElementById('warningMessage').innerHTML = error;
        }
        break;
      case 'free':
        if (this.props.system.tub.off) {
          text = `Are you sure you want to free your available ETH from CUP ${dialog.cup}?`;
          renderForm = 'renderYesNoForm';
          this.submitEnabled = true;
        } else {
          text = `Please set amount of collateral (ETH) you want to withdraw from CDP ${dialog.cup}`;
          renderForm = 'renderInputNumberForm';
          this.cond = (value) => {
            const valueWei = web3.toBigNumber(web3.toWei(value));
            const skrValue = wdiv(valueWei, this.props.system.tub.per).round(0);
            const cup = this.props.dialog.cup;
            let error = '';
            this.submitEnabled = true;
            if (this.props.system.tub.cups[cup].avail_skr.lt(skrValue)) {
              error = 'This amount of ETH exceeds the maximum available to free.';
              this.submitEnabled = false;
            } else if (this.props.system.tub.cups[cup].avail_skr.minus(skrValue).lte(web3.toWei(0.005)) && !this.props.system.tub.cups[cup].avail_skr.round(0).eq(skrValue)) {
              error = 'CDP can not be left with a dust amount lower or equal than 0.005 PETH. You have to either leave more or free the whole amount.';
              this.submitEnabled = false;
            } else if (this.props.system.tub.off === false && this.props.system.tub.cups[cup].art.gt(0) && skrValue.gt(this.props.system.tub.cups[cup].avail_skr.times(0.9))) {
              error = 'This amount puts your CDP in risk to be liquidated';
            }
            document.getElementById('warningMessage').innerHTML = error;
          }
        }
        break;
      case 'draw':
        text = `Please set amount of DAI you want to mint from your CDP ${dialog.cup}`;
        renderForm = 'renderInputNumberForm';
        this.cond = (value) => {
          const valueWei = web3.toBigNumber(web3.toWei(value));
          const cup = this.props.dialog.cup;
          let error = '';
          this.submitEnabled = true;
          if (this.props.system.sin.totalSupply.add(valueWei).gt(this.props.system.tub.cap)) {
            error = 'This amount of DAI exceeds the system debt ceiling.';
            this.submitEnabled = false;
          } else if (this.props.system.tub.cups[cup].avail_dai.lt(valueWei)) {
            error = 'This amount of DAI exceeds the maximum available to draw.';
            this.submitEnabled = false;
          } else if (valueWei.gt(this.props.system.tub.cups[cup].avail_dai.times(0.9))) {
            error = 'This amount puts your CDP in risk to be liquidated';
          }
          document.getElementById('warningMessage').innerHTML = error;
        }
        break;
      case 'wipe':
        text = `Please set amount of DAI you want to retrieve to CDP ${dialog.cup}.`;
        text += '<br />You might be requested for signing up to three transactions if there is not enough allowance in DAI and/or MKR to complete this transaction.';
        renderForm = 'renderInputNumberForm';
        this.cond = (value) => {
          const valueWei = web3.toBigNumber(web3.toWei(value));
          const cup = this.props.dialog.cup;
          let error = '';
          this.submitEnabled = true;
          if (this.props.system.dai.myBalance.lt(valueWei)) {
            error = 'Not enough balance of DAI to wipe this amount.';
            this.submitEnabled = false;
          } else if (this.props.tab(this.props.system.tub.cups[cup]).lt(valueWei)) {
            error = `Debt in CDP ${cup} is lower than this amount of DAI.`;
            this.submitEnabled = false;
          } else {
            const futureGovFee = web3.fromWei(wdiv(this.props.system.tub.fee, this.props.system.tub.tax)).pow(180).round(0); // 3 minutes of future fee
            const govDebt = wmul(
                              wmul(
                                wmul(
                                  valueWei,
                                  wdiv(
                                    this.props.rap(this.props.system.tub.cups[cup]),
                                    this.props.tab(this.props.system.tub.cups[cup])
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
          document.getElementById('warningMessage').innerHTML = error;
        }
        break;
      case 'give':
        text = `Please set the new address to be owner of CDP ${dialog.cup}`;
        renderForm = 'renderInputTextForm';
        this.submitEnabled = true;
        break;
      case 'migrate':
        text = `Are you sure you want to migrate your CDP ${dialog.cup} for being used in this Dashboard? (you will not be able to use it in the old one anymore)`;
        renderForm = 'renderYesNoForm';
        this.submitEnabled = true;
        break;
      default:
        break;
    }

    return (
      <div id="dialog" className="dialog bright-style">
        <button id="dialog-close-caller" className="close-box" onClick={ this.props.handleCloseDialog }></button>
        <div className="dialog-content">
          <h2 className="typo-h1" style={ {textTransform: 'capitalize'} }>{ dialog.method }</h2>
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

export default Dialog;
