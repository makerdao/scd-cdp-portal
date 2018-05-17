import React from 'react';
import {observer} from "mobx-react";

class WalletHardHWSelector extends React.Component {

  selectAccount = e => {
    this.props.network.selectHWAddress(e.target.value);
  }

  render() {
    const defaultDerivationPath = this.props.network.hw.option === 'ledger' ? "m/44'/60'/0'" : "m/44'/60'/0'/0";
    return (
      <div>
        Select Network:
        <select ref={input => this.network = input}>
          <option value="kovan">Kovan</option>
          <option value="main">Mainnet</option>
        </select>
        <br />
        Select Derivation Path:
        <ul style={ {padding:'0px', margin: '0px', listStyle: 'none'} }>
          <li style={ {padding:'0px', margin: '0px'} }>
            { defaultDerivationPath } (default)&nbsp;
            <a href="#action" onClick={ e => {  e.preventDefault(); this.props.network.loadHWAddresses(this.network.value, defaultDerivationPath) } }>Load</a>
          </li>
          <li style={ {padding:'0px', margin: '0px'} }>
            <input type="text" style={ {width: '120px'} } ref={input => this.derivationPath = input}/>&nbsp;
            <a href="#action" onClick={ e => {  e.preventDefault(); this.props.network.loadHWAddresses(this.network.value, this.derivationPath.value) } }>Load</a>
          </li>
        </ul>
        {
          this.props.network.hw.addresses.length > 0 &&
          <React.Fragment>
            Choose Address:
            <button onClick={ () => this.props.network.loadHWAddresses(this.network.value) }>Load more addresses</button>
            <ul style={ {height: '200px', overflowY: 'scroll'} }>
              {
                this.props.network.hw.addresses.map(key =>
                  <li key={ key }><label><input type="radio" style={ {visibility: 'initial', WebkitAppearance: 'radio'} } checked={ key === this.props.network.hw.addresses[this.props.network.hw.addressIndex] } value={ key } onChange={ this.selectAccount } />{ key }</label></li>
                )
              }
            </ul>
            {
              this.props.network.hw.addressIndex !== null &&
              <button onClick={ this.props.network.importAddress }>Import Address</button>
            }
          </React.Fragment>
        }
      </div>
    )
  }
}

export default observer(WalletHardHWSelector);
