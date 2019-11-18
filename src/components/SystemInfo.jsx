// Libraries
import React from "react";
import {inject, observer} from "mobx-react";

// Utils
import {printNumber, wdiv, wmul, capitalize} from "../utils/helpers";

@inject("network")
@inject("system")
@observer
class SystemInfo extends React.Component {
  render() {
    return (
      <React.Fragment>
        <div className="col col-2-m active-network-section">
          <p className="typo-c align-center"><span className={ this.props.network.network === "main" ? "green-dot" : "purple-dot" }></span>{ this.props.network.network === "main" ? "Main Ethereum" : capitalize(this.props.network.network) + " Test" } Network</p>
        </div>
        <div className="col col-2-m info-section">
          <div className="price-info">
            <h2 className="typo-h2">Price Info</h2>
            <h3 className="typo-c">ETH/USD</h3>
            <div className="value">
              {
                this.props.system.pip.val && this.props.system.pip.val.gt(0)
                ?
                  <span><span>{ printNumber(this.props.system.pip.val) }</span><span className="unit">USD</span></span>
                :
                  <span>Loading...</span>
              }
            </div>
            <h3 className="typo-c">PETH/ETH</h3>
            <div className="value">
              {
                this.props.system.tub.per.gte(0)
                ?
                  <span><span>{ printNumber(this.props.system.tub.per) }</span><span className="unit">ETH</span></span>
                :
                  <span>Loading...</span>
              }
            </div>
            <h3 className="typo-c">SAI/USD</h3>
            <div className="value">
              {
                this.props.system.vox.par.gte(0)
                ?
                  <span><span>{ printNumber(this.props.system.vox.par) }</span><span className="unit">USD</span></span>
                :
                  <span>Loading...</span>
              }
            </div>
            <h3 className="typo-c">MKR/USD</h3>
            <div className="value">
              {
                this.props.system.pep.val && this.props.system.pep.val.gt(0)
                ?
                  <span><span>{ printNumber(this.props.system.pep.val) }</span><span className="unit">USD</span></span>
                :
                  <span>Loading...</span>
              }
            </div>
            <div className="line"></div>
          </div>
          <div className="cdp-info">
            <h2 className="typo-h2">Global CDP Info</h2>
            <h3 className="typo-c">Global CDP Collateralization</h3>
            <div className="value">
              {
                this.props.system.gem.tubBalance.gte(0) && this.props.system.pip.val.gte(0) && this.props.system.dai.totalSupply.gte(0) && this.props.system.vox.par.gte(0)
                ?
                  <span>
                    {
                      printNumber(
                        this.props.system.dai.totalSupply.eq(0)
                        ? 0
                        : wdiv(wmul(this.props.system.gem.tubBalance, this.props.system.pip.val), wmul(this.props.system.dai.totalSupply, this.props.system.vox.par)).times(100)
                      )
                    }
                    <span className="unit">%</span>
                  </span>
                :
                  "Loading..."
              }
            </div>
            <h3 className="typo-c">Maximum Global SAI Available</h3>
            <div className="value">
              {
                this.props.system.dai.totalSupply && this.props.system.dai.totalSupply.gt(0)
                ?
                  <span><span>{ printNumber(this.props.system.dai.totalSupply) }</span><span className="unit">&#36;</span></span>
                :
                  <span>Loading...</span>
              }
            </div>
            {
              this.props.network.network === "main" &&
              <h3 className="typo-c"><a href="https://mkr.tools/cdps/funded" target="_blank" rel="noopener noreferrer">See all CDPs</a></h3>
            }
          <div className="line"></div>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default SystemInfo;
