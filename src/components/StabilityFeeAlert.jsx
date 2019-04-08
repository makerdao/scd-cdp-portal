// Libraries
import React from "react";
import {inject, observer} from "mobx-react";

// Components
import InlineNotification from "./InlineNotification";

@inject("content")
@inject("network")
@observer
class StabilityFeeAlert extends React.Component {
  constructor(props){
    super(props);
    this.state = { show: true }
  }

  render() {
    return (
      this.props.content.showStabilityFeeAlert() &&
        this.state.show &&
        !localStorage.getItem(`StabilityFeeChangeAlertClosed-${this.props.content.stabilityFeeMarkdown()}`) &&
        this.props.network.isConnected &&
        this.props.network.defaultAccount &&
        <div className="row">
          <InlineNotification
            message={this.props.content.stabilityFeeContent()}
            onCloseButtonClick={ () => { localStorage.setItem(`StabilityFeeChangeAlertClosed-${this.props.content.stabilityFeeMarkdown()}`, true); this.setState({show: false}); } }
          />
        </div>
    )
  }
}

export default StabilityFeeAlert;
