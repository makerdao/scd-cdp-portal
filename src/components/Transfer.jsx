import React from 'react';
import {observer} from 'mobx-react';
import {printNumber, isAddress, toWei} from '../helpers';

class Transfer extends React.Component {
  state = {
    token: 'gem',
    to: '',
    error: ''
  };

  fillTo = (e) => {
    e.preventDefault();
    this.setState({ to: e.target.getAttribute('data-address')});
  }

  onChangeToken = () => {
    this.setState((prevState, props) => {
      return { token: this.token.value };
    });
  }

  onChangeTo = () => {
    this.setState((prevState, props) => {
      return { to: this.to.value };
    });
  }

  transfer = (e) => {
    e.preventDefault();
    const token = this.token.value;
    const to = isAddress(this.to.value) ? this.to.value : false;
    const amount = this.amount.value
    this.setState({ error: '' });

    if (!to) {
      this.setState({ error: 'Invalid Address' });
    } else if (!amount) {
      this.setState({ error: 'Invalid Amount' });
    } else if (this.props.system[token].myBalance.lt(toWei(amount))) {
      this.setState({ error: `Not enough balance to transfer ${amount} ${token}` });
    } else if (token) {
      this.props.system.transferToken(token, to, amount);
      this.to.value = '';
      this.amount.value = '';
    }
  }

  renderError = () => {
    return (
      <p className="error">
        { this.state.error }
      </p>
    )
  }

  render = () => {
    return (
      <div className="row col col-extra-padding">
        <h2 className="typo-h3 typo-white">Transfer</h2>
        <p>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. 
        </p>
        <div>
          <form className="transfer" ref={ input => this.transferForm = input } onSubmit={ e => this.transfer(e) }>
            <label>Token</label>
            <select ref={(input) => this.token = input} onChange={ this.onChangeToken }>
              <option value="gem">WETH</option>
              <option value="gov">MKR</option>
              <option value="dai">DAI</option>
              <option value="skr">PETH</option>
            </select>
            <label>Balance: { printNumber(this.props.system[this.state.token].myBalance) }</label>
            <label>
              To
            </label>
            <input ref={(input) => this.to = input} value={ this.state.to } onChange={ this.onChangeTo } type="text" placeholder="0x" />
            {
              this.props.proxyFactory
              ?
                this.props.profile.mode === 'proxy'
                ? <a href="#acction" data-address={ this.props.account } onClick={ this.fillTo }>Send to my main account</a>
                : <a href="#acction" data-address={ this.props.profile.proxy } onClick={ this.fillTo }>Send to my proxy profile</a>
              :
                ''
            }
            <label>Amount</label>
            <input ref={(input) => this.amount = input} type="number" placeholder="0.00" step="0.000000000000000001" />
            { this.state.error ? this.renderError() : '' }
            <div>
              <button className="text-btn text-btn-primary" type="submit">Submit</button>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default observer(Transfer);