import React from 'react';
import {observer} from 'mobx-react';

import LoadingSpinner from './LoadingSpinner';

import {etherscanAddress, etherscanTx, printNumber, formatDate, toWei} from '../helpers';

class CupHistory extends React.Component {
  render() {
    return (
      <div className="col col-extra-padding">
        <h2 className="underline">CDP History</h2>
          <div>
            {
              this.props.history === 'loading'
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
                  <div>
                    {
                      this.props.history && this.props.history.length > 0 &&
                      this.props.history.map((action, key) => {
                        let message = '', image = 'history-icon-unknown.svg';
                        switch(action.act) {
                          case 'OPEN':
                            message = <React.Fragment>Opened your CDP</React.Fragment>;
                            image = 'history-icon-open.svg';
                            break;
                          case 'GIVE':
                            message = <React.Fragment>Transferred CDP from {etherscanAddress(this.props.network, `${this.props.history[key + 1].guy.substring(0,20)}...`, this.props.history[key + 1].guy)}</React.Fragment>;
                            image = 'history-icon-give.svg';
                            break;
                          case 'LOCK':
                            message = <React.Fragment>Deposited {printNumber(toWei(action.arg * action.per))} ETH ({printNumber(toWei(action.arg))} PETH) to your CDP</React.Fragment>;
                            image = 'history-icon-locked.svg';
                            break;
                          case 'FREE':
                            message = <React.Fragment>Withdrew {printNumber(toWei(action.arg * action.per))} ETH ({printNumber(toWei(action.arg))} PETH) from your CDP</React.Fragment>;
                            image = 'history-icon-payback.svg';
                            break;
                          case 'DRAW':
                            message = <React.Fragment>Generated {printNumber(toWei(action.arg))} DAI from your CDP</React.Fragment>;
                            image = 'history-icon-borrow.svg';
                            break;
                          case 'WIPE':
                            message = <React.Fragment>Paidback {printNumber(toWei(action.arg))} DAI to your CDP</React.Fragment>;
                            image = 'history-icon-transfer.svg'; // Should this be 'history-icon-payback.svg' instead?
                            break;
                          case 'SHUT':
                            message = <React.Fragment>Closed your CDP</React.Fragment>;
                            image = 'history-icon-unknown.svg';
                            break;
                          case 'BITE':
                            const art = toWei(this.props.history[key + 1].art);
                            const liqInk = toWei(this.props.history[key + 1].ink - action.ink);
                            const liqETH = liqInk * action.per;
                            const pip = toWei(this.props.history[key].pip);
                            message = <React.Fragment>
                                        Your CDP has been liquidated to pay back
                                        {printNumber(art)} DAI.
                                        Total {printNumber(liqETH)} ETH
                                        ({printNumber(liqInk)} PETH)
                                        has been liquidated at {printNumber(pip)} USD.
                                      </React.Fragment>;
                            image = 'history-icon-liquidation.svg';
                            break;
                          default:
                            break;
                        }
                        return (
                          <div className="history-cointainer" key={ key }>
                            <div className="history-icon">
                              <img src={ `img/${image}` } draggable="false" alt="" />
                              <div className="vertical-line"></div>
                            </div>
                            <div className="history-details">
                              <div className="history-date">{ formatDate(new Date(action.time).getTime() / 1000) }</div>
                              <span>
                                { message }
                              </span>
                              <span className="history-tx-links">
                              { etherscanAddress(this.props.network.network, 'Sender', action.guy) }
                              <span className="pipe-separator">&nbsp;|&nbsp;</span>
                              { etherscanTx(this.props.network.network, 'Tx Hash', action.tx) }
                              </span>
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
            }
          </div>
      </div>
    )
  }
}

export default observer(CupHistory);
