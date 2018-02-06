import React, { Component } from 'react';

class Proxy extends Component {

  render() {
    return (
      <div className="row col col-extra-padding">
        <h2 className="typo-h3 typo-white">Proxy</h2>
        <p>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. 
        </p>
        <div className="onoffswitch mode-box">
          <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id="myonoffswitchpMode" checked={ this.props.profile.mode === 'proxy' } onChange={ this.props.changeMode } />
          <label className="onoffswitch-label" htmlFor="myonoffswitchpMode">
              <span className="onoffswitch-inner"></span>
              <span className="onoffswitch-switch"></span>
          </label>
        </div>
      </div>
    )
  }
}

export default Proxy;
