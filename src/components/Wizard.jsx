import React, {Component} from 'react';
import {WAD, wmul, wdiv, toBigNumber, fromWei, toWei, printNumber} from '../helpers';
import LegacyCups from './LegacyCups';
import Steps, {Step} from 'rc-steps';
import 'rc-steps/assets/index.css';
import TooltipHint from './TooltipHint';

const StepIcon = ({ step }) => <div className="rc-steps-item-icon-inner">{ step }</div>;

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
      stepsExpanded: false
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

  toggleExpand = () => {
    this.setState({stepsExpanded: !this.state.stepsExpanded});
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
    let steps = [
      'Creating your new CDP',
      'Wrap ETH to WETH - ERC 20 tokenization',
      'Converting WETH to PETH',
      'CDP is collateralized with PETH - Your converted ETH is locked',
      'DAI generated -  Your requested DAI are generated',
      'DAI transferred - Your requested DAI are transferred to your wallet'];

    return (
      <div>
        <header className="col" style={ {borderBottom: 'none'} }>
          <Steps current={this.state.step - 1}>
            <Step title="Collateralize & generate DAI" icon={<StepIcon step="1" />} />
            <Step title="Confirm details" icon={<StepIcon step="2" />} />
          </Steps>
        </header>
        {
          this.state.step === 1
          ?
            <React.Fragment>
              <LegacyCups legacyCups={ this.props.system.tub.legacyCups } handleOpenDialog={ this.props.handleOpenDialog } />

              <form ref={ input => this.wizardForm = input } onSubmit={ () => this.goToStep(2) }>
                <div className="row">

                  <div className="col col-2" style={ {border: 'none'} }>
                    <label className="typo-cl">How much ETH would you like to collateralize?</label>
                    <div style={ {display: 'inline-block'} }>
                      <input ref={ input => this.eth = input } style={ {minWidth: '15rem'} } type="number" id="inputETH" className="number-input" required step="0.000000000000000001" placeholder="0.000" value={ this.state.ethText } onChange={ e => { this.checkValues('eth', e.target.value) } } />
                      <span className="unit" style={ {marginBottom: '0.35rem' } }>ETH</span>
                      <div className="typo-cs align-right">{printNumber(this.state.skr)} PETH
                        <TooltipHint tip="Lorem ipsum dolor sit amet, consectetur adipisicing elit,<br />sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
                      </div>
                      {
                        this.state.minETHReq &&
                        <p className="typo-cs align-right">Min. ETH required: { printNumber(this.state.minETHReq) } ETH</p>
                      }
                    </div>
                  </div>

                  <div className="col col-2">
                    <label className="typo-cl">How much DAI would you like to generate?</label>
                    <div style={ {display: 'inline-block'} }>
                      <input ref={ input => this.dai = input } style={ {minWidth: '15rem'} } type="number" id="inputDAI" className="number-input" required step="0.000000000000000001" placeholder="0.000" value={ this.state.daiText } onChange={ e => { this.checkValues('dai', e.target.value) } } />
                      <span className="unit" style={ {marginBottom: '0.35rem' } }>DAI</span>
                      {
                        this.state.maxDaiAvail &&
                        <p className="typo-cs align-right">Max DAI available to borrow: { printNumber(this.state.maxDaiAvail) } DAI</p>
                      }
                    </div>
                  </div>

                </div>

                <div className="row">

                  <div className="col col-2">
                    <div style={ {marginBottom: '1rem'}}>
                      <h3 className="typo-cl inline-headline">Liquidation price (ETH/USD)</h3>
                      <TooltipHint tip="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
                      <div className="value typo-cl typo-bold right">{ this.state.liqPrice ? printNumber(this.state.liqPrice) : '--' } USD</div>
                    </div>
                    <div>
                      <h3 className="typo-c inline-headline">Current price information (ETH/USD)</h3>
                      <TooltipHint tip="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
                      <div className="value typo-c right">{ printNumber(this.props.system.pip.val) } USD</div>
                    </div>
                    <div>
                      <h3 className="typo-c inline-headline">Liquidation penalty</h3>
                      <div className="value typo-c right">{ printNumber(this.props.system.tub.axe.minus(WAD).times(100)) }%</div>
                    </div>
                  </div>

                  <div className="col col-2">
                    <div style={ {marginBottom: '1rem'}}>
                      <h3 className="typo-cl inline-headline">Collateralization ratio</h3>
                      <TooltipHint tip="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
                      <div className="value typo-cl typo-bold right">{ this.state.ratio ? printNumber(this.state.ratio.times(100)) : '--' }%</div>
                    </div>
                    <div>
                      <h3 className="typo-c inline-headline">Minimum ratio</h3>
                      <div className="value typo-c right">{ printNumber(this.props.system.tub.mat.times(100)) }%</div>
                    </div>
                  </div>

                </div>

                <div className="row" style={ {borderBottom: 'none'} }>
                  <p>Stability fee @${ printNumber(toWei(fromWei(this.props.system.tub.fee).pow(60 * 60 * 24 * 365)).times(100).minus(toWei(100))) }%/year in MKR</p>
                </div>

                <div className="row" style={ {borderBottom: 'none'} }>
                  {
                    this.state.error &&
                    <p id="errorMessage" className="error">
                      { this.state.error }
                    </p>
                  }
                  {
                    this.state.warning &&
                    <p id="warningMessage" className="warning">
                      { this.state.warning }
                    </p>
                  }
                </div>

                <div className="row" style={ {borderBottom: 'none'} }>
                  <div className="col">
                    <button className="text-btn text-btn-primary" type="submit" disabled={ !this.state.submitEnabled }>COLLATERALIZE &amp; GENERATE</button>
                  </div>
                </div>

              </form>

            </React.Fragment>
          :
            <React.Fragment>

              <div className="row">
                <div className="col">
                  <div className="typo-cl">Collateralize &amp; generate Dai</div>
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

              <div className="row" style={ {marginTop: '50px'} }>
                <div className="col">
                  <div className="typo-cl">Transaction details</div>
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <div className="typo-cl inline-headline" style={ {marginBottom: '1rem'} }>Automated smart contract transaction</div>

                  <div className="typo-c" style={ {clear: 'left'} }>
                    <img src={"img/icon-section-" + (this.state.stepsExpanded ? "collapse" : "expand") + ".svg"} onClick={ () => this.toggleExpand() } draggable="false" alt="Expand" style={ {float: 'right', cursor: 'pointer' } }/>
                    There are 6 steps to complete the CDP.&nbsp;&nbsp;These will be automated for your convenience.
                  </div>

                  <div className={"typo-c wizard-automated-transactions" + (this.state.stepsExpanded ? " expanded" : "") }>
                  {
                    steps.map((s, key) => (
                      <div className="step-cointainer" key={ key }>
                        <div className="step-icon">
                          <div className="steps-item"><div className="steps-item-inner">{ key + 1 }</div></div>
                          <div className="vertical-line"></div>
                        </div>
                        <div className="step-message">
                          <span>{ s }</span>
                        </div>
                      </div>
                    ))
                  }
                  </div>

                </div>
              </div>

              <div className="row" style={ {marginTop: '50px', border: 'none'} }>
                <div className="col">
                  <div style={ {marginBottom: '2rem'} }>
                    <label>
                      <input style={ {visibility: 'initial'} } type="checkbox" checked={ this.state.checkTerms } value="1" onChange={e => this.check(e.target.checked, 'checkTerms')}/>&nbsp;
                      I have read and the accepted the MakerDao’s terms and conditions and the announcement.
                    </label>
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
              </div>

            </React.Fragment>
        }
      </div>
    )
  }
}

export default Wizard;
