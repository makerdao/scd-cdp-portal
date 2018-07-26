// Libraries
import React from "react";
import {inject, observer} from "mobx-react";

// Components
import LoadingSpinner from "./LoadingSpinner";

// Utils
import {getCurrentProviderName} from "../utils/blockchain-handler";

class NoAccount extends React.Component {
  render() {
    return (
      <div>
        <h2>Log In to { this.props.formatClientName(getCurrentProviderName()) }</h2>
        <p className="typo-c align-center">Please unlock your { this.props.formatClientName(getCurrentProviderName()) } account to continue.</p>
        <LoadingSpinner />
        <div className="align-center" style={ {margin: "1rem 0"} }>
          <button className="sidebar-btn is-secondary" href="#action" onClick={ this.props.network.stopNetwork }>Cancel</button>
        </div>
      </div>
    )
  }
}

export default inject("network")(observer(NoAccount));
