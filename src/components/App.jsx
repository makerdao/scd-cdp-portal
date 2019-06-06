// Libraries
import React from "react";
import {observer, Provider} from "mobx-react";
import {BrowserRouter} from "react-router-dom";
import ReactGA from 'react-ga';

// Components
import Modal from "./Modal";
import Notify from "./Notify";
import NotifySetUp from "./NotifySetUp";
import PriceModal from "./PriceModal";
import Routes from "./Routes";
import { mixpanelInit } from '../utils/analytics';

// Stores
import rootStore from "../stores/Root";

// Utils
import * as blockchain from "../utils/blockchain";

// Styles
import "../scss/styles.css";

// Convenient console access
window.blockchain = blockchain;
window.dialog = rootStore.dialog;
window.network = rootStore.network;
window.profile = rootStore.profile;
window.system = rootStore.system;
window.transactions = rootStore.transactions;
window.content = rootStore.content;

// Google Analytics
ReactGA.initialize('UA-128164213-1');
ReactGA.pageview(window.location.pathname + window.location.search);

@observer
class App extends React.Component {
  constructor () {
    super()
    this.mixpanel = mixpanelInit();
  }

  render() {
    return (
      <Provider network={rootStore.network} profile={rootStore.profile} transactions={rootStore.transactions} system={rootStore.system} dialog={rootStore.dialog} content={rootStore.content}>
        <BrowserRouter>
          <React.Fragment>
            <Routes mixpanel={this.mixpanel} />
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
