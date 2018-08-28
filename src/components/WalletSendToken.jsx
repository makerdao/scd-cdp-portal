// Libraries
import React from "react";
import {inject, observer} from "mobx-react";

// Utils
import {printNumber, formatNumber, isAddress, toWei} from "../utils/helpers";

@inject("profile")
@inject("system")
@observer
class WalletSendToken extends React.Component {
  constructor() {
    super();
    this.state = {
      fieldErrors: {}
    }
  }

  setAmount = () => {
    this.amount.value = formatNumber(this.props.sendToken === "eth" ? this.props.profile.accountBalance : this.props.system[this.props.sendToken].myBalance, false);
  }

  transfer = e => {
    e.preventDefault();
    const token = this.props.sendToken;
    const amount = this.amount.value;
    const destination = this.destination.value;
    const myBalance = token === "eth" ? this.props.profile.accountBalance : this.props.system[token].myBalance;
    this.setState({ fieldErrors: {} });

    if (!destination || !isAddress(destination)) {
      this.setState({ fieldErrors: { address: "Please enter a valid address" } });
    } else if (!amount) {
      this.setState({ fieldErrors: { amount: "Please enter a valid amount" } });
    } else if (myBalance.lt(toWei(amount))) {
      this.setState({ fieldErrors: { amount: `Not enough balance to transfer ${amount} ${this.props.tokenName(token)}` } });
    } else {
      this.props.system.transferToken(token, destination, amount);
      this.amount.value = "";
      this.destination.value = "";
      this.props.closeSendBox();
    }
  }

  render() {
    return (
      <React.Fragment>
        <div className="send-token">
          <div className="heading">
            <div className="back-arrow" onClick={ this.props.closeSendBox }>
              <svg width="10" height="15" viewBox="0 0 10 15" xmlns="http://www.w3.org/2000/svg">
                <path d="m6.97569475 14.7465148c-.1771738-.0949145-1.76189501-1.5945642-3.533633-3.3315002-3.54347599-3.45488909-3.60253392-3.54031217-3.3564592-4.35657717.10827288-.33220088.71853819-.97761972 3.39583116-3.57827799 1.79142397-1.7559189 3.40567414-3.25556856 3.59269093-3.34099164 1.19100165-.54101285 2.52964813.58847012 2.12608559 1.78439326-.0885869.25626925-.86618302 1.08202571-2.72650791 2.91387624-1.42723339 1.39524367-2.59854906 2.58167536-2.59854906 2.62913263 0 .03796581 1.17131567 1.2243975 2.59854906 2.62913267 1.8504819 1.8128676 2.63792101 2.6481155 2.72650791 2.9043847.41340553 1.2149061-1.11225774 2.4203207-2.22451548 1.7464275z" fill="#fff" transform="matrix(1 0 0 -1 0 15)"/>
              </svg>
            </div>
            <h2>Send { this.props.tokenName(this.props.sendToken) }</h2>
          </div>
          <section className="content">
            <form onSubmit={ this.transfer }>
              <div>
                <label>
                  Amount<br/>
                  <input className={ this.state.fieldErrors.amount ? "has-error" : "" } type="number" ref={ input => this.amount = input } placeholder="0.00" step="0.000000000000000001" />
                </label>
                <div className="below-input-info" style={ {cursor: "pointer"} } onClick={ this.setAmount }>{ printNumber(this.props.sendToken === "eth" ? this.props.profile.accountBalance : this.props.system[this.props.sendToken].myBalance) } { ` ${ this.props.tokenName(this.props.sendToken) } available` }</div>
              </div>
              { this.state.fieldErrors.amount && <p className="error">{ this.state.fieldErrors.amount }</p> }

              <div style={ {marginTop: "1.2rem"} }>
                <label>
                  Destination<br/>
                  <input className={ this.state.fieldErrors.address ? "has-error" : "" } type="text" ref={ input => this.destination = input } maxLength="42" placeholder="0x01234..." />
                </label>
              </div>
              { this.state.fieldErrors.address && <p className="error">{ this.state.fieldErrors.address }</p> }

              <div className="align-center" style={ {margin: "3rem 0"} }>
                <button className="sidebar-btn is-secondary" onClick={ this.props.closeSendBox }>Cancel</button>
                <button className="sidebar-btn is-primary-green" type="submit">Send</button>
              </div>
            </form>
          </section>
        </div>
      </React.Fragment>
    )
  }
}

export default WalletSendToken;
