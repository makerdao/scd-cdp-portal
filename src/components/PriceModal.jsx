import React from 'react';
import {observer} from "mobx-react";

class PriceModal extends React.Component {
  sendTransaction = e => {
    e.preventDefault();
    this.props.transactions.sendTransaction(this.gasPrice.value);
  }

  render() {
    return (
      <React.Fragment>
        {
          this.props.transactions.priceModal.open &&
          <div style={ {position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, background: 'rgba(255,255,255,0.4)', zIndex: 997} }>
            <div style={ {position: 'relative', width: '700px', height: '400px', background: '#202930', zIndex: 998, margin: 'auto'} }>
              <h2>Set your gas price</h2>
              <p>
                Gas is used to pay for transactions. A higher gas price results in faster confirmation times.
              </p>
              <form onSubmit={ this.sendTransaction }>
                <input type="number" ref={ input => this.gasPrice = input }/>
                <button onClick={ this.props.transactions.closePriceModal }>Cancel</button>
                <button type="submit">Confirm</button>
              </form>
            </div>
          </div>
        }
      </React.Fragment>
    )
  }
}

export default observer(PriceModal);
