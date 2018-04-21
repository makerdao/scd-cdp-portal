import React, {Component} from 'react';
import {WAD, wmul, wdiv, toBigNumber, fromWei, toWei, printNumber} from '../helpers';

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
      checkProxy: false,
    }
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
      state.skr = wdiv(state.eth, this.props.system.tub.per);
      state.maxDaiAvail = wdiv(wmul(state.skr, this.props.system.tub.tag), wmul(this.props.system.tub.mat, this.props.system.vox.par)).round(0).minus(1);
    }

    if (state.dai.gt(0)) {
      state.minETHReq = wmul(wdiv(wmul(state.dai, wmul(this.props.system.tub.mat, this.props.system.vox.par)), this.props.system.tub.tag), this.props.system.tub.per).round(0);
    }

    this.setState(state, () => {
      this.setState(prevState => {
        const state = {...this.state};

        state.submitEnabled = false;
        state.error = false;

        if (state.eth.gt(0) && state.dai.gt(0)) {
          const pro = wmul(wmul(state.eth, this.props.system.tub.per), this.props.system.tub.tag).round(0);
          const availDai = wdiv(pro, wmul(this.props.system.tub.mat, this.props.system.vox.par)).round(0); // "minus(1)" to avoid rounding issues when dividing by mat (in the contract uses it mulvoxlying on safe function)

          if (this.props.system.sin.totalSupply.add(state.dai).gt(this.props.system.tub.cap)) {
            state.error = 'This amount of DAI exceeds the system debt ceiling.';
          } else if (state.dai.gt(availDai)) {
            state.error = 'ETH to be deposited is not enough to draw this amount of DAI.';
          } else {
            state.liqPrice = this.props.system.calculateLiquidationPrice(state.skr, state.dai);
            state.ratio = this.props.system.calculateRatio(state.skr, state.dai);
            if (state.ratio.lt(WAD.times(2))) {
              state.warning = 'The amount of DAI you are trying to generate against the collateral is putting your CDP at risk.';
            }
            state.submitEnabled = true;
          }
          return state;
        }
      })
    });
  }

  goToStep = step => {
    this.setState({step});
  }

  execute = e => {
    e.preventDefault();
    this.props.profile.checkProxy([['system/lockAndDraw', false, fromWei(this.state.eth), fromWei(this.state.dai)]]);
  }

  check = (checked, type) => {
    const state = {...this.state};
    state[type] = checked;
    this.setState(state);
  }

  render() {
    return (
      <div>
        <header className="col">
          <ul>
            <li className={this.state.step === 1 ? 'active' : ''}>
              Collateralize &amp; generate DAI
            </li>
            <li className={this.state.step === 1 ? 'active' : ''}>
              Confirm details
            </li>
          </ul>
        </header>
        {
          this.state.step === 1
          ?
            <React.Fragment>
              <div>
                <form ref={ input => this.wizardForm = input } onSubmit={ () => this.goToStep(2) }>
                  <div style={ {float: 'left', width: '50%'} }>
                    <div>
                      <label>How much ETH would you like to collateralize?</label>
                      <input ref={ input => this.eth = input } type="number" id="inputETH" className="number-input" required step="0.000000000000000001" placeholder="0.000" value={ this.state.ethText } onChange={ e => { this.checkValues('eth', e.target.value) } } />
                      <span>ETH</span>
                    </div>
                    <div style={ {clear: 'left'} }>{printNumber(this.state.skr)} PETH</div>
                    {
                      this.state.minETHReq &&
                      <div style={ {clear: 'left'} }>Min. ETH required: { printNumber(this.state.minETHReq) } ETH</div>
                    }
                  </div>
                  <div style={ {float: 'left', width: '50%'} }>
                    <div>
                      <label>How much DAI would you like to generate?</label>
                      <input ref={ input => this.dai = input } type="number" id="inputDAI" className="number-input" required step="0.000000000000000001" placeholder="0.000" value={ this.state.daiText } onChange={ e => { this.checkValues('dai', e.target.value) } } />
                      <span>DAI</span>
                    </div>
                    {
                      this.state.maxDaiAvail &&
                      <div style={ {clear: 'left'} }>Max. DAI availble to borrow: { printNumber(this.state.maxDaiAvail) } DAI</div>
                    }
                  </div>
                  <br /><br /><br />
                  <div style={ {clear: 'left'} }>
                    <button className="text-btn text-btn-primary" type="submit" disabled={ !this.state.submitEnabled }>COLLATERALIZE &amp; GENERATE</button>
                  </div>
                </form>
              </div>
              <div>
                <div>Liquidation price (ETH/USD): { this.state.liqPrice ? printNumber(this.state.liqPrice) : '--' } USD</div>
                <div>Collateralization ratio: { this.state.ratio ? printNumber(this.state.ratio.times(100)) : '--' }%</div>
                <div>Current price information (ETH/USD): { printNumber(this.props.system.pip.val) } USD</div>
                <div>Liquidation penalty: { printNumber(this.props.system.tub.axe.minus(WAD).times(100)) }%</div>

                <div>Minimum ratio: { printNumber(this.props.system.tub.mat.times(100)) }%</div>

                <br /><br /><br />
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

                <div>Stability fee @${ printNumber(toWei(fromWei(this.props.system.tub.fee).pow(60 * 60 * 24 * 365)).times(100).minus(toWei(100))) }%/year in MKR</div>
              </div>
            </React.Fragment>
          :
            <React.Fragment>
              <header>
                <h2>Collateralize &amp; generate Dai</h2>
                <div>Collateral: { printNumber(this.state.eth) } ETH</div>
                <div>Generate: { printNumber(this.state.dai) } DAI</div>
              </header>
              <div>
                <h3>Transaction details</h3>
                <h4>Automated smart contract transaction</h4>
                <p>There are 6 steps to complete the CDP. These will be automated for your convenience.</p>
                <div>
                  <ul>
                    <li>Creating your new CDP</li>
                    <li>Wrap ETH to WETH - ERC 20 tokenization</li>
                    <li>Converting WETH to PETH </li>
                    <li>CDP is collateralized with PETH - Your converted ETH is locked</li>
                    <li>DAI generated -  Your requested DAI are generated</li>
                    <li>DAI transferred - Your requested DAI are transferred to your wallet</li>
                  </ul>
                </div>
                <br /><br /><br />
                <div>
                  <label>
                    <input style={ {visibility: 'initial'} } type="checkbox" checked={ this.state.checkTerms } value="1" onChange={e => this.check(e.target.checked, 'checkTerms')}/>&nbsp;
                    I have read and the accepted the MakerDao’s terms and conditions and the announcement.
                  </label>
                </div>
                <div>
                  <label>
                    <input style={ {visibility: 'initial'} } type="checkbox" checked={ this.state.checkProxy } value="1" onChange={e => this.check(e.target.checked, 'checkProxy')} />&nbsp;
                    I agree and accept the use of automated smart contract.
                  </label>
                </div>
                <div>
                  <button className="text-btn text-btn-primary" onClick={ () => this.goToStep(1) }>Go back</button>
                  <button className="text-btn text-btn-primary" onClick={ this.execute } disabled={ !this.state.checkTerms || !this.state.checkProxy }>Process CDP</button>
                </div>
              </div>
            </React.Fragment>
        }
      </div>
    )
  }
}

export default Wizard;
