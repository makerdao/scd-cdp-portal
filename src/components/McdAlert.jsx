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
        buttonText="Go to Migration App"
        onCloseButtonClick={ () => { localStorage.setItem('ScdAlertClosed', true); this.setState({show: false}); } }
        onButtonClick={ () => window.open("https://migrate.makerdao.com", "_blank") }
      >
        Single Collateral Dai (SCD) was shutdown at 16:00 UTC on Tuesday, May 12, 2020. From now on, 
        it will only be possible to redeem Sai and CDPs from the official MakerDAO Migration Portal 
        at <a href="https://migrate.makerdao.com">migrate.makerdao.com</a>. For more information please 
        visit our Forum at <a href="https://forum.makerdao.com">forum.makerdao.com</a> or our Chat
        at <a href="https://chat.makerdao.com">chat.makerdao.com</a>.
      </InlineNotification>
    )
  }
}

export default McdAlert;
