import React from 'react';
import {observer} from 'mobx-react';
import Transfer from './Transfer';

const settings = require('../settings');

class Settings extends React.Component {
  stopHw = () => {
    this.props.network.stopHw();
    this.props.loadContracts();
  }

  render() {
    const isLedger = this.props.network.isHw && this.props.network.hw.option === 'ledger';
    return (
      <div>
        <header className="col">
          <h1 className="typo-h1">Settings</h1>
        </header>
        {
          <div className="row col col-extra-padding">
            <h2 className="typo-h3 typo-white">Hard Wallets</h2>
              {
                isLedger &&
                <React.Fragment>
                  <p>
                    Address imported: { this.props.network.defaultAccount }
                  </p>
                  <p>
                    <a href="#action" onClick={ e => { e.preventDefault(); this.stopHw() } }>Stop using Ledger</a>
                  </p>
                </React.Fragment>
              }
            <p>
              <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.showHW('ledger') } }>
                { isLedger ? 'Change account from Ledger' : 'Connect to Ledger' }
              </a>
            </p>
          </div>
        }
        {
          this.props.profile.proxy &&
          <Transfer system={ this.props.system } profile={ this.props.profile } proxyFactory={ settings.chain[this.props.network.network].proxyFactory } account={ this.props.account } />
        }
        {
          this.props.profile.proxy &&
          Object.keys(this.props.system.tub.cups).length > 0 &&
          <div className="row">
            <div className="col col-extra-padding">
              <h2 className="typo-h3 typo-white">My CDP{Object.keys(this.props.system.tub.cups).length > 1 ? 's' : ''}</h2>
              <p>
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. 
              </p>
              {
                Object.keys(this.props.system.tub.cups).map(key => <button className="text-btn" data-method="shut" key={ key } data-cup={ key } onClick={ this.props.handleOpenDialog }>Close CDP #{ key }</button>)
              }
            </div>
          </div>
        }
      </div>
    )
  }
}

export default observer(Settings);
