import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {observer} from 'mobx-react';
import {etherscanAddress, etherscanTx, printNumber, formatDate, toWei} from '../helpers';

class CupHistory extends React.Component {
  render() {
    return (
      <div className="col col-extra-padding">
        <h2>CDP History</h2>
          <div>
            {
              false
              ?
                <div className="col-md-12 system-status">
                  <div>History is not available at this moment</div>
                </div>
              :
                <div>
                  {
                    this.props.actions && this.props.actions.length > 0 &&
                    Object.keys(this.props.actions).map(key => {
                      let message = '';
                      switch(this.props.actions[key].act) {
                        case 'OPEN':
                          message = 'Opened your CDP';
                          break;
                        case 'GIVE':
                          message = `Transferred your CDP to ${ReactDOMServer.renderToString(etherscanAddress(this.props.network, `${this.props.actions[key].arg.substring(0,20)}...`, this.props.actions[key].arg))}`;
                          break;
                        case 'LOCK':
                          message = `Deposited ${ReactDOMServer.renderToString(printNumber(toWei(this.props.actions[key].arg)))} ETH to your CDP`;
                          break;
                        case 'FREE':
                          message = `Withdraw ${ReactDOMServer.renderToString(printNumber(toWei(this.props.actions[key].arg)))} ETH from your CDP`;
                          break;
                        case 'DRAW':
                          message = `Generated ${ReactDOMServer.renderToString(printNumber(toWei(this.props.actions[key].arg)))} DAI from your CDP`;
                          break;
                        case 'WIPE':
                          message = `Paidback ${ReactDOMServer.renderToString(printNumber(toWei(this.props.actions[key].arg)))} DAI to your CDP`;
                          break;
                        case 'SHUT':
                          message = 'Closed your CDP';
                          break;
                        case 'BITE':
                          message = 'Liquidated your CDP';
                          break;
                        default:
                          break;
                      }
                      return (
                        <div key={ key } style={ {marginBottom: '10px'} }>
                          { formatDate(new Date(this.props.actions[key].time).getTime() / 1000) }<br />
                          <span dangerouslySetInnerHTML={{__html: message}}></span>&nbsp;
                          { etherscanAddress(this.props.network.network, 'Sender', this.props.actions[key].guy) }&nbsp;
                          { etherscanTx(this.props.network.network, 'Tx Hash', this.props.actions[key].tx) }
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
