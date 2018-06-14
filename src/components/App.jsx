import React from 'react';
import {observer} from "mobx-react";
import {Route, Switch, withRouter} from 'react-router-dom';

import Home from './Home';
import Help from './Help';
import NotFound from './NotFound';
import Notify from './Notify';
import NotifySetUp from './NotifySetUp';
import PriceModal from './PriceModal';
import './App.css';

import * as Blockchain from "../blockchainHandler";
window.Blockchain = Blockchain;

class App extends React.Component {
  render() {
    const page = this.props.location.pathname.replace('/', '');
    const props = Object.assign({...this.props}, {page});
    return (
      <React.Fragment>
        <Switch>
          <Route exact path='/help' render={() => (
            <Help {...props} />
          )}/>
          <Route exact path='/' render={() => (
            <Home {...props} />
          )}/>
          <Route component={ NotFound } />
        </Switch>
        <Notify ref='notificator' transactions={ this.props.transactions } network={ this.props.network } />
        <NotifySetUp transactions={ this.props.transactions } system={ this.props.system } />
        <PriceModal transactions={ this.props.transactions } />
      </React.Fragment>
    )
  }
}

export default withRouter(observer(App));
