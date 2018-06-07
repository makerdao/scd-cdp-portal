import React from 'react';
import {observer} from "mobx-react";

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
            `Connecting to ${this.props.network.hw.option}`
          :
            <React.Fragment>
              {
                this.props.network.hw.error &&
                <React.Fragment>
                  { this.props.network.hw.error }<br />
                  Select Network:&nbsp;
                  <select ref={input => this.network = input}>
                    <option value="kovan">Kovan</option>
                    <option value="main">Mainnet</option>
                  </select>
                  <br />
                  Select Derivation Path: &nbsp;
                  <div>
                    <input type="text" style={ {width: '120px'} } defaultValue={ this.props.network.hw.derivationPath } ref={input => this.derivationPath = input}/>&nbsp;
                    <a href="#action" onClick={ e => {  e.preventDefault(); this.props.network.loadHWAddresses(this.network.value, this.derivationPath.value) } }>Load</a>
                  </div>
                </React.Fragment>
              }
              {
                this.props.network.hw.addresses.length > 0 &&
                <React.Fragment>
                  Choose Address:
                  <select onChange={ this.selectAccount } defaultValue={ this.props.network.hw.addresses[this.props.network.hw.addressIndex] } >
                    {
                      this.props.network.hw.addresses.map(key =>
                        <option key={ key } value={ key }>{ key }</option>
                      )
                    }
                  </select>
                  {
                    <button onClick={ this.props.network.importAddress }>Connect this Address</button>
                  }
                </React.Fragment>
              }
            </React.Fragment>
        }
      </div>
    )
  }
}

export default observer(WalletHardHWSelector);
