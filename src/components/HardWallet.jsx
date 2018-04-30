import React from 'react';
import {observer} from "mobx-react";

class HardWallet extends React.Component {

  selectDerivationPath = e => {
    this.props.network.loadHWAddresses(e.target.value);
  }

  selectAccount = e => {
    this.props.network.selectHWAddress(e.target.value);
  }

  importAddress = () => {
    this.props.network.importAddress();
    this.props.loadContracts();
  }

  render() {
    return (
      this.props.network.hw.show &&
      <div style={ {position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, background: 'rgba(255,255,255,0.4)', zIndex: 997} }>
        <div style={ {position: 'relative', width: '800px', height: '500px', background: '#202930', zIndex: 998, margin: 'auto'} }>
          Select Derivation Path:
          <ul>
            <li><label><input type="radio" style={ {visibility: 'initial', WebkitAppearance: 'radio'} } checked={ this.props.network.hw.derivationPath === "m/44'/60'/0'/0" } onChange={ this.selectDerivationPath } value="m/44'/60'/0'/0"/>m/44'/60'/0'/0 - Jaxx, Metamask, Exodus, imToken, TREZOR (ETH) &amp; Digital Bitbox</label></li>
            <li><label><input type="radio" style={ {visibility: 'initial', WebkitAppearance: 'radio'} } checked={ this.props.network.hw.derivationPath === "m/44'/60'/0'" } onChange={ this.selectDerivationPath } value="m/44'/60'/0'"/>m/44'/60'/0' - Ledger (ETH)</label></li>
            <li><label><input type="radio" style={ {visibility: 'initial', WebkitAppearance: 'radio'} } checked={ this.props.network.hw.derivationPath === "m/44'/61'/0'/0" } onChange={ this.selectDerivationPath } value="m/44'/61'/0'/0"/>m/44'/61'/0'/0 - TREZOR (ETC)</label></li>
            <li><label><input type="radio" style={ {visibility: 'initial', WebkitAppearance: 'radio'} } checked={ this.props.network.hw.derivationPath === "m/44'/60'/160720'/0'" } onChange={ this.selectDerivationPath } value="m/44'/60'/160720'/0'"/>m/44'/60'/160720'/0' - Ledger (ETC)</label></li>
            <li><label><input type="radio" style={ {visibility: 'initial', WebkitAppearance: 'radio'} } checked={ this.props.network.hw.derivationPath === "m/0'/0'/0'" } onChange={ this.selectDerivationPath } value="m/0'/0'/0'"/>m/0'/0'/0' - SingularDTV</label></li>
            <li><label><input type="radio" style={ {visibility: 'initial', WebkitAppearance: 'radio'} } checked={ this.props.network.hw.derivationPath === "m/44'/1'/0'/0" } onChange={ this.selectDerivationPath } value="m/44'/1'/0'/0"/>m/44'/1'/0'/0 - Network: Testnets</label></li>
            <li><label><input type="radio" style={ {visibility: 'initial', WebkitAppearance: 'radio'} } checked={ this.props.network.hw.derivationPath === "m/44'/40'/0'/0" } onChange={ this.selectDerivationPath } value="m/44'/40'/0'/0"/>m/44'/40'/0'/0 - Network: Expanse</label></li>
          </ul>
          Choose Address:
          <ul style={ {height: '200px', overflowY: 'scroll'} }>
            {
              this.props.network.hw.addresses.map(key => 
                <li key={ key }><label><input type="radio" style={ {visibility: 'initial', WebkitAppearance: 'radio'} } checked={ key === this.props.network.hw.addresses[this.props.network.hw.addressIndex] } value={ key } onChange={ this.selectAccount } />{ key }</label></li>
              )
            }
          </ul>
          {
            this.props.network.hw.addresses.length > 0 &&
            <button onClick={ this.props.network.loadMoreHwAddresses }>Load more addresses</button>
          }
          {
            this.props.network.hw.addressIndex !== null &&
            <button onClick={ this.importAddress }>Import Address</button>
          }
        </div>
      </div>
    )
  }
}

export default observer(HardWallet);
