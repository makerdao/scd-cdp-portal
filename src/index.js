import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

import stores from './stores/index';

ReactDOM.render(
  <App network={stores.network} profile={stores.profile} transactions={stores.transactions} system={stores.system} dialog={stores.dialog} />,
  document.getElementById('root')
);
