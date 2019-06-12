// Libraries
import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {Link} from "react-router-dom";

// Utils
import {printNumber} from "../utils/helpers";

// Analytics
import { mixpanelInstance as mixpanel } from '../utils/analytics';
import { createDecipher } from "crypto";

@inject("profile")
@inject("system")
@observer
export default class ConfirmMobile extends Component {
  usdValue = eth => {
    const ethPrice = this.props.system.pip.val / 1000000000000000000;
    return eth * ethPrice;
  }

  steps = () => {
    const steps= [
                    { text: "Creation of your proxy" },
                    { text: "Creation of your CDP" },
                    {
                      text: "Wrap your ETH to WETH"
                    },
                    {
                      text: "Convert your WETH to PETH",
                    },
                    { text: "CDP collateralized with PETH" },
                    { text: "DAI generated" },
                    { text: "DAI transferred to wallet" }
                  ];
    if (this.props.profile.proxy && this.props.profile.proxy !== -1) {
      steps.shift();
    }

    return steps;
  }

  render() {
    const {
      check,
      checkTerms,
      dai,
      eth,
      execute,
      stabilityFee,
      stepsExpanded,
      toggleExpand
    } = this.props.confirmProps;

    return (
      <div id="confirmMobile">
          <div className="row">
            <div className="col">
              <div>
                <h3 className="typo-cl inline-headline" style={{color: '#ffffff'}}>
                  Collateral at risk
                </h3>
                <div className="value typo-h3 typo-bold right">
                  { printNumber(eth) } ETH
                </div><br />
                <div className="value typo-cm right" style ={{color: '#9aa3ad'}}>
                  ${ printNumber(this.usdValue(eth)) }
                </div>
              </div>
            </div>
            <div className="col">
              <div style={{marginBottom: '40px'}}>
                <h3 className="typo-cl inline-headline" style={{color: '#ffffff'}}>
                  Generate
                </h3>
                <div className="value typo-h3 typo-bold right">
                  { printNumber(dai) } DAI
                </div><br />
                <div className="value typo-cm right" style ={{color: '#9aa3ad'}}>
                  ${ printNumber(dai) }
                </div>
              </div>
            </div>
          </div>

          <div className="row" style={ {marginTop: "10px"} }>
            <div className="col">
              <div className="typo-cl no-select clear-left">
                {
                  stepsExpanded ?
                  <svg
                    className="wizard expand-section-btn"
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={ () => toggleExpand() }
                  >
                    <path
                      d="m1022.95113 481.269219-4.95267-4.953847-4.95267 4.953847-1.50733-1.507693 6.46-6.461538 6.46 6.461538zm-4.95113 10.730781c-7.73199 0-14-6.268014-14-14s6.26801-14 14-14 14 6.268014 14 14-6.26801 14-14 14zm0-2.153846c6.54245 0 11.84615-5.303704 11.84615-11.846154s-5.3037-11.846154-11.84615-11.846154-11.84615 5.303704-11.84615 11.846154 5.3037 11.846154 11.84615 11.846154z"
                      fill="#9aa3ad"
                      transform="translate(-1004 -464)"
                    />
                  </svg>
                  :
                  <svg
                    className="wizard expand-section-btn"
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={ () => toggleExpand() }
                  >
                    <path
                      d="m1080.95385 474.769231-4.95385 4.953846-4.95385-4.953846-1.50769 1.507692 6.46154 6.461539 6.46154-6.461539zm-4.95385 17.230769c-7.73199 0-14-6.268014-14-14s6.26801-14 14-14 14 6.268014 14 14-6.26801 14-14 14zm0-2.153846c6.54245 0 11.84615-5.303704 11.84615-11.846154s-5.3037-11.846154-11.84615-11.846154-11.84615 5.303704-11.84615 11.846154 5.3037 11.846154 11.84615 11.846154z"
                      transform="translate(-1062 -464)"
                    />
                  </svg>
                }
                Transaction details
              </div>

              <div
                className={"typo-cm wizard-automated-transactions" + (stepsExpanded ? " expanded" : "") }
              >
                <div
                  className="typo-cm no-select clear-left"
                  style={{marginTop: "10px", marginBottom: "20px"}}
                >
                  There are { this.steps().length } steps needed to complete the creation of your CDP.&nbsp;&nbsp;
                  These will be automated for your convenience.
                </div>
                {
                  this.steps().map((s, key) => (
                    <div className="step-cointainer" key={ key }>
                      <div className="step-icon">
                        <div className="steps-item">
                          <div className="steps-item-inner">
                            { key + 1 }
                          </div>
                        </div>
                        <div className="vertical-line"></div>
                      </div>
                      <div className="step-message right">
                        <span>{ s.text }</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            <div
              className="inline-notification is-stability-fee-warning"
              style={{marginTop: "10px", marginBottom: "30px"}}
            >
              <p style={ { color: '#B42B00', fontWeight: 500, fontSize: "13px" } }>
                When you open a CDP, the Stability Fee might vary due to changing market conditions.&nbsp;
                <a
                  href="https://www.reddit.com/r/MakerDAO/comments/93adqj/faq_stability_fee_raise/"
                  rel="noopener noreferrer"
                  style={ { color: '#447AFB', textDecoration: 'none'} }
                  target="_blank"
                >
                  Find out more here
                </a>.
                The Stability Fee is currently <strong>{ stabilityFee }%.</strong>
              </p>
            </div>

            <div style={ {border: "none"} }>
              <div className="col">
                <div style={ {marginBottom: "2rem"} }>
                  <label className="checkbox-container" style={{marginTop: "10px"}}>
                    <input
                      type="checkbox"
                      checked={ checkTerms }
                      value="1"
                      onChange={e => check(e.target.checked, "checkTerms")}
                    />
                    <span className="checkmark"></span>
                    I have read and accept the <Link to="/terms" target="_blank">Terms of Service</Link>
                  </label>
                </div>
                <div>
                  <button
                    className="bright-style text-btn text-btn-primary-mobile"
                    style={{marginTop: "5px", marginBottom: "15px"}}
                    onClick={() => { execute(); mixpanel.track('btn-click', { id: 'confirmCDP', mobile: true, collateral: eth, debt: dai, product: 'scd-cdp-portal', page: createDecipher, section: confirmCDP });  }}
                    disabled={ !checkTerms }
                  >
                    CREATE CDP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}
