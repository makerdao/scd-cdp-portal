// Libraries
import React from "react";
import { observer } from "mobx-react";

// Components
import InlineNotification from "./InlineNotification";

@observer
class McdAlert extends React.Component {
  constructor(props){
    super(props);
    this.state = { show: true }
  }

  render() {
    return (
      this.state.show &&
      <InlineNotification
        class="mcd-alert"
        caption="Single-Collateral Dai (SCD) has been shutdown"
        message="Single Collateral Dai (SCD) was shutdown at 16:00 UTC on Tuesday, May 12, 2020. From now on, it will only be possible to redeem Sai and CDPs from the official MakerDAO Migration Portal at migrate.makerdao.com. For more information please visit our Forum at forum.makerdao.com or our Chat at chat.makerdao.com."
        buttonText="Go to Migration App"
        onCloseButtonClick={ () => { localStorage.setItem('ScdAlertClosed', true); this.setState({show: false}); } }
        onButtonClick={ () => window.open("https://migrate.makerdao.com", "_blank") }
      />
    )
  }
}

export default McdAlert;
