import React from 'react';
import {observer} from 'mobx-react';

import LegacyCupsAlert from './LegacyCupsAlert';

class Welcome extends React.Component {

  render() {
    return (
      <div>
        <header className="col">
          <h1 className="typo-h1 inline-headline">Dashboard</h1>
          <LegacyCupsAlert legacyCups={ this.props.system.tub.legacyCups } setOpenMigrate={ this.props.setOpenMigrate } />
        </header>
        <div className="row" style={ {borderBottom: '0'} }>
          <div className="align-center typo-cxl" style={ {margin: '3rem 0'} }>
            You have no CDPs open at this time.
          </div>
          <div className="align-center" style={ {margin: '3rem 0'} }>
            <button className="sidebar-btn is-primary-green" onClick={ e => { e.preventDefault(); this.props.setOpenCDPWizard() } }>Open CDP</button>
          </div>
          <div className="align-center">
            <img src="../img/welcome-satellite.svg" alt="Welcome" style={ {width: '690px', height: 'auto', maxWidth: '70%' } } />
          </div>
        </div>
      </div>
    )
  }
}

export default observer(Welcome);
