import React from 'react';
import {observer} from "mobx-react";
import {getCurrentProviderName} from '../blockchainHandler';

class NoAccount extends React.Component {
  render() {
    return (
      <div>
        <header className="col">
          <h1 className="typo-h1">Log in to { this.props.formatClientName(getCurrentProviderName()) }</h1>
        </header>
        <div className="row">
          <div className="col">
            <p className="typo-cl">
              <button href="#action" onClick={ this.props.network.stopNetwork }>Cancel</button>
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export default observer(NoAccount);
