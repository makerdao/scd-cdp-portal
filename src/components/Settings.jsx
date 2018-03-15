import React, {Component} from 'react';
import Transfer from './Transfer';

const settings = require('../settings');

class Settings extends Component {
  render() {
    const cupId = this.props.system.tub.cupId ? this.props.system.tub.cupId : Object.keys(this.props.system.tub.cups)[0];
    return (
      <div>
        <header className="col">
          <h1 className="typo-h1">Settings</h1>
        </header>
        {
          this.props.profile.proxy &&
          <Transfer system={ this.props.system } profile={ this.props.profile } transferToken={ this.props.transferToken } proxyFactory={ settings.chain[this.props.network].proxyFactory } account={ this.props.account } />
        }
        {
          this.props.profile.proxy &&
          Object.keys(this.props.system.tub.cups).length > 0 &&
          <div className="row">
            <div className="col col-extra-padding">
              <h2 className="typo-h3 typo-white">CDP { cupId }</h2>
              <p>
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. 
              </p>
              <button className="text-btn" data-method="shut" data-cup={ cupId } onClick={ this.props.handleOpenDialog }>Close my CDP</button>
            </div>
          </div>
        }
      </div>
    )
  }
}

export default Settings;
