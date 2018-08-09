// Libraries
import React from "react";
import {inject, observer} from "mobx-react";

// Components
import Cup from "./Cup";
import LegacyCupsAlert from "./LegacyCupsAlert";

@inject("system")
@observer
class Dashboard extends React.Component {
  render() {
    const cupId = this.props.system.tub.cupId ? this.props.system.tub.cupId : Object.keys(this.props.system.tub.cups)[0];
    return (
      <div>
        <LegacyCupsAlert setOpenMigrate={ this.props.setOpenMigrate } />
        <header className="col">
          <h1 className="typo-h1 inline-headline dashboard-headline">Dashboard <span className="typo-c typo-mid-grey">My collateralized debt position #{ cupId }</span></h1>
        </header>
        <Cup cupId={ cupId } />
      </div>
    )
  }
}

export default Dashboard;
