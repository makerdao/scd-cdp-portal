import React, { Component } from 'react';
import { etherscanAddress, etherscanTx, printNumber, formatDate } from '../helpers';

class CupHistory extends Component {
  render() {
    return (
      <div>
        <h2>CDP History</h2>
          <div className="content">
            {
              false
              ?
                <div className="col-md-12 system-status">
                  <div>History is not available at this moment</div>
                </div>
              :
                <table>
                  <thead>
                    <tr>
                      <th>
                        Date
                      </th>
                      <th>
                        Sender
                      </th>
                      <th>
                        Action
                      </th>
                      <th>
                        Value
                      </th>
                      <th>
                        Tx
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                    this.props.actions && this.props.actions.length > 0
                    ?
                      Object.keys(this.props.actions).map(key =>
                        <tr key={ key }>
                          <td>
                            { formatDate(this.props.actions[key].timestamp) }
                          </td>
                          <td>
                            { etherscanAddress(this.props.network, `${this.props.actions[key].sender.substring(0,20)}...`, this.props.actions[key].sender) }
                          </td>
                          <td>
                            { this.props.actions[key].action }
                          </td>
                          <td className="text-right">
                            {
                              ['lock', 'free', 'draw', 'wipe'].indexOf(this.props.actions[key].action) !== -1
                              ?
                                printNumber(this.props.actions[key].param)
                              :
                                this.props.actions[key].action === 'give'
                                ? etherscanAddress(this.props.network, `${this.props.actions[key].param.substring(0,20)}...`, this.props.actions[key].param)
                                : this.props.actions[key].param
                            }
                            {
                              ['lock', 'free'].indexOf(this.props.actions[key].action) !== -1
                              ?
                                ' PETH'
                              :
                                ['draw', 'wipe'].indexOf(this.props.actions[key].action) !== -1
                                ?
                                  ' DAI'
                                :
                                  ''
                            }
                          </td>
                          <td>
                            { etherscanTx(this.props.network, `${this.props.actions[key].transactionHash.substring(0,20)}...`, this.props.actions[key].transactionHash) }
                          </td>
                        </tr>
                      )
                    :
                      ''
                    }
                  </tbody>
                </table>
            }
          </div>
      </div>
    )
  }
}

export default CupHistory;
