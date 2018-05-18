import React from 'react';
import {observer} from 'mobx-react';
import Cup from './Cup';
import LegacyCupsAlert from './LegacyCupsAlert';

class Dashboard extends React.Component {
  render() {
    const cupId = this.props.system.tub.cupId ? this.props.system.tub.cupId : Object.keys(this.props.system.tub.cups)[0];
    return (
      <div>
        <header className="col">
          <h1 className="typo-h1 inline-headline">Dashboard <span className="typo-c typo-mid-grey">My collateralized debt position #{ cupId }</span></h1>
        </header>
        <LegacyCupsAlert legacyCups={ this.props.system.tub.legacyCups } changePage={ this.props.changePage } />
        <Cup system={ this.props.system } profile={ this.props.profile } network={ this.props.network } cupId={ cupId } handleOpenDialog={ this.props.handleOpenDialog } />
      </div>
    )
  }
}

export default observer(Dashboard);
