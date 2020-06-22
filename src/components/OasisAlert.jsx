// Libraries
import React from "react";
import { observer } from "mobx-react";

// Components
import InlineNotification from "./InlineNotification";

@observer
class OasisAlert extends React.Component {
  constructor(props){
    super(props);
    this.state = { show: true }
  }

  render() {
    return (
      this.state.show &&
      <InlineNotification
        class="mcd-alert"
        caption="Visit the Oasis App to open a Vault"
        buttonText="Go to Oasis App"
        onCloseButtonClick={ () => { localStorage.setItem('OasisAlertClosed', true); this.setState({show: false}); } }
        onButtonClick={ () => window.open("https://oasis.app/borrow", "_blank") }
      >
        New Multi Collateral Dai (MCD) Vaults can be created from the Oasis App 
        at <a href="https://oasis.app/borrow">oasis.app</a>. For more information please visit 
        our Forum at <a href="https://forum.makerdao.com">forum.makerdao.com</a> or
         our Chat at <a href="https://chat.makerdao.com">chat.makerdao.com</a>.
      </InlineNotification>
    )
  }
}

export default OasisAlert;
