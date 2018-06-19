import React from 'react';
import {observer} from "mobx-react";

import Menu from './Menu';

class Announcement extends React.Component {
  render() {
    return (
      <div className="full-width-page">
        <div className="wrapper">
          {
            <Menu system={ this.props.system } page={ this.props.page } />
          }
          <main className="main-column fullwidth">
            <div>
              <header className="col">
                <h1 className="typo-h1">Announcement</h1>
              </header>
              <div className="row">
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }
}

export default observer(Announcement);
