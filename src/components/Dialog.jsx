import React, {Component} from 'react';
import web3 from  '../web3';
import {wmul, wdiv} from '../helpers';

class Dialog extends Component {
  constructor() {
    super();
    this.state = {
      message: ''
    }
  }

  updateValue = e => {
    e.preventDefault();
    const value = this.updateVal !== 'undefined' && this.updateVal && typeof this.updateVal.value !== 'undefined' ? this.updateVal.value : false;
    const token = this.token !== 'undefined' && this.token && typeof this.token.value !== 'undefined' ? this.token.value : false;

    if (this.submitEnabled) {
      this.props.updateValue(value, token);
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
        value = this.props.system.skr.myBalance;
        break;
      case 'free':
        value = this.props.system.tub.cups[this.props.dialog.cup].avail_skr_with_margin;
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
        <div className="yesno">
          <button type="submit" onClick={ e => this.updateValue(e) }>Yes</button>
          <button type="submit" onClick={ e => this.props.handleClosedialog(e) }>No</button>
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
      <form ref={ input => this.updateValueForm = input } onSubmit={ e => this.updateValue(e) }>
        <input ref={ input => this.updateVal = input } type={ type } id="inputValue" required step="0.000000000000000001" onChange={ e => { this.cond(e.target.value) } } />
        {
          type === 'number' && method !== 'draw' && (method !== 'free' || this.props.system.tub.cups[this.props.dialog.cup].art.eq(0))
          ? <span>&nbsp;<a href="#action" onClick={ this.setMax }>Set max</a></span>
          : ''
        }
        <p id="warningMessage" className="error">
          { this.props.dialog.error }
        </p>
        <br />
        <input type="submit" />
      </form>
    )
  }
  
