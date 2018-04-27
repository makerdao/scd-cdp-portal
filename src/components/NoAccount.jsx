import React from 'react';

class NoConnection extends React.Component {
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
              <a href="#action" onClick={ this.props.network.loadLedger }>Connect to Ledger</a>
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export default NoConnection;
