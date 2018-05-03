import React from 'react';
import {observer} from "mobx-react";

class NoAccount extends React.Component {
  render() {
    return (
      <div>
        <header className="col">
          <h1 className="typo-h1">No account connected</h1>
        </header>
        <div className="row">
          <div className="col">
            <p className="typo-cl">
              We could not find an account, please connect your account.<br />
            </p>
            <p>
              <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.showHW('ledger') } }>Connect to Ledger</a>
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export default observer(NoAccount);
