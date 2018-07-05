import React from 'react';
import {observer} from "mobx-react";
import {Route, Switch, withRouter} from 'react-router-dom';

import Announcement from './Announcement';
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
  componentDidMount = () => {
    setTimeout(() => window.scrollTo(0, 0), 100);
  }

  componentDidUpdate = prevProps => {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    const page = this.props.location.pathname.replace('/', '');
    const props = Object.assign({...this.props}, {page});
    return (
      <React.Fragment>
        <Switch>
          <Route exact path='/help' render={() => (
            <Help {...props} />
          )}/>
          <Route exact path='/terms' render={() => (
            <Terms {...props} />
          )}/>
          <Route exact path='/announcement' render={() => (
            <Announcement {...props} />
          )}/>
          <Route exact path='/' render={() => (
            <Home {...props} />
          )}/>
          <Route component={ NotFound } />
        </Switch>
        <Notify ref='notificator' transactions={ this.props.transactions } network={ this.props.network } />
        <NotifySetUp transactions={ this.props.transactions } system={ this.props.system } />
        <Modal show={ this.props.transactions.priceModal.open } close={ this.props.transactions.closePriceModal } modal={ this.props.modal }>
          <PriceModal transactions={ this.props.transactions } />
        </Modal>
      </React.Fragment>
    )
  }
}

export default withRouter(observer(App));
