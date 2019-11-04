// Libraries
import React from 'react';
import { inject, observer } from 'mobx-react';

// Components
import InlineNotification from './InlineNotification';
import StabilityFeeAlert from './StabilityFeeAlert';

@inject('content')
@inject('network')
@observer
class GeneralNotifications extends React.Component {
  render() {
    return (
      (this.props.network.isConnected || this.props.network.defaultAccount) &&
      (this.props.content.shouldShowGeneralNotifications() || this.props.content.shouldShowStabilityFeeAlert()) && (
        <div className='row general-notifications'>
          {this.props.content.shouldShowGeneralNotifications() &&
            Object.entries(this.props.content.getGeneralNotifications()).map(
              ([key, notification]) =>
                notification.show && (
                  <InlineNotification
                    key={key}
                    message={notification.content}
                    onCloseButtonClick={() => this.props.content.hideGeneralNotification(key)}
                  />
                )
            )}
          <StabilityFeeAlert />
        </div>
      )
    );
  }
}

export default GeneralNotifications;
