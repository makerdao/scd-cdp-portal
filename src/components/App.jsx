import React from 'react';
import {observer} from "mobx-react";

import ReactTooltip from 'react-tooltip';
import NoAccount from './NoAccount';
import Dialog from './Dialog';
import Welcome from './Welcome';
import Menu from './Menu';
import Wizard from './Wizard';
import Dashboard from './Dashboard';
import SystemInfo from './SystemInfo';
import Wallet from './Wallet';
import Settings from './Settings';
import Help from './Help';
import Notify from './Notify';
import NotifySetUp from './NotifySetUp';
import {isAddress} from '../helpers';
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
    if (['home', 'settings', 'help'].indexOf(page) === -1) {
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
        <div className={ this.state.page === 'help' ? "full-width-page" : this.props.dialog.show ? "dialog-open" : "" }>
          <div className="wrapper">
            <div className="menu-bar">
              <div className="logo">
                <img src="img/mkr-logo-rounded.svg" draggable="false" alt="" />
                <span className="menu-label">Maker</span>
              </div>
              <Menu system={ this.props.system } page={ this.state.page } changePage={ this.changePage } />
            </div>
            <main
              className={
                          this.state.page === 'help'
                          ?
                            "main-column fullwidth"
                          :
                            "main-column"
                        }>
              {
                !this.props.network.isConnected
                ?
                  <React.Fragment />
                :
                  this.props.network.defaultAccount && isAddress(this.props.network.defaultAccount)
                  ?
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
                            this.state.page === 'settings' &&
                            <Settings
                              network={ this.props.network }
                              system={ this.props.system }
                              account={ this.props.network.defaultAccount }
                              profile={ this.props.profile }
                              handleOpenDialog={ this.props.dialog.handleOpenDialog }
                              transferToken={ this.props.system.transferToken }
                              loadContracts={ this.loadContracts } />
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
                                  <Wizard system={ this.props.system } profile={ this.props.profile } handleOpenDialog={ this.props.dialog.handleOpenDialog } />
                                :
                                  <Dashboard system={ this.props.system } network={ this.props.network } profile={ this.props.profile } handleOpenDialog={ this.props.dialog.handleOpenDialog }/>
                              }
                            </React.Fragment>
                          }
                        </React.Fragment>
                      :
                        <NoAccount />
              }
            </main>
            <aside className="right-column">
              {
                this.state.page !== 'help' &&
                <div className="right-column-content">
                  <div className="row-2col-m">
                    <Wallet system={ this.props.system } network={ this.props.network } profile={ this.props.profile } account={ this.props.network.defaultAccount } />
                    {
                      this.props.network.isConnected &&
                      <SystemInfo system={ this.props.system } network={ this.props.network.network } profile={ this.props.profile } pipVal = { this.props.system.pip.val } pepVal = { this.props.system.pep.val } />
                    }
                  </div>
                  <div className="footer col col-no-border typo-cs typo-grid-grey">
                    <a href="#action">Dai Public Announcement</a> || <a href="#action">Dai Terms of Service</a>
                  </div>
                </div>
              }
            </aside>
          </div>
          <Dialog system={ this.props.system } profile={ this.props.profile } dialog={ this.props.dialog } />
          <ReactTooltip place="top" type="light" effect="solid" globalEventOff='click' html={true} />
        </div>
        <Notify ref='notificator' transactions={ this.props.transactions } network={ this.props.network }/>
        <NotifySetUp transactions={ this.props.transactions } system={ this.props.system }/>
      </React.Fragment>
    )
  }
}

export default observer(App);
