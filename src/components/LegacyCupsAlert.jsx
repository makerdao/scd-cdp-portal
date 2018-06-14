import React from 'react';
import {observer} from 'mobx-react';
import InlineNotification from './InlineNotification';
import {withRouter} from 'react-router';

class LegacyCupsAlert extends React.Component {
  render() {
    return (
      Object.keys(this.props.legacyCups).length > 0 &&
      <InlineNotification
        caption="Migrate Existing CDPs"
        message="Your account has one or more existing CDPs from the old Dai dashboard. You'll need to migrate these CDPs to the new dashboard to see and interact with them here. Once migrated, your CDPs will only be accesible via this dashboard."
        buttonText="Continue"
        onButtonClick={ () => this.props.history.push('/migrate') }
      />
    )
  }
}

export default withRouter(observer(LegacyCupsAlert));
