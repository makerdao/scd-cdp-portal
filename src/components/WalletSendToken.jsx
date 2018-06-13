import React from 'react';
import {observer} from 'mobx-react';
import {printNumber, isAddress, toWei} from '../helpers';

class WalletSendToken extends React.Component {
  constructor() {
    super();
    this.state = {
      error: null
    }
  }

  transfer = e => {
    e.preventDefault();
    const token = this.props.sendToken;
    const amount = this.amount.value;
    const destination = this.destination.value;
    const myBalance = token === 'eth' ? this.props.profile.accountBalance : this.props.system[token].myBalance;
    this.setState({ error: '' });

    if (!destination || !isAddress(destination)) {
      this.setState({ error: 'Invalid Address' });
    } else if (!amount) {
      this.setState({ error: 'Invalid Amount' });
    } else if (myBalance.lt(toWei(amount))) {
      this.setState({ error: `Not enough balance to transfer ${amount} ${this.props.tokenName(token)}` });
    } else {
      this.props.system.transferToken(token, destination, amount);
      this.amount.value = '';
      this.destination.value = '';
    }
  }

  render() {
    return (
      <React.Fragment>
        <a href="#action" onClick={ this.closeSendBox }>&lt;</a> Send { this.props.tokenName(this.props.sendToken) }
        <form onSubmit={ this.transfer }>
          <div>
            <label>
              Amount<br/>
              <input type="number" ref={ input => this.amount = input } placeholder="0.00" step="0.000000000000000001" />
            </label>
            { printNumber(this.props.sendToken === 'eth' ? this.props.profile.accountBalance : this.props.system[this.props.sendToken].myBalance) }
            { ` ${ this.props.tokenName(this.props.sendToken) } available` }
          </div>
          <div>
            <label>
              Destination<br/>
              <input type="text" ref={ input => this.destination = input } />
            </label>
          </div>
          {
            this.state.error &&
            <div className="error">
              { this.state.error }
            </div>
          }
          <div>
            <button className="text-btn text-btn-primary" onClick={ this.props.closeSendBox }>Cancel</button>
            <button className="text-btn text-btn-primary" type="submit">Send</button>
          </div>
        </form>
      </React.Fragment>
    )
  }
}

export default observer(WalletSendToken);
