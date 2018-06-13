import React from 'react';
import {observer} from "mobx-react";
import {capitalize} from "../helpers";

const settings = require('../settings');

class WalletHardHWSelector extends React.Component {

  selectAccount = e => {
    this.props.network.selectHWAddress(e.target.value);
  }

  render() {
    return (
      <div>
        {
          this.props.network.hw.loading
          ?
            <React.Fragment>
              {
                this.props.network.hw.option === 'ledger' &&
                <React.Fragment>
                  <h2>Plugin Ledger &amp; Enter Pin</h2>
                  <p>Open ETH application and make sure Contract Data and Browser Support are enabled.</p>
                </React.Fragment>
              }
              {
                this.props.network.hw.option === 'trezor' &&
                <React.Fragment>
                  <h2>Plugin Trezor</h2>
                  <p>Export account from Trezor Popup. Make sure your browser is not blocking it.</p>
                </React.Fragment>
              }
              <button href="#action" onClick={ this.props.network.hideHw }>Cancel</button>
            </React.Fragment>
          :
            <React.Fragment>
              {
                this.props.network.hw.error
                ?
                  <React.Fragment>
                    <h2>{ capitalize(this.props.network.hw.option) } Connection Failed</h2>
                    {
                      this.props.network.hw.option === 'ledger' &&
                      <ul>
                        <li>Unlock you ledger and open the ETH application.</li>
                        <li>Verify Contract Data &amp; Browser Support are enabled in the ETH settings.</li>
                        <li>If Browser Support is not an option in settings, update to the latest firmware.</li>
                      </ul>
                    }
                    <div>
                      <button href="#action" onClick={ this.props.network.hideHw }>Cancel</button>&nbsp;
                      <button href="#action" onClick={ this.props.network.loadHWAddresses }>Detect</button>
                    </div>
                  </React.Fragment>
                :
                  this.props.network.hw.addresses.length > 0 &&
                  <React.Fragment>
                    <h2>{ capitalize(this.props.network.hw.option) } Connected</h2>
                    <h3>{ settings.hwNetwork === 'main' ? 'Etherem' : 'Test' } { settings.hwNetwork } Network</h3>
                    <select onChange={ this.selectAccount } defaultValue={ this.props.network.hw.addresses[this.props.network.hw.addressIndex] } >
                      {
                        this.props.network.hw.addresses.map(key =>
                          <option key={ key } value={ key }>{ key }</option>
                        )
                      }
                    </select>
                    <button onClick={ this.props.network.importAddress }>Connect this Address</button><br />
                    <button href="#action" onClick={ this.props.network.hideHw }>Cancel</button>
                  </React.Fragment>
              }
            </React.Fragment>
        }
      </div>
    )
  }
}

export default observer(WalletHardHWSelector);
