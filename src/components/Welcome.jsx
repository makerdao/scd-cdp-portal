// Libraries
import React from "react";

// Components
import LegacyCupsAlert from "./LegacyCupsAlert";

// Images
import welcomeSatellite from "images/welcome-satellite.svg";

// Utils
import { mobileToggle } from "../utils/helpers";

class Welcome extends React.Component {
  render() {
    return (
      <div>
        <LegacyCupsAlert setOpenMigrate={ this.props.setOpenMigrate } />
        <header className="col">
          <h1 className="typo-h1 inline-headline">CDP Portal</h1>
        </header>
        <div className="row" style={ {borderBottom: "0"} }>
          <div className="align-center typo-cxl" style={ {margin: "3rem 0"} }>
            You have no CDPs open at this time.
          </div>
          <div className="align-center" style={ {margin: "3rem 0"} }>
            <button className={mobileToggle("sidebar-btn is-primary-green")} onClick={ e => { e.preventDefault(); this.props.setOpenCDPWizard() } }>Open CDP</button>
          </div>
          <div className="align-center">
            <img src={ welcomeSatellite } alt="Welcome" style={ {width: "690px", height: "auto", maxWidth: "70%" } } />
          </div>
        </div>
      </div>
    )
  }
}

export default Welcome;
