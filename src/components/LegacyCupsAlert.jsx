// Libraries
import React from "react";
import {inject, observer} from "mobx-react";

// Components
import InlineNotification from "./InlineNotification";

@inject("network")
@inject("system")
@observer
class LegacyCupsAlert extends React.Component {
  constructor(props){
    super(props);
    this.state = { show: true }
  }

  render() {
    return (
      this.props.system.showLegacyAlert && this.state.show && !localStorage.getItem(`LegacyCDPsAlertClosed-${this.props.network.defaultAccount}`) &&
      <InlineNotification
        class="migrate-cups"
        caption="Migrate Existing CDPs"
        message="Your account has one or more existing CDPs from the old Dai Dashboard. You'll need to migrate these CDPs to the new CDP Portal to see and interact with them here. Once migrated, your CDPs will only be accesible via this dashboard."
        buttonText="Continue"
        onCloseButtonClick={ () => { localStorage.setItem(`LegacyCDPsAlertClosed-${this.props.network.defaultAccount}`, true); this.setState({show: false}); } }
        onButtonClick={ () => this.props.setOpenMigrate(true) }
      />
    )
  }
}

export default LegacyCupsAlert;
