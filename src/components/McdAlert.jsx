// Libraries
import React from "react";
import {inject, observer} from "mobx-react";

// Components
import InlineNotification from "./InlineNotification";

@inject("network")
@inject("system")
@observer
class McdAlert extends React.Component {
  constructor(props){
    super(props);
    this.state = { show: true }
  }

  render() {
    return (
      this.state.show && !localStorage.getItem(`McdAlertClosed-${this.props.network.defaultAccount}`) &&
      <InlineNotification
        class="alert-notification"
        caption="Multi-Collateral Dai and Oasis"
        message="Multi-Collateral Dai launched on 19-11-2019. In order to access MCD and Maker Vaults, please use Oasis.app where you can Trade, Borrow and Save Multi-Collateral Dai. This CDP Portal can only be used to generate Single-Collateral Sai."
        buttonText="Go to Oasis"
        onCloseButtonClick={ () => { localStorage.setItem(`McdAlertClosed-${this.props.network.defaultAccount}`, true); this.setState({show: false}); } }
        onButtonClick={ () => window.open("https://oasis.app", "_blank") }
      />
    )
  }
}

export default McdAlert;
