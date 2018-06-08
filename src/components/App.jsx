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

  componentDidMount = () => {
    const params = window.location.hash.replace(/^#\/?|\/$/g, '').split('/');
    this.setPage(params[0]);
  }

  setPage = page => {
    if (['home', 'help', 'migrate'].indexOf(page) === -1) {
      page = 'home';
    }
    if (page !== 'home') {
      window.location.hash = page;
    } else {
      // If home we try to remove hash completely if browser supports
      window.location.hash = '';
      if ('pushState' in window.history) {
        window.history.pushState('', document.title, window.location.pathname + window.location.search);
      }
    }
    this.setState({'page': page}, () => {
      ReactTooltip.rebuild();
    });
  }

  setOpenCDPWizard = () => {
    this.setState({wizardOpenCDP: true}, () => {
      ReactTooltip.rebuild()
    });
  }

  changePage = e => {
    e.preventDefault();
    let page = e.target.getAttribute('data-page');
    this.setPage(page);
  }

  render() {
    return (
      <React.Fragment>
        <div className={ (this.state.page ? "page-" + this.state.page : "") + (this.props.network.isConnected ? " is-connected" : " is-not-connected") + (this.state.page === 'help' ? " full-width-page" : this.props.dialog.show ? " dialog-open" : "") }>
          <div className="wrapper">
            {
              this.props.network.isConnected && this.props.network.defaultAccount &&
              <Menu system={ this.props.system } page={ this.state.page } changePage={ this.changePage } />
            }
            <main className={ this.state.page === 'help' ? "main-column fullwidth" : "main-column" }>
              {
                !this.props.network.isConnected
                ?
                  <Landing />
                :
                  this.props.network.defaultAccount &&
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
                              this.state.page === 'migrate' &&
                              <LegacyCups system={ this.props.system } handleOpenDialog={ this.props.dialog.handleOpenDialog } changePage={ this.changePage } />
                            }
                            {
                              this.state.page === 'help' &&
                              <Help />
                            }
                            {
                              this.state.page === 'home' &&
                              <React.Fragment>
                                {
                                  Object.keys(this.props.system.tub.cups).length === 0
                                  ?
                                    <Wizard system={ this.props.system } profile={ this.props.profile } handleOpenDialog={ this.props.dialog.handleOpenDialog } changePage={ this.changePage } />
                                  :
                                    <Dashboard system={ this.props.system } network={ this.props.network } profile={ this.props.profile } handleOpenDialog={ this.props.dialog.handleOpenDialog } changePage={ this.changePage } />
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
                this.state.page !== 'help' &&
                <div className="right-column-content">
                    {
                      this.props.network.loadingAddress
                      ?
                        <div>Importing account...</div>
                      :
                        <React.Fragment>
                  <Wallet system={ this.props.system } network={ this.props.network } profile={ this.props.profile } changePage={ this.changePage } />
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

export default observer(App);
