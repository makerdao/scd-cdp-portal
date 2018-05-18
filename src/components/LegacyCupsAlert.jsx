import React from 'react';
import {observer} from 'mobx-react';

class LegacyCupsAlert extends React.Component {
  render() {
    return (
      Object.keys(this.props.legacyCups).length > 0 &&
      <div>
        Migrate Existing CDPs
        <div>
          Your account has one or more existing CDPs from the old Dai dashboard. You'll need to migrate these CDPs to the new dashboard to see and interact with them here. Once migrated, your CDPs will only be accesible via this dashboard.
        </div>
        <a href="#action" data-page="migrate" onClick={ this.props.changePage }>Continue</a>
        <hr />
      </div>
    )
  }
}

export default observer(LegacyCupsAlert);