  render() {
    const dialog = this.props.dialog;

    let text = '';
    let renderForm = '';
    this.cond = () => { return false };
    switch(dialog.method) {
      case 'proxy':
        text = '';
        text = '[ADD EXPLANATION WHAT A PROFILE IS].<br />' +
        'Are you sure you want to create a Profile?';
        renderForm = 'renderYesNoForm';
        this.submitEnabled = true;
        break;
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
      case 'bite':
        text = `Are you sure you want to bite CDP ${dialog.cup}?`;
        renderForm = 'renderYesNoForm';
        this.submitEnabled = true;
        break;
      case 'join':
        text = 'Please set amount of PETH you want to get in exchange of your WETH.';
        if (!this.props.proxyEnabled) {
          text += '<br />You might be requested for signing two transactions if there is not enough allowance in WETH to complete this transaction.';
        }
        renderForm = 'renderInputNumberForm';
        this.cond = (value) => {
          const valueWei = web3.toBigNumber(web3.toWei(value));
          let error = '';
          this.submitEnabled = true;
          if (this.props.system.gem.myBalance.lt(wmul(valueWei, wmul(this.props.system.tub.per, this.props.system.tub.gap)))) {
            error = 'Not enough balance of WETH to join this amount of PETH.';
            this.submitEnabled = false;
          }
          document.getElementById('warningMessage').innerHTML = error;
        }
        break;
      case 'exit':
        if (this.props.system.tub.off === true) {
          text = 'Are you sure you want to exit all your PETH?';
          if (!this.props.proxyEnabled) {
            text += '<br />You might be requested for signing two transactions if there is not enough allowance in PETH to complete this transaction.';
          }
          renderForm = 'renderYesNoForm';
          this.submitEnabled = true;
        } else {
          text = 'Please set amount of collateral (PETH) you want to convert to WETH.';
          if (!this.props.proxyEnabled) {
            text += '<br />You might be requested for signing two transactions if there is not enough allowance in PETH to complete this transaction.';
          }
          renderForm = 'renderInputNumberForm';

          this.cond = (value) => {
            const valueWei = web3.toBigNumber(web3.toWei(value));
            let error = '';
            this.submitEnabled = true;
            if (this.props.system.skr.myBalance.lt(valueWei)) {
              error = 'Not enough balance to exit this amount of PETH.';
              this.submitEnabled = false;
            }
            document.getElementById('warningMessage').innerHTML = error;
          }
        }
        break;
      case 'boom':
        text = 'Please set amount of PETH you want to transfer to get DAI.';
        if (!this.props.proxyEnabled) {
          text += '<br />You might be requested for signing two transactions if there is not enough allowance in PETH to complete this transaction.';
        }
        renderForm = 'renderInputNumberForm';
        this.cond = (value) => {
          const valueWei = web3.toBigNumber(web3.toWei(value));
          let error = '';
          this.submitEnabled = true;
          if (this.props.system.tub.avail_boom_skr.lt(valueWei)) {
            error = 'Not enough PETH in the system to boom this amount of PETH.';
            this.submitEnabled = false;
          } else if (this.props.system.skr.myBalance.lt(valueWei)) {
            error = 'Not enough balance of PETH to boom this amount of PETH.';
            this.submitEnabled = false;
          }
          document.getElementById('warningMessage').innerHTML = error;
        }
        break;
      case 'bust':
        text = 'Please set amount of PETH you want to get in exchange of DAI.';
        if (!this.props.proxyEnabled) {
          text += '<br />You might be requested for signing two transactions if there is not enough allowance in DAI to complete this transaction.';
        }
        renderForm = 'renderInputNumberForm';
        this.cond = (value) => {
          const valueDAI = wmul(web3.toBigNumber(value), this.props.system.tub.avail_bust_ratio);
          const valueDAIWei = web3.toBigNumber(web3.toWei(valueDAI)).floor();
          let error = '';
          this.submitEnabled = true;
          if (this.props.system.tub.avail_bust_dai.lt(valueDAIWei)) {
            error = 'Not enough DAI in the system to bust this amount of PETH.';
            this.submitEnabled = false;
          } else if (this.props.system.dai.myBalance.lt(valueDAIWei)) {
            error = 'Not enough balance of DAI to bust this amount of PETH.';
            this.submitEnabled = false;
          }
          document.getElementById('warningMessage').innerHTML = error;
        }
        break;
      case 'lock':
        text = `Please set amount of collateral (PETH) you want to lock in CDP ${dialog.cup}.`;
        if (!this.props.proxyEnabled) {
          text += '<br />You might be requested for signing two transactions if there is not enough allowance in PETH to complete this transaction.';
        }
        renderForm = 'renderInputNumberForm';
        this.cond = (value) => {
          const valueWei = web3.toBigNumber(web3.toWei(value));
          let error = '';
          this.submitEnabled = true;
          const cup = this.props.dialog.cup;
          if (this.props.system.skr.myBalance.lt(valueWei)) {
            error = 'Not enough balance to lock this amount of PETH.';
            this.submitEnabled = false;
          } else if (this.props.system.tub.cups[cup].avail_skr.round(0).add(valueWei).gt(0) && this.props.system.tub.cups[cup].avail_skr.add(valueWei).round(0).lte(web3.toWei(0.005))) {
            error = 'It is not allowed to lock a low amount of PETH in a CDP. It needs to be higher than 0.005 PETH.';
            this.submitEnabled = false;
          }
          document.getElementById('warningMessage').innerHTML = error;
        }
        break;
      case 'free':
        if (this.props.system.tub.off) {
          text = `Are you sure you want to free your available PETH from CUP ${dialog.cup}?`;
          renderForm = 'renderYesNoForm';
          this.submitEnabled = true;
        } else {
          text = `Please set amount of collateral (PETH) you want to withdraw from CDP ${dialog.cup}`;
          renderForm = 'renderInputNumberForm';
          this.cond = (value) => {
            const valueWei = web3.toBigNumber(web3.toWei(value));
            const cup = this.props.dialog.cup;
            let error = '';
            this.submitEnabled = true;
            if (this.props.system.tub.cups[cup].avail_skr.lt(valueWei)) {
              error = 'This amount of PETH exceeds the maximum available to free.';
              this.submitEnabled = false;
            } else if (this.props.system.tub.cups[cup].avail_skr.minus(valueWei).round(0).lte(web3.toWei(0.005)) && !this.props.system.tub.cups[cup].avail_skr.round(0).eq(valueWei)) {
              error = 'CDP can not be left with a dust amount lower or equal than 0.005 PETH. You have to either leave more or free the whole amount.';
              this.submitEnabled = false;
            } else if (this.props.system.tub.off === false && this.props.system.tub.cups[cup].art.gt(0) && valueWei.gt(this.props.system.tub.cups[cup].avail_skr.times(0.9))) {
              error = 'This amount puts your CDP in risk to be liquidated';
            }
            document.getElementById('warningMessage').innerHTML = error;
          }
        }
        break;
      case 'draw':
        text = `Please set amount of DAI you want to mint from your locked collateral (PETH) in CDP ${dialog.cup}`;
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
        text = `Please set amount of DAI you want to burn to recover your collateral (PETH) from CDP ${dialog.cup}.`;
        if (!this.props.proxyEnabled) {
          text += '<br />You might be requested for signing up to three transactions if there is not enough allowance in DAI and/or MKR to complete this transaction.';
        }
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
      case 'cash':
        text = `Please set amount of DAI you want to cash`;
        if (!this.props.proxyEnabled) {
          text += '<br />You might be requested for signing two transactions if there is not enough allowance in DAI to complete this transaction.';
        }
        renderForm = 'renderInputNumberForm';
        this.cond = (value) => {
          const valueWei = web3.toBigNumber(web3.toWei(value));
          let error = '';
          this.submitEnabled = true;
          if (this.props.system.dai.myBalance.lt(valueWei)) {
            error = 'Not enough balance to cash this amount of DAI.';
            this.submitEnabled = false;
          }
          document.getElementById('warningMessage').innerHTML = error;
        }
        break;
      case 'mock':
        text = `Please set amount of DAI you mock to cash`;
        if (!this.props.proxyEnabled) {
          text += '<br />You might be requested for signing two transactions if there is not enough allowance in WETH to complete this transaction.';
        }
        renderForm = 'renderInputNumberForm';
        this.cond = (value) => {
          const valueWei = web3.toBigNumber(web3.toWei(value));
          let error = '';
          this.submitEnabled = true;
          if (wdiv(this.props.system.gem.myBalance, this.props.system.tap.fix).lt(valueWei)) {
            error = 'Not enough balance of WETH to mock this amount of DAI.';
            this.submitEnabled = false;
          }
          document.getElementById('warningMessage').innerHTML = error;
        }
        break;
      case 'vent':
        text = 'Are you sure you want to vent the system?';
        renderForm = 'renderYesNoForm';
        this.submitEnabled = true;
        break;
      case 'drip':
        text = 'Are you sure you want to drip the system?';
        renderForm = 'renderYesNoForm';
        this.submitEnabled = true;
        break;
      case 'heal':
        text = 'Are you sure you want to heal the system?';
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
            <p dangerouslySetInnerHTML={ {__html: text} } />
            { renderForm ? this[renderForm](dialog.method) : '' }
          </div>
          {/* <form>
            <fieldset>
              <label htmlFor="lend-sai" className="typo-h3">How much SAI do you want to lend?</label>
              <div className="field-container">
                <input type="text" name="sai" id="lend-sai" className="number-input" value="350,00" />
                <span className="unit">SAI</span>
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor="lend-sai" className="typo-h3">How much ETH do you want to put as collateral?</label>
              <div className="field-container">
                <input type="text" name="sai" id="lend-sai" className="number-input" value="1.000" />
                <span className="unit">ETH</span>
              </div>	
            </fieldset>
            <div className="dialog-action-area">
              <button className="text-btn">Cancel</button>
              <button className="text-btn text-btn-primary">OK</button>
            </div>
          </form> */}
        </div>
      </div>
    )
  }
}

export default Dialog;
