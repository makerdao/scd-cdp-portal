import React from 'react';
import {observer} from "mobx-react";

class NotifySetUp extends React.Component {
  render() {
    const txs = Object.keys(this.props.transactions.registry).filter(tx => this.props.transactions.registry[tx].cdpCreationTx);

    return (
      this.props.transactions.showCreatingCdpModal &&
      <div className="modal create-cdp">
        <div className="modal-inner">
          {
            this.props.transactions.registry[txs[0]].pending || Object.keys(this.props.system.tub.cups).length === 0
            ?
              <React.Fragment>
                <h2>Creating your CDP</h2>
                <img className="main" src="../img/cdp-creating-1.svg" />
                <p style={ {margin: 'margin: 0 auto', padding: '2rem 0 2.5rem'} }>
                  Creating your new CDP...
                </p>
              </React.Fragment>
            :
              <React.Fragment>
                <h2>Congratulations on your new CDP</h2>
                <img className="main" src="../img/cdp-created.svg" />
                <p>
                  Welcome to your CDP dashboard where you can view and manage<br />your collateral and debt position on a decentralized system.
                </p>
                <ul>
                  <li>
                    <div className="icon"><img src="../img/cdp-created-icon-1.svg" alt="*" style={ {height: '24px'} } /></div>
                    Check current collateral<br />to debt position
                  </li>
                  <li>
                    <div className="icon"><img src="../img/cdp-created-icon-2.svg" alt="*" style={ {height: '25px'} } /></div>
                    Add more or withdraw<br />collateral
                  </li>
                  <li>
                    <div className="icon"><img src="../img/cdp-created-icon-3.svg" alt="*" style={ {height: '30px'} } /></div>
                    Generate or pay<br />back DAI
                  </li>
                </ul>
                <div className="align-center" style={ {paddingBottom: '3.7rem', userSelect: 'none'} }>
                  <button className="modal-btn is-primary" onClick={ () => this.props.transactions.cleanCdpCreationProperty(txs[0]) } style={ {width: '13rem'} }>OK</button>
                </div>
              </React.Fragment>
          }
      </div>
    </div>
    )
  }
}

export default observer(NotifySetUp);
