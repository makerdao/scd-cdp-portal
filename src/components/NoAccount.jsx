import React from 'react';

const NoConnection = () => {
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
        </div>
      </div>
    </div>
  )
}

export default NoConnection;
