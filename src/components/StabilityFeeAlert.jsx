// Libraries
import React from "react";
import {inject, observer} from "mobx-react";

// Components
import InlineNotification from "./InlineNotification";

@inject("content")
@inject("network")
@observer
class StabilityFeeAlert extends React.Component {
  render() {
    return (
      this.props.content.shouldShowStabilityFeeAlert() &&
        (this.props.network.isConnected ||
         this.props.network.defaultAccount) &&
        <div className="row">
          <InlineNotification
            message={this.props.content.stabilityFeeContent()}
            onCloseButtonClick={ () => this.props.content.hideStabilityFeeContent()}
          />
        </div>
    )
  }
}

export default StabilityFeeAlert;
