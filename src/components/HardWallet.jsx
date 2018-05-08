import React from 'react';
import {observer} from "mobx-react";

class HardWallet extends React.Component {

  selectAccount = e => {
    this.props.network.selectHWAddress(e.target.value);
  }

  importAddress = () => {
    this.props.network.importAddress();
    this.props.loadContracts();
  }

  render() {
    const defaultDerivationPath = this.props.network.hw.option === 'ledger' ? "m/44'/60'/0'" : "m/44'/60'/0'/0";
    return (
      this.props.network.hw.show &&
      <div style={ {position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, background: 'rgba(255,255,255,0.4)', zIndex: 997} }>
        <div style={ {position: 'relative', width: '800px', height: '500px', background: '#202930', zIndex: 998, margin: 'auto'} }>
          Select Derivation Path:
          <ul style={ {padding:'0px', margin: '0px', listStyle: 'none'} }>
            <li style={ {padding:'0px', margin: '0px'} }>
              { defaultDerivationPath } (default)&nbsp;
              <a href="#action" onClick={ e => {  e.preventDefault(); this.props.network.loadHWAddresses(defaultDerivationPath) } }>Load</a>
            </li>
            <li style={ {padding:'0px', margin: '0px'} }>
              <input type="text" style={ {width: '120px'} } ref={input => this.derivationPath = input}/>&nbsp;
              <a href="#action" onClick={ e => {  e.preventDefault(); this.props.network.loadHWAddresses(this.derivationPath.value) } }>Load</a>
            </li>
          </ul>
          {
            this.props.network.hw.addresses.length > 0 &&
            <React.Fragment>
              Choose Address:
              <button onClick={ this.props.network.loadMoreHwAddresses }>Load more addresses</button>
              <ul style={ {height: '200px', overflowY: 'scroll'} }>
                {
                  this.props.network.hw.addresses.map(key =>
                    <li key={ key }><label><input type="radio" style={ {visibility: 'initial', WebkitAppearance: 'radio'} } checked={ key === this.props.network.hw.addresses[this.props.network.hw.addressIndex] } value={ key } onChange={ this.selectAccount } />{ key }</label></li>
                  )
                }
              </ul>
              {
                this.props.network.hw.addressIndex !== null &&
                <button onClick={ this.importAddress }>Import Address</button>
              }
            </React.Fragment>
          }
        </div>
      </div>
    )
  }
}

export default observer(HardWallet);
