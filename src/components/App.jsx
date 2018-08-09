// Libraries
import React from "react";
import {observer, Provider} from "mobx-react";
import {BrowserRouter} from "react-router-dom";

// Components
import Modal from "./Modal";
import Notify from "./Notify";
import NotifySetUp from "./NotifySetUp";
import PriceModal from "./PriceModal";
import Routes from "./Routes";

// Stores
import rootStore from "../stores/Root";

// Utils
import * as blockchain from "../utils/blockchain";

import "./App.css";

// Convenient console access
window.blockchain = blockchain;
window.dialog = rootStore.dialog;
window.network = rootStore.network;
window.profile = rootStore.profileS
window.system = rootStore.system;
window.transactions = rootStore.transactions;
window.content = rootStore.content;

@observer
class App extends React.Component {
  render() {
    return (
      <Provider network={rootStore.network} profile={rootStore.profile} transactions={rootStore.transactions} system={rootStore.system} dialog={rootStore.dialog} content={rootStore.content}>
        <BrowserRouter>
          <React.Fragment>
            <Routes />
            <Notify ref="notificator" />
            <NotifySetUp />
            <Modal show={rootStore.transactions.priceModal.open} close={rootStore.transactions.closePriceModal}>
              <PriceModal />
            </Modal>
          </React.Fragment>
        </BrowserRouter>
      </Provider>
    )
  }
}

export default App;
