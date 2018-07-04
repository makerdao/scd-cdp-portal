import React from 'react';
import ReactDOMServer from 'react-dom/server';
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
                        const printNumberString = number => ReactDOMServer.renderToString(printNumber(number));
                        let message = '', image = 'history-icon-unknown.svg';
                        switch(action.act) {
                          case 'OPEN':
                            message = 'Opened your CDP';
                            image = 'history-icon-open.svg';
                            break;
                          case 'GIVE':
                            message = `Transferred CDP from ${ReactDOMServer.renderToString(etherscanAddress(this.props.network, `${this.props.history[key + 1].guy.substring(0,20)}...`, this.props.history[key + 1].guy))}`;
                            image = 'history-icon-give.svg';
                            break;
                          case 'LOCK':
                            message = `Deposited ${printNumberString(toWei(action.arg * action.per))} ETH (${printNumberString(toWei(action.arg))} PETH) to your CDP`;
                            image = 'history-icon-locked.svg';
                            break;
                          case 'FREE':
                            message = `Withdrew ${printNumberString(toWei(action.arg * action.per))} ETH (${printNumberString(toWei(action.arg))} PETH) from your CDP`;
                            image = 'history-icon-payback.svg';
                            break;
                          case 'DRAW':
                            message = `Generated ${printNumberString(toWei(action.arg))} DAI from your CDP`;
                            image = 'history-icon-borrow.svg';
                            break;
                          case 'WIPE':
                            message = `Paidback ${printNumberString(toWei(action.arg))} DAI to your CDP`;
                            image = 'history-icon-transfer.svg'; // Should this be 'history-icon-payback.svg' instead?
                            break;
                          case 'SHUT':
                            message = 'Closed your CDP';
                            image = 'history-icon-unknown.svg';
                            break;
                          case 'BITE':
                            const art = toWei(this.props.history[key + 1].art);
                            const liqInk = toWei(this.props.history[key + 1].ink - action.ink);
                            const liqETH = liqInk * action.per;
                            const pip = toWei(this.props.history[key].pip);
                            message = `Your CDP has been liquidated to pay back ` +
                                      `${ReactDOMServer.renderToString(printNumber(art))} DAI. ` +
                                      `Total ${ReactDOMServer.renderToString(printNumber(liqETH))} ETH ` +
                                      `(${ReactDOMServer.renderToString(printNumber(liqInk))} PETH) ` +
                                      `has been liquidated at ${ReactDOMServer.renderToString(printNumber(pip))} USD.`;
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
                              <span dangerouslySetInnerHTML={{ __html: message }}></span>
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
