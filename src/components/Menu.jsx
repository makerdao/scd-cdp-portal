import React from 'react';
import {observer} from 'mobx-react';

class Menu extends React.Component {
  render() {
    return (
      <nav>
        <ul className="menu">
          <li value="home" className={ this.props.page === 'home' ? 'active' : '' } data-page="home" onClick={ this.props.changePage }>
            <img src="img/icon-home.svg" draggable="false" alt="" data-page="home" />
            <span className="menu-label" data-page="home">Dashboard</span>
          </li>
          {
            !this.props.system.tub.cupsLoading && Object.keys(this.props.system.tub.cups).length > 1 &&
            Object.keys(this.props.system.tub.cups).map(key =>
              <li key={ key } data-cupId={ key } className={ this.props.system.tub.cupId ? this.props.system.tub.cupId : Object.keys(this.props.system.tub.cups)[0] === key ? 'active' : '' } onClick={ this.props.system.changeCup }>
                CDP #{ key }
              </li>
            )
          }
          <li value="settings" className={ this.props.page === 'settings' ? 'active' : '' } data-page="settings" onClick={ this.props.changePage }>
            <img src="img/icon-settings.svg" draggable="false" alt="" data-page="settings" />
            <span className="menu-label" data-page="settings">Settings</span>
          </li>
          <li value="help" className={ this.props.page === 'help' ? 'active' : '' } data-page="help" onClick={ this.props.changePage }>
            <img src="img/icon-help.svg" draggable="false" alt="" data-page="help" />
            <span className="menu-label" data-page="help">Help</span>
          </li>
        </ul>
      </nav>
    )
  }
}

export default observer(Menu);
