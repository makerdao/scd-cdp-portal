import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "mobx-react";

import App from './components/App';
import {BrowserRouter} from 'react-router-dom';

import dialog from "./stores/Dialog";
import network from "./stores/Network";
import profile from "./stores/Profile";
import system from "./stores/System";
import transactions from "./stores/Transactions";

window.dialog = dialog;
window.network = network;
window.profile = profile;
window.system = system;
window.transactions = transactions;

ReactDOM.render((
  <BrowserRouter>
    <Provider network={network} profile={profile} transactions={transactions} system={system} dialog={dialog}>
      <App />
    </Provider>
  </BrowserRouter>
), document.getElementById('root'));
