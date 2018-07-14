import React from 'react';
import {inject, observer} from "mobx-react";
import {Route, Switch, withRouter} from 'react-router-dom';

import Help from './Help';
import Home from './Home';
import Modal from './Modal';
import NotFound from './NotFound';
import Notify from './Notify';
import NotifySetUp from './NotifySetUp';
import PriceModal from './PriceModal';
import Terms from './Terms';

import './App.css';

import * as Blockchain from "../blockchainHandler";
window.Blockchain = Blockchain;

class App extends React.Component {
  componentDidUpdate = prevProps => {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    const page = this.props.location.pathname.replace('/', '');
    return (
      <React.Fragment>
        <Switch>
          <Route exact path='/help' render={() => (
            <Help page={page}/>
          )}/>
          <Route exact path='/terms' render={() => (
            <Terms page={page}/>
          )}/>
          <Route exact path='/' render={() => (
            <Home page={page}/>
          )}/>
          <Route component={ NotFound } />
        </Switch>
        <Notify ref='notificator' />
        <NotifySetUp />
        <Modal show={ this.props.transactions.priceModal.open } close={ this.props.transactions.closePriceModal }>
          <PriceModal/>
        </Modal>
      </React.Fragment>
    )
  }
}

export default inject('transactions')(withRouter(observer(App)));
