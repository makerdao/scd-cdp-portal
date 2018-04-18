import React, {Component} from 'react';
import {wmul, wdiv, toBigNumber, toWei} from '../helpers';

class Wizard extends Component {
  constructor() {
    super();
    this.state = {
      eth: toBigNumber(0),
      ethText: "",
      dai: toBigNumber(0),
      daiText: "",
      error: false,
      submitEnabled: false,
    }
  }

  checkValues = (token, amount) => {
    const amountBN = toBigNumber(amount);
    const state = {...this.state};
    state[token] = amountBN;
    state[`${token}Text`] = amount;

    this.setState(state, () => {
      this.setState(prevState => {
        const state = {...this.state};
        const eth = toWei(state.eth);
        const dai = toWei(state.dai);

        state.submitEnabled = false;
        state.error = false;

        const pro = wmul(wmul(eth, this.props.system.tub.per), this.props.system.tub.tag).round(0);
        const availDai = wdiv(pro, wmul(this.props.system.tub.mat, this.props.system.vox.par)).round(0); // "minus(1)" to avoid rounding issues when dividing by mat (in the contract uses it mulvoxlying on safe function)

        if (this.props.system.sin.totalSupply.add(dai).gt(this.props.system.tub.cap)) {
          state.error = 'This amount of DAI exceeds the system debt ceiling.';
        } else if (dai.gt(availDai)) {
          state.error = 'ETH to be deposited is not enough to draw this amount of DAI.';
        } else {
          state.submitEnabled = true;
        }
        return state;
      })
    });
  }

  execute = e => {
    e.preventDefault();
    this.props.profile.checkProxy([['lockAndDraw', false, this.state.eth, this.state.dai]]);
  }

  render() {
    return (
      <div>
        <header className="col">
          <h1 className="typo-h1 inline-headline">Wizard</h1>
        </header>
        <div>
          <form ref={ input => this.wizardForm = input } onSubmit={ this.execute }>
            <div>
              <label>Amount of ETH to deposit</label>
              <input ref={ input => this.eth = input } type="number" id="inputETH" className="number-input" required step="0.000000000000000001" value={ this.state.ethText } onChange={ e => { this.checkValues('eth', e.target.value) } } />
            </div>
            <div style={ {clear:'left'} }>
              <label>Amount of DAI to generate</label>
              <input ref={ input => this.dai = input } type="number" id="inputDAI" className="number-input" required step="0.000000000000000001" value={ this.state.daiText } disabled={ this.state.eth.lte(0) } onChange={ e => { this.checkValues('dai', e.target.value) } } />
            </div>
            <br />
            {
              this.state.error &&
              <p id="warningMessage" className="error">
                { this.state.error }
              </p> 
            }
            <br />
            <div>
              <button className="text-btn text-btn-primary" type="submit" disabled={ !this.state.submitEnabled }>Submit</button>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default Wizard;
