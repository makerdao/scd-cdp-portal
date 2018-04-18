import React from 'react';
import {observer} from 'mobx-react';
import Cup from './Cup';

class Dashboard extends React.Component {
  render() {
    return (
      <div>
        <header className="col">
          <h1 className="typo-h1 inline-headline">Dashboard <span className="typo-c typo-mid-grey">Collateralized Debt Position</span></h1>
        </header>
        {
          Object.keys(this.props.system.tub.legacyCups).length > 0 &&
          <div>
            You have legacy CDPs to migrate:
            {
              Object.keys(this.props.system.tub.legacyCups).map(cupId => 
                <a href="#action" style={ {display: 'block'} } key={ cupId } data-method="migrate" data-cup={ cupId } onClick={ this.props.handleOpenDialog }>Migrate CDP {cupId}</a>
              )
            }
            <hr />
          </div>
        }
        <Cup system={ this.props.system } profile={ this.props.profile } cupId={ this.props.system.tub.cupId ? this.props.system.tub.cupId : Object.keys(this.props.system.tub.cups)[0] } handleOpenDialog={ this.props.handleOpenDialog } />
      </div>
    )
  }
}

export default observer(Dashboard);
