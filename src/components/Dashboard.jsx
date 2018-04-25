import React from 'react';
import {observer} from 'mobx-react';
import Cup from './Cup';

class Dashboard extends React.Component {
  render() {
    const cupId = this.props.system.tub.cupId ? this.props.system.tub.cupId : Object.keys(this.props.system.tub.cups)[0];
    return (
      <div>
        <header className="col">
          <h1 className="typo-h1 inline-headline">Dashboard <span className="typo-c typo-mid-grey">My collateralized debt position #{ cupId }</span></h1>
        </header>
        {
          Object.keys(this.props.system.tub.legacyCups).length > 0 &&
          <div>
            You have legacy CDPs to migrate:
            {
              Object.keys(this.props.system.tub.legacyCups).map(id =>
                <a href="#action" style={ {display: 'block'} } key={ id } data-method="migrate" data-cup={ id } onClick={ this.props.handleOpenDialog }>Migrate CDP {id}</a>
              )
            }
            <hr />
          </div>
        }
        <Cup system={ this.props.system } profile={ this.props.profile } cupId={ cupId } handleOpenDialog={ this.props.handleOpenDialog } />
      </div>
    )
  }
}

export default observer(Dashboard);
