import React, { Component } from 'react';

class TokenAllowance extends Component {
  changeAllowance = (e) => {
    const token = e.target.getAttribute('data-token');
    const dst = e.target.getAttribute('data-dst');
    const val = e.target.getAttribute('data-val') === 'true';

    if (token === 'all') {
      this.props.approveAll(val);
    } else {
      this.props.approve(token, dst, val);
    }
  }

  onOff = (token, dstAux = null) => {
    const check = token === 'all'
                  ? this.props.system.gem.tubApproved && this.props.system.gem.tapApproved && this.props.system.skr.tubApproved && this.props.system.skr.tapApproved && this.props.system.dai.tubApproved && this.props.system.dai.tapApproved
                  : this.props.system[token][`${dstAux}Approved`];
    const dst = token === 'all' ? 'all' : dstAux;
    return (
      <div className="onoffswitch">
        <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id={`myonoffswitchp${token}${dst}`} checked={ check } data-token={ token } data-dst={ dst } data-val={ !check } onChange={ this.changeAllowance } />
        <label className="onoffswitch-label" htmlFor={`myonoffswitchp${token}${dst}`}>
            <span className="onoffswitch-inner"></span>
            <span className="onoffswitch-switch"></span>
        </label>
      </div>
    )
  }

  render() {
    return (
      <div className="row col col-extra-padding">
        <h2 className="typo-h3 typo-white">Token Allowance</h2>
        <p>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. 
        </p>
        <div className="allowance">
          {
            this.props.profile.mode === 'proxy'
            ?
              <div>
                <span><strong>All</strong></span>
                <span>&nbsp;</span>
                <span>
                  {
                    this.props.system.skr.tubApproved === -1 || this.props.system.skr.tapApproved === -1 || this.props.system.gov.tubApproved === -1 || this.props.system.dai.tubApproved === -1 || this.props.system.dai.tapApproved === -1
                    ? 'Loading...'
                    : this.onOff('all')
                  }
                </span>
              </div>
            : ''
          }
          <div>
            <span>WETH</span>
            <span>Join</span>
            <span>
              {
                this.props.system.gem.tubApproved === -1
                ? 'Loading...'
                : this.onOff('gem', 'tub')
              }
            </span>
          </div>
          <div>
            <span>WETH</span>
            <span>Mock</span>
            <span>
              {
                this.props.system.gem.tapApproved === -1
                ? 'Loading...'
                : this.onOff('gem', 'tap')
              }
            </span>
          </div>
          <div>
            <span>PETH</span>
            <span>Exit/Lock</span>
            <span>
              {
                this.props.system.skr.tubApproved === -1
                ? 'Loading...'
                : this.onOff('skr', 'tub')
              }
            </span>
          </div>
          <div>
            <span>PETH</span>
            <span>Boom</span>
            <span>
              {
                this.props.system.skr.tapApproved === -1
                ? 'Loading...'
                : this.onOff('skr', 'tap')
              }
            </span>
          </div>
          <div>
            <span>MKR</span>
            <span>Wipe/Shut</span>
            <span>
              {
                this.props.system.gov.tubApproved === -1
                ? 'Loading...'
                : this.onOff('gov', 'tub')
              }
            </span>
          </div>
          <div>
            <span>DAI</span>
            <span>Wipe/Shut</span>
            <span>
              {
                this.props.system.dai.tubApproved === -1
                ? 'Loading...'
                : this.onOff('dai', 'tub')
              }
            </span>
          </div>
          <div>
            <span>DAI</span>
            <span>Bust/Cash</span>
            <span>
              {
                this.props.system.dai.tapApproved === -1
                ? 'Loading...'
                : this.onOff('dai', 'tap')
              }
            </span>
          </div>
        </div>
      </div>
    )
  }
}

export default TokenAllowance;
