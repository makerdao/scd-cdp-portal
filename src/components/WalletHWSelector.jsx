// Libraries
import React from "react";
import {inject, observer} from "mobx-react";
import createClass from "create-react-class";
import PropTypes from "prop-types";
import Select from "react-select";

// Components
import LoadingSpinner from "./LoadingSpinner";

// Utils
import {getJazziconIcon, capitalize, truncateAddress} from "../utils/helpers";

const SHOW_ADDRESSES_MAX = 10;
const IDENTICON_SIZE = 18;
const identiconStyle = {
  borderRadius: 3,
  display: "inline-block",
  marginRight: 10,
  position: "relative",
  top: -2,
  verticalAlign: "middle",
};

const stringOrNode = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.node,
]);

const IdenticonOption = createClass({
  propTypes: {
    children: PropTypes.node,
    className: PropTypes.string,
    isDisabled: PropTypes.bool,
    isFocused: PropTypes.bool,
    isSelected: PropTypes.bool,
    onFocus: PropTypes.func,
    onSelect: PropTypes.func,
    option: PropTypes.object.isRequired,
  },
  handleMouseDown (event) {
    event.preventDefault();
    event.stopPropagation();
    this.props.onSelect(this.props.option, event);
  },
  handleMouseEnter (event) {
    this.props.onFocus(this.props.option, event);
  },
  handleMouseMove (event) {
    if (this.props.isFocused) return;
    this.props.onFocus(this.props.option, event);
  },
  render () {
    return (
      <div className={this.props.className} onMouseDown={this.handleMouseDown} onMouseEnter={this.handleMouseEnter} onMouseMove={this.handleMouseMove} title={this.props.option.title}>
        <span style={ identiconStyle }>{ getJazziconIcon(this.props.option.value, IDENTICON_SIZE) }</span>
        { this.props.children }
      </div>
    );
  }
});

const IdenticonValue = createClass({
  propTypes: {
    children: PropTypes.node,
    placeholder: stringOrNode,
    value: PropTypes.object
  },
  render () {
    return (
      <div className="Select-value" title={this.props.value.title}>
        <span className="Select-value-label">
          <span style={ identiconStyle }>{ getJazziconIcon(this.props.value.value, IDENTICON_SIZE) }</span>
          { this.props.children }
        </span>
      </div>
    );
  }
});

@inject("network")
@observer
class WalletHardHWSelector extends React.Component {
  state = {
    selectedOption: null
  }
  loadLedgerAddresses = type => {
    localStorage.setItem("loadLedgerLegacy", type === "legacy");
    this.props.network.showHW("ledger");
  }
  selectAccount = selectedOption => {
    if (selectedOption) {
      this.setState({ selectedOption: selectedOption.value });
    }
  }
  render() {
    const selectOptions = []
    for (var i = 0; i < this.props.network.hw.addresses.length - 1 && i < SHOW_ADDRESSES_MAX; i++) {
      selectOptions.push({
        value: this.props.network.hw.addresses[i],
        label: truncateAddress(this.props.network.hw.addresses[i], 10)
      })
    }
    let value = this.state.selectedOption;
    if (!value && this.props.network.hw.addresses.length > 0) value = selectOptions[0].value;
    return (
      <div>
        {
          this.props.network.hw.loading
          ?
            <React.Fragment>
              {
                this.props.network.hw.option.substring(0, 6) === "ledger" &&
                <React.Fragment>
                  <h2>Plug in Ledger &amp; Enter Pin</h2>
                  <p className="typo-c align-center">Open ETH application and make sure Contract Data and Browser Support are enabled.</p>
                </React.Fragment>
              }
              {
                this.props.network.hw.option === "trezor" &&
                <React.Fragment>
                  <h2>Plugin Trezor</h2>
                  <p className="typo-c align-center">Export account from Trezor Popup.<br />Make sure your browser is not blocking it.</p>
                </React.Fragment>
              }
              <LoadingSpinner />
              <div className="align-center" style={ {margin: "1rem 0"} }>
                <button className="sidebar-btn is-secondary" href="#action" onClick={ this.props.network.hideHw }>Cancel</button>
              </div>
            </React.Fragment>
          :
            <React.Fragment>
              {
                this.props.network.hw.error
                ?
                  <React.Fragment>
                    <h2 className="connect-fail">{ capitalize(this.props.network.hw.option.replace("-", " ")) } Connection Failed</h2>
                    {
                      this.props.network.hw.option.substring(0, 6) === "ledger" &&
                      <div className="typo-c">
                        <ol>
                          <li>Unlock your Ledger and open the ETH application.</li>
                          <li>Verify Contract Data &amp; Browser Support are enabled in the ETH settings.</li>
                          <li>If Browser Support is not an option in settings, update to the latest firmware.</li>
                        </ol>
                      </div>
                    }
                    {
                      this.props.network.hw.option === "trezor" &&
                      <p className="typo-c align-center">Error connecting to Trezor.</p>
                    }
                    <div className="align-center" style={ {margin: "2rem 0 1rem "} }>
                      <button className="sidebar-btn is-secondary" href="#action" onClick={ this.props.network.hideHw }>Cancel</button><button className="sidebar-btn is-primary" href="#action" onClick={ this.props.network.loadHWAddresses }>Detect</button>
                    </div>
                  </React.Fragment>
                :
                  this.props.network.hw.addresses.length > 0 &&
                  <React.Fragment>
                    <h2 className="connect-success">{ capitalize(this.props.network.hw.option.replace("-", " ")) } Connected</h2>
                    <section style={ { width: "75%", margin: "0 auto" } }>
                      <p className="typo-c align-center" style={ {color: "#fff"} }><span className="green-dot"></span>{ this.props.network.hw.network === "main" ? "Main Ethereum" : capitalize(this.props.network.hw.network) + " Test" } Network</p>
                      <div style={ {margin: "2.5rem 0 0"} }>
                        <Select
                          name="wallet-address"
                          value={ value }
                          valueComponent={ IdenticonValue }
                          options={ selectOptions }
                          optionComponent={ IdenticonOption }
                          onChange={ this.selectAccount }
                          clearable={ false }
                          searchable={ false }
                          />
                        </div>
                        {
                          this.props.network.hw.option.substring(0, 6) === "ledger" &&
                          <div>
                            <div style={ {margin: "0.5rem auto 2.4rem", textAlign: "center"} }>
                              <a
                                className="switch-ledger-type"
                                href="#action"
                                onClick={ e => {
                                                  e.preventDefault();
                                                  this.loadLedgerAddresses(this.props.network.hw.option === "ledger-live" ? "legacy" : "live");
                                                }}>
                                View { this.props.network.hw.option === "ledger-live" ? "legacy" : "live" } addresses
                              </a>
                            </div>
                          </div>
                        }
                        <div className="align-center">
                          <button className="sidebar-btn is-primary-green" style={ {width: "100%"} } onClick={ () => this.props.network.importAddress(value ? value : selectOptions[0].value) }>Connect this address</button>
                        </div>
                        <div className="align-center" style={ {margin: "4rem 0 2rem"} }>
                          <button className="sidebar-btn is-secondary" href="#action" onClick={ this.props.network.hideHw }>Cancel</button>
                        </div>
                    </section>
                  </React.Fragment>
              }
            </React.Fragment>
        }
      </div>
    )
  }
}

export default WalletHardHWSelector;
