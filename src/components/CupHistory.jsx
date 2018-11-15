// Libraries
import React from "react";
import {inject, observer} from "mobx-react";

// Components
import LoadingSpinner from "./LoadingSpinner";

// Utils
import {etherscanAddress, etherscanTx, printNumber, formatDate, toWei} from "../utils/helpers";

// Images
import historyIconOpen from "images/history-icon-open.svg";
import historyIconGive from "images/history-icon-give.svg";
import historyIconLocked from "images/history-icon-locked.svg";
import historyIconPayback from "images/history-icon-payback.svg";
import historyIconBorrow from "images/history-icon-borrow.svg";
import historyIconTransfer from "images/history-icon-transfer.svg";
import historyIconUnknown from "images/history-icon-unknown.svg";
import historyIconLiquidation from "images/history-icon-liquidation.svg";


const MAX_HISTORY_ITEMS_BEFORE_COLLAPSE = 4;

@inject("network")
@observer
class CupHistory extends React.Component {
  constructor() {
    super();
    this.state = {
      stepsExpanded: false
    }
  }
  get showExpander() {
    return this.props.history.length > MAX_HISTORY_ITEMS_BEFORE_COLLAPSE;
  }
  toggleExpand = () => {
    this.setState({stepsExpanded: !this.state.stepsExpanded});
  }
  render() {
    return (
      <div className="col col-extra-padding">
        <h2 className="underline">CDP History</h2>
          <div>
            {
              this.props.history === "loading"
              ?
                <div className="col-md-12 system-status">
                  <LoadingSpinner />
                </div>
              :
                !this.props.history
                ?
                  <div className="col-md-12 system-status">
                    <div>History is not available at this moment</div>
                  </div>
                :
                <React.Fragment>
                  <div className={ "cup-history-items" + (this.state.stepsExpanded ? " expanded" : "") + (!this.showExpander ? " hide-expander" : "") }>
                    {
                      this.props.history && this.props.history.length > 0 &&
                      this.props.history.map((action, key) => {
                        let message = "", image = historyIconUnknown;
                        switch(action.act) {
                          case "OPEN":
                            message = <React.Fragment>Opened your CDP</React.Fragment>;
                            image = historyIconOpen;
                            break;
                          case "GIVE":
                            message = <React.Fragment>Transferred CDP from {etherscanAddress(this.props.network.network, `${action.guy.substring(0,20)}...`, action.guy)}</React.Fragment>;
                            image = historyIconGive;
                            break;
                          case "LOCK":
                            message = <React.Fragment>Deposited {printNumber(toWei(action.arg * action.per))} ETH ({printNumber(toWei(action.arg))} PETH) to your CDP</React.Fragment>;
                            image = historyIconLocked;
                            break;
                          case "FREE":
                            message = <React.Fragment>Withdrew {printNumber(toWei(action.arg * action.per))} ETH ({printNumber(toWei(action.arg))} PETH) from your CDP</React.Fragment>;
                            image = historyIconPayback;
                            break;
                          case "DRAW":
                            message = <React.Fragment>Generated {printNumber(toWei(action.arg))} DAI from your CDP</React.Fragment>;
                            image = historyIconBorrow;
                            break;
                          case "WIPE":
                            message = <React.Fragment>Paid back {printNumber(toWei(action.arg))} DAI to your CDP</React.Fragment>;
                            image = historyIconTransfer; // Should this be "history-icon-payback.svg" instead?
                            break;
                          case "SHUT":
                            message = <React.Fragment>Closed your CDP</React.Fragment>;
                            image = historyIconUnknown;
                            break;
                          case "BITE":
                            const art = toWei(this.props.history[key + 1].art);
                            const liqInk = toWei(this.props.history[key + 1].ink - action.ink);
                            const liqETH = liqInk * action.per;
                            const pip = toWei(this.props.history[key].pip);
                            message = <React.Fragment>
                                        Your CDP has been liquidated to pay back { printNumber(art, 2) } DAI.
                                        Total {printNumber(liqETH)} ETH ({ printNumber(liqInk) } PETH) has been liquidated at { printNumber(pip, 2) } USD.
                                      </React.Fragment>;
                            image = historyIconLiquidation;
                            break;
                          default:
                            break;
                        }
                        return (
                          <div className="history-cointainer" key={ key }>
                            <div className="history-icon">
                              <img src={ image } draggable="false" alt="" />
                              <div className="vertical-line"></div>
                            </div>
                            <div className="history-details">
                              <div className="history-date">{ formatDate(new Date(action.time).getTime() / 1000) }</div>
                              <span>
                                { message }
                              </span>
                              <span className="history-tx-links">
                              { etherscanAddress(this.props.network.network, "Sender", action.guy) }
                              <span className="pipe-separator">&nbsp;|&nbsp;</span>
                              { etherscanTx(this.props.network.network, "Tx Hash", action.tx) }
                              </span>
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>

                  <div className={ "history-expand" + (!this.showExpander ? " hide-expander" : "") } onClick={ () => this.toggleExpand() } key="history-expand">
                    <div className="history-icon">
                    {
                      this.state.stepsExpanded ?
                      <svg className="expand-section-btn" width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" onClick={ () => this.toggleExpand() }>
                        <path d="m1022.95113 481.269219-4.95267-4.953847-4.95267 4.953847-1.50733-1.507693 6.46-6.461538 6.46 6.461538zm-4.95113 10.730781c-7.73199 0-14-6.268014-14-14s6.26801-14 14-14 14 6.268014 14 14-6.26801 14-14 14zm0-2.153846c6.54245 0 11.84615-5.303704 11.84615-11.846154s-5.3037-11.846154-11.84615-11.846154-11.84615 5.303704-11.84615 11.846154 5.3037 11.846154 11.84615 11.846154z" fill="#9aa3ad" transform="translate(-1004 -464)"/>
                      </svg>
                      :
                      <svg className="expand-section-btn" width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" onClick={ () => this.toggleExpand() }>
                        <path d="m1080.95385 474.769231-4.95385 4.953846-4.95385-4.953846-1.50769 1.507692 6.46154 6.461539 6.46154-6.461539zm-4.95385 17.230769c-7.73199 0-14-6.268014-14-14s6.26801-14 14-14 14 6.268014 14 14-6.26801 14-14 14zm0-2.153846c6.54245 0 11.84615-5.303704 11.84615-11.846154s-5.3037-11.846154-11.84615-11.846154-11.84615 5.303704-11.84615 11.846154 5.3037 11.846154 11.84615 11.846154z" transform="translate(-1062 -464)"/>
                      </svg>
                    }
                    </div>
                    <div className="history-details">
                      <span onClick={ () => this.toggleExpand() }>
                        { this.state.stepsExpanded ? "Collapse" : "Expand"} complete history
                      </span>
                    </div>
                  </div>
                </React.Fragment>
            }
          </div>
      </div>
    )
  }
}

export default CupHistory;
