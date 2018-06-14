import React from 'react';
import {observer} from "mobx-react";

import ReactTooltip from 'react-tooltip';
import Dialog from './Dialog';
import Welcome from './Welcome';
import Menu from './Menu';
import Wizard from './Wizard';
import Dashboard from './Dashboard';
import SystemInfo from './SystemInfo';
import Wallet from './Wallet';
import Help from './Help';
import LegacyCups from './LegacyCups';
import Notify from './Notify';
import NotifySetUp from './NotifySetUp';
import PriceModal from './PriceModal';
import Landing from './Landing';
import {withRouter} from 'react-router-dom';
import './App.css';

import * as Blockchain from "../blockchainHandler";
window.Blockchain = Blockchain;

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      page: '',
      wizardOpenCDP: false,
    }
  }

  setOpenCDPWizard = () => {
    this.setState({wizardOpenCDP: true}, () => {
      ReactTooltip.rebuild()
    });
  }

  render() {
    const page = this.props.location.pathname.replace('/', '');
    return (
      <React.Fragment>
        <div className={ (page ? "page-" + page : "") + (this.props.network.isConnected ? " is-connected" : " is-not-connected") + (page === 'help' ? " full-width-page" : this.props.dialog.show ? " dialog-open" : "") }>
          <div className="wrapper">
            {
              (page === 'help' || (this.props.network.isConnected && this.props.network.defaultAccount)) &&
              <Menu system={ this.props.system } page={ page } />
            }
            <main className={ page === 'help' ? "main-column fullwidth" : "main-column" }>
              {
                page === 'help'
                ?
                  <Help />
                :
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
                            <Welcome setOpenCDPWizard={ this.setOpenCDPWizard } />
                          :
                            <React.Fragment>
                              {
                                page === 'migrate' &&
                                <LegacyCups system={ this.props.system } handleOpenDialog={ this.props.dialog.handleOpenDialog } />
                              }
                              {
                                page === '' &&
                                <React.Fragment>
                                  {
                                    Object.keys(this.props.system.tub.cups).length === 0
                                    ?
                                      <Wizard system={ this.props.system } profile={ this.props.profile } handleOpenDialog={ this.props.dialog.handleOpenDialog } />
                                    :
                                      <Dashboard system={ this.props.system } network={ this.props.network } profile={ this.props.profile } handleOpenDialog={ this.props.dialog.handleOpenDialog } />
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
                page !== 'help' &&
                <div className="right-column-content">
                    {
                      this.props.network.loadingAddress
                      ?
                        <div style={ {padding: "1.7em 3.38em"} }>Loading...</div>
                      :
                        <React.Fragment>
                          <Wallet system={ this.props.system } network={ this.props.network } profile={ this.props.profile } />
                          {
                            this.props.network.defaultAccount &&
                            <SystemInfo system={ this.props.system } network={ this.props.network.network } profile={ this.props.profile } />
                          }
                        </React.Fragment>
                    }
                  <div className="footer col col-no-border typo-cs typo-grid-grey">
                    <a href="#action">Terms of Service</a><span className="separator">||</span><a href="#action">Announcement</a>
                  </div>
                </div>
              }
            </aside>
          </div>
          <Dialog system={ this.props.system } profile={ this.props.profile } dialog={ this.props.dialog } />
          <ReactTooltip place="top" type="light" effect="solid" globalEventOff='click' html={true} />
        </div>
        <Notify ref='notificator' transactions={ this.props.transactions } network={ this.props.network } />
        <NotifySetUp transactions={ this.props.transactions } system={ this.props.system } />
        <PriceModal transactions={ this.props.transactions } />
      </React.Fragment>
    )
  }
}

export default withRouter(observer(App));
