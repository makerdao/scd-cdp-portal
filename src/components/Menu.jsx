import React from 'react';
import {observer} from 'mobx-react';
import {Link} from 'react-router-dom';

class Menu extends React.Component {
  render() {
    const cupId = this.props.system.tub.cupId ? this.props.system.tub.cupId : Object.keys(this.props.system.tub.cups)[0];
    return (
      <div className="menu-bar">
        <div className="logo">
          <img src="img/mkr-logo-rounded.svg" draggable="false" alt="" />
          <span className="menu-label">Maker</span>
        </div>
        <nav>
          <ul className="menu">
            <li value="home" className={ this.props.page === '' ? 'active' : '' } data-page="home">
              <Link to="/">
                <img src="img/icon-home.svg" draggable="false" alt="" data-page="home" />
                <span className="menu-label" data-page="home">Dashboard</span>
              </Link>
            </li>
            {
              this.props.page === '' && !this.props.system.tub.cupsLoading && Object.keys(this.props.system.tub.cups).length > 1 &&
              Object.keys(this.props.system.tub.cups).map(key =>
                <li key={ key } data-cupid={ key } className={ cupId === key ? 'active' : '' } onClick={ this.props.system.changeCup }>
                  CDP #{ key }
                </li>
              )
            }
            <li value="help" className={ this.props.page === 'help' ? 'active' : '' } data-page="help">
              <Link to="/help">
                <img src="img/icon-help.svg" draggable="false" alt="" data-page="help" />
                <span className="menu-label" data-page="help">Help</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    )
  }
}

export default observer(Menu);
