// Libraries
import React from "react";
import { inject, observer } from "mobx-react";

// Utils
import { printNumber, wdiv, wmul } from "../utils/helpers";

@inject("network")
@inject("system")
@observer
class SystemInfo extends React.Component {
  render() {
    return (
      <div className="col col-2-m info-section">
        <div className="price-info">
          <h2 className="typo-h2">Price Info
            <span className="typo-c right" style={ {textTransform: "capitalize"} }>{ this.props.network.network === "main" ? "mainnet" : this.props.network.network }</span>
          </h2>
          <h3 className="typo-c">ETH/USD</h3>
          <div className="value">
          {
            this.props.system.currentEthPrice
              ? <React.Fragment>
                  <span>{ printNumber(this.props.system.currentEthPrice, 3, false) }</span>
                  <span className="unit">USD</span>
                </React.Fragment>
              : <React.Fragment>Loading...</React.Fragment>
          }
          </div>
          <h3 className="typo-c">MKR/USD</h3>
          <div className="value">
          {
            this.props.system.currentMkrPrice
              ? <React.Fragment>
                  <span>{ printNumber(this.props.system.currentMkrPrice, 3, false) }</span>
                  <span className="unit">MKR</span>
                </React.Fragment>
              : <React.Fragment>Loading...</React.Fragment>
          }
          </div>
          <h3 className="typo-c">PETH/ETH</h3>
          <div className="value">
          {
            this.props.system.currentWethToPethRatio
              ? <React.Fragment>
                  <span>{ printNumber(this.props.system.currentWethToPethRatio, 3, false) }</span>
                  <span className="unit">ETH</span>
                </React.Fragment>
              : <React.Fragment>Loading...</React.Fragment>
          }
          </div>
          <h3 className="typo-c">DAI/USD</h3>
          <div className="value">
            {
              this.props.system.vox.par.gte(0)
              ?
                <span><span>{ printNumber(this.props.system.vox.par) }</span><span className="unit">USD</span></span>
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
          <h3 className="typo-c">Maximum Global DAI Available</h3>
          <div className="value">
            {
              this.props.system.dai.totalSupply && this.props.system.dai.totalSupply.gt(0)
              ?
                <span><span>{ printNumber(this.props.system.dai.totalSupply) }</span><span className="unit">&#36;</span></span>
              :
                <span>Loading...</span>
            }
          </div>
        <div className="line"></div>
        </div>
      </div>
    )
  }
}

export default SystemInfo;
