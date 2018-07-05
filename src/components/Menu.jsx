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
            <li value="home" className={ this.props.page === '' ? 'active' : '' }>
              <Link to="/">
                <img src="img/icon-home.svg" draggable="false" alt="" />
                <span className="menu-label">Dashboard</span>
              </Link>
            </li>
            {
              this.props.showCDPs &&
              Object.keys(this.props.system.tub.cups).map(key =>
                <li key={ key } data-cupid={ key } className={ cupId === key ? 'active' : '' } onClick={ this.props.system.changeCup }>
                  CDP #{ key }
                </li>
              )
            }
            {
              this.props.showLegacyCDPs && Object.keys(this.props.system.tub.legacyCups).length > 0 &&
              <li className={ this.props.isMigrateCDPPage ? 'active' : '' } onClick={ () => this.props.setOpenMigrate(true) }>
                Migrate CDPs
              </li>
            }
            <li value="help" className={ this.props.page === 'help' ? 'active' : '' }>
              <Link to="/help">
                <img src="img/icon-help.svg" draggable="false" alt="" />
                <span className="menu-label">Help</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    )
  }
}

export default observer(Menu);
