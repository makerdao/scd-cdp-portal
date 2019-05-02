// Libraries
import React from "react";
import checkIsMobile from 'ismobilejs';

// Components
import LegacyCupsAlert from "./LegacyCupsAlert";

// Images
import welcomeSatellite from "images/welcome-satellite.svg";

class Welcome extends React.Component {
  buttonClass() {
    return checkIsMobile.any
      ? "sidebar-btn is-primary-green-mobile"
      : "sidebar-btn is-primary-green"
  }

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
            <button className={this.buttonClass()} onClick={ e => { e.preventDefault(); this.props.setOpenCDPWizard() } }>Open CDP</button>
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
