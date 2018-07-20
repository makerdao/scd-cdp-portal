// Libraries
import React from "react";
import ReactTooltip from "react-tooltip";
import {inject, observer} from "mobx-react";
import {Link} from "react-router-dom";

// Components
import Dashboard from "./Dashboard";
import Dialog from "./Dialog";
import Landing from "./Landing";
import LegacyCups from "./LegacyCups";
import Menu from "./Menu";
import SystemInfo from "./SystemInfo";
import Wallet from "./Wallet";
import Welcome from "./Welcome";
import Wizard from "./Wizard";
import Footer from "./Footer";

class Home extends React.Component {
  constructor() {
    super();
    this.state = {
      wizardOpenCDP: false,
      migrateCDP: false,
    }
  }

  setOpenCDPWizard = () => {
    this.setState({wizardOpenCDP: true}, () => {
      ReactTooltip.rebuild()
    });
  }

  setOpenMigrate = migrateCDP => {
    this.setState({migrateCDP}, () => {
      ReactTooltip.rebuild()
    });
  }

  render() {
    return (
      <div className={ (this.props.network.isConnected ? "is-connected" : "is-not-connected") + (this.props.dialog.show ? " dialog-open" : "") }>
        <div className="wrapper">
          {
            this.props.network.isConnected && this.props.network.defaultAccount &&
            <Menu page="" showCDPs={ !this.state.migrateCDP && !this.props.system.tub.cupsLoading && Object.keys(this.props.system.tub.cups).length > 1 } showLegacyCDPs={ true } setOpenMigrate={ this.setOpenMigrate } isMigrateCDPPage={ this.state.migrateCDP } />
          }
          <main className="main-column">
            {
              !this.props.network.isConnected || !this.props.network.defaultAccount
              ?
                <Landing />
              :
                <React.Fragment>
                  {
                    this.props.system.tub.cupsLoading
                    ?
                      <div>Loading...</div>
                    :
                      this.state.migrateCDP
                      ?
                        <LegacyCups setOpenMigrate={ this.setOpenMigrate } />
                      :
                        Object.keys(this.props.system.tub.cups).length === 0 && !this.state.wizardOpenCDP
                        ?
                          <Welcome setOpenMigrate={ this.setOpenMigrate } setOpenCDPWizard={ this.setOpenCDPWizard } />
                        :
                          <React.Fragment>
                            {
                              <React.Fragment>
                                {
                                  Object.keys(this.props.system.tub.cups).length === 0
                                  ?
                                    <Wizard setOpenMigrate={ this.setOpenMigrate } />
                                  :
                                    <Dashboard setOpenMigrate={ this.setOpenMigrate } />
                                }
                              </React.Fragment>
                            }
                          </React.Fragment>
                  }
                </React.Fragment>
            }
          </main>
          <aside className="right-column">
            {
              <div className="right-column-content">
                {
                  this.props.network.loadingAddress
                  ?
                    <div style={ {padding: "1.7em 3.38em"} }>Loading...</div>
                  :
                    <React.Fragment>
                      <Wallet />
                      {
                        this.props.network.defaultAccount &&
                        <SystemInfo />
                      }
                    </React.Fragment>
                }
                <div className="footer col col-no-border typo-cs typo-grid-grey">
                  <Link to="/terms">Terms of Service</Link>
                </div>
              </div>
            }
          </aside>
        </div>
        {
          (!this.props.network.isConnected || !this.props.network.defaultAccount) &&
          <Footer />
        }
        <Dialog />
        <ReactTooltip place="top" type="light" effect="solid" globalEventOff="click" html={true} />
      </div>
    )
  }
}

export default inject("network")(inject("system")(inject("dialog")(observer(Home))));
