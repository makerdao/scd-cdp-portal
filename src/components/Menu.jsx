// Libraries
import React from "react";
import {inject, observer} from "mobx-react";
import {Link} from "react-router-dom";

// Images
import iconHome from 'images/icon-home.svg';
import iconHelp from 'images/icon-help.svg';

@inject("system")
@inject("network")
@observer
class Menu extends React.Component {
  changeCup = id => {
    this.props.system.changeCup(id);
  }

  render() {
    const cupId = this.props.system.tub.cupId ? this.props.system.tub.cupId : Object.keys(this.props.system.tub.cups)[0];
    return (
      <div className="menu-bar">
        <div className="logo" onClick={ e => { e.preventDefault(); window.location = '/'; } }>
          <svg width="33" height="23" viewBox="0 0 33 23" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
              <path d="m14.242 22.89v-11.492l-13.24-10.033v21.525" stroke="#1abc9c"/>
              <path d="m18.316 22.89v-11.492l13.24-10.033v21.525" stroke="#546979"/>
              <path d="m14.242 22.89v-11.492l-13.24-10.033v21.525" stroke="#1abc9c"/>
              <path d="m18.316 22.89v-11.492l13.24-10.033v21.525" stroke="#1b1b1b"/>
            </g>
          </svg>
          <span className="menu-label">Maker</span>
        </div>
        <nav>
          <ul className="menu">
            {
              !this.props.showCDPs &&
              <li value="home" className={ this.props.page === "" && !this.props.isMigrateCDPPage ? "active" : "" } onClick={ () => this.props.page === "" && this.props.setOpenMigrate(false) }>
                <a href="#action">
                  <img src={ iconHome } draggable="false" alt="" />
                  <span className="menu-label">CDP Portal</span>
                </a>
              </li>
            }
            {
              this.props.showCDPs && Object.keys(this.props.system.tub.cups).length === 1 &&
              <li value="home" className={ this.props.page === "" && !this.props.isMigrateCDPPage ? "active" : "" } onClick={ e => { e.preventDefault(); this.changeCup(this.props.system.tub.cups[0]); this.props.setOpenMigrate(false) } }>
                <a href="#action">
                  <img src={ iconHome } draggable="false" alt="" />
                  <span className="menu-label">CDP Portal</span>
                </a>
              </li>
            }
            {
              this.props.showCDPs && Object.keys(this.props.system.tub.cups).length > 1 &&
              Object.keys(this.props.system.tub.cups).map(key =>
                <li key={ key } className={ "cdp-id-item" + (this.props.page === "" && cupId === key && !this.props.isMigrateCDPPage ? " active" : "") } onClick={ e => { e.preventDefault(); this.changeCup(key); this.props.setOpenMigrate(false) } }>
                  <a href="#action">
                    CDP<br />#{ key }
                  </a>
                </li>
              )
            }
            {
              this.props.showLegacyCDPs && (this.props.isMigrateCDPPage || this.props.system.showLegacyAlert) &&
              <li className={ "migrate-cups" + (this.props.isMigrateCDPPage ? " active" : "") } onClick={ () => this.props.setOpenMigrate(true) }>
                <svg width="17" height="16" viewBox="0 0 17 16" xmlns="http://www.w3.org/2000/svg">
                  <g fill="none" fillRule="evenodd">
                    <path d="m32.0345661 6.590286c-.0185303-.09265094.009265-.17603692.083386-.25015793.074121-.074121.157507-.1111813.2501579-.1111813h1.5009476c.0926509 0 .1760369.0370603.2501579.1111813.074121.07412101.1019164.15750699.083386.25015793l-.166772 3.11307645c-.0185303.07412101-.0602233.14360932-.1250789.20846494s-.134344.09728361-.208465.09728361h-1.1674036c-.074121 0-.1436094-.03242799-.208465-.09728361s-.1065486-.13434393-.1250789-.20846494zm2.2514214 4.9753633c0 .3150135-.115814.5883345-.3474416.8199621-.2316276.2316275-.5049486.3474415-.8199621.3474415s-.5883345-.115814-.8199621-.3474415c-.2316276-.2316276-.3474416-.5049486-.3474416-.8199621 0-.3150136.115814-.5883346.3474416-.8199621.2316276-.2316276.5049486-.3474416.8199621-.3474416s.5883345.115814.8199621.3474416c.2316276.2316275.3474416.5049485.3474416.8199621zm0-10.0063172 6.6708781 11.5628554c.1482416.2964836.1945672.5975995.1389766.9033481-.0555907.3057485-.2038323.5651714-.4447252.7782691-.240893.2130976-.5281112.3196462-.8616551.3196462h-13.3417562c-.3335439 0-.6207621-.1065486-.8616551-.3196462-.2408929-.2130977-.3891345-.4725206-.4447252-.7782691-.0555906-.3057486-.009265-.6068645.1389766-.9033481l6.6708781-11.5628554c.166772-.29648361.4030323-.49568316.7087808-.59759949.3057486-.10191634.6114972-.10191634.9172458 0 .3057485.10191633.5420088.30111588.7087808.59759949zm-8.3230474 12.5000128c-.0405992.0608991-.0405992.1217982 0 .1826973.0405993.0608991.0913487.0913486.1522478.0913486h14.0067918c.0608991 0 .1116485-.0304495.1522478-.0913486.0405992-.0608991.0405992-.1217982 0-.1826973l-7.003396-12.11891992c-.0405992-.06089909-.0913486-.09134864-.1522477-.09134864s-.1116485.03044955-.1522477.09134864z" fill="#dedede" transform="translate(-25)"/>
                  </g>
                </svg>
                Migrate CDPs
              </li>
            }
            <li value="help" className={ this.props.page === "help" ? "active" : "" }>
              <Link to="/help">
                <img src={ iconHelp } draggable="false" alt="" />
                <span className="menu-label">Help</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    )
  }
}

export default Menu;
