import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { BrowserRouter } from 'react-router-dom';

import stores from './stores/index';


ReactDOM.render((
  <BrowserRouter>
    <App network={stores.network} profile={stores.profile} transactions={stores.transactions} system={stores.system} dialog={stores.dialog} />
  </BrowserRouter>
), document.getElementById('root'));
