import React from 'react';
import ReactTooltip from 'react-tooltip';
import {observer} from "mobx-react";
import {Link} from 'react-router-dom';

import Dashboard from './Dashboard';
import Dialog from './Dialog';
import Landing from './Landing';
import LegacyCups from './LegacyCups';
import Menu from './Menu';
import SystemInfo from './SystemInfo';
import Wallet from './Wallet';
import Welcome from './Welcome';
import Wizard from './Wizard';

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
      <div className={ (this.props.network.isConnected ? "is-connected" : "is-not-connected") + (this.props.dialog.show ? " dialog-open" : "") + (this.props.modal.show || this.props.transactions.showCreatingCdpModal ? " modal-open" : "") }>
        <div className="wrapper">
          {
            this.props.network.isConnected && this.props.network.defaultAccount &&
            <Menu system={ this.props.system } page={ this.props.page } showCDPs={ !this.state.migrateCDP && !this.props.system.tub.cupsLoading && Object.keys(this.props.system.tub.cups).length > 1 } />
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
                      Object.keys(this.props.system.tub.cups).length === 0 && !this.state.wizardOpenCDP
                      ?
                        <Welcome system={ this.props.system } setOpenMigrate={ this.setOpenMigrate } setOpenCDPWizard={ this.setOpenCDPWizard } />
                      :
                        <React.Fragment>
                          {
                            this.state.migrateCDP
                            ?
                              <LegacyCups system={ this.props.system } transactions={ this.props.transactions } handleOpenDialog={ this.props.dialog.handleOpenDialog } setOpenMigrate={ this.setOpenMigrate } />
                            :
                              <React.Fragment>
                                {
                                  Object.keys(this.props.system.tub.cups).length === 0
                                  ?
                                    <Wizard system={ this.props.system } profile={ this.props.profile } handleOpenDialog={ this.props.dialog.handleOpenDialog } />
                                  :
                                    <Dashboard system={ this.props.system } network={ this.props.network } profile={ this.props.profile } handleOpenDialog={ this.props.dialog.handleOpenDialog } setOpenMigrate={ this.setOpenMigrate } />
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
                      <Wallet system={ this.props.system } network={ this.props.network } profile={ this.props.profile } transactions={ this.props.transactions } />
                      {
                        this.props.network.defaultAccount &&
                        <SystemInfo system={ this.props.system } network={ this.props.network.network } profile={ this.props.profile } />
                      }
                    </React.Fragment>
                }
                <div className="footer col col-no-border typo-cs typo-grid-grey">
                  <Link to="/terms">Terms of Service</Link><span className="separator">||</span><Link to="/announcement">Announcement</Link>
                </div>
              </div>
            }
          </aside>
        </div>
        <Dialog system={ this.props.system } profile={ this.props.profile } dialog={ this.props.dialog } />
        <ReactTooltip place="top" type="light" effect="solid" globalEventOff='click' html={true} />
      </div>
    )
  }
}

export default observer(Home);
