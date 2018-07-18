// Libraries
import React from "react";
import {observer, Provider} from "mobx-react";
import {BrowserRouter, Route, Switch} from "react-router-dom";

// Components
import Help from "./Help";
import Home from "./Home";
import Modal from "./Modal";
import NotFound from "./NotFound";
import Notify from "./Notify";
import NotifySetUp from "./NotifySetUp";
import PriceModal from "./PriceModal";
import Terms from "./Terms";

// Stores
import DialogStore from "../stores/Dialog";
import NetworkStore from "../stores/Network";
import ProfileStore from "../stores/Profile";
import SystemStore from "../stores/System";
import TransactionsStore from "../stores/Transactions";

// Utils
import * as Blockchain from "../utils/blockchain-handler";

import "./App.css";

// Convenient console access
window.blockchain = Blockchain;
window.dialog = DialogStore;
window.network = NetworkStore;
window.profile = ProfileStore;
window.system = SystemStore;
window.transactions = TransactionsStore;

class App extends React.Component {
  componentDidUpdate = prevProps => {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return (
      <Provider network={NetworkStore} profile={ProfileStore} transactions={TransactionsStore} system={SystemStore} dialog={DialogStore}>
        <BrowserRouter>
          <React.Fragment>
            <Switch>
              <Route exact path="/help" render={() => <Help />} />
              <Route exact path="/terms" render={() => <Terms />} />
              <Route exact path="/" render={() => <Home />} />
              <Route component={ NotFound } />
            </Switch>
            <Notify ref="notificator" />
            <NotifySetUp />
            <Modal show={ TransactionsStore.priceModal.open } close={ TransactionsStore.closePriceModal }>
              <PriceModal />
            </Modal>
          </React.Fragment>
        </BrowserRouter>
      </Provider>
    )
  }
}

export default observer(App);
