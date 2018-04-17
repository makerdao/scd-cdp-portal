import React from 'react';
import {observer} from 'mobx-react';
import {printNumber, wdiv, wmul} from '../helpers';

class SystemInfo extends React.Component {
  state = {
    viewMore: false
  };

  render = () => {
    return (
      <div className="col col-2-m">
        <h2 className="typo-h2">System Info
          <span className="typo-c right" style={ {textTransform: 'capitalize'} }>{ this.props.network === 'main' ? 'mainnet' : this.props.network }</span>
        </h2>
        <h3 className="typo-c">System Collateralization</h3>
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
              'Loading...'
          }
        </div>
        <h3 className="typo-c">Current PETH value</h3>
        <div className="value">
          {
            this.props.system.tub.per.gte(0)
            ?
              <span><span>{ printNumber(this.props.system.tub.per) }</span><span className="unit">ETH</span></span>
            :
              <span>Loading...</span>
          } 
        </div>
        <h3 className="typo-c">Current ETH value</h3>
        <div className="value">
          {
            this.props.pipVal && this.props.pipVal.gt(0)
            ?
              <span><span>{ printNumber(this.props.pipVal) }</span><span className="unit">&#36;</span></span>
            :
              <span>Loading...</span>
          } 
        </div>
        <h3 className="typo-c">Current MKR value</h3>
        <div className="value">
          {
            this.props.pepVal && this.props.pepVal.gt(0)
            ?
              <span><span>{ printNumber(this.props.pepVal) }</span><span className="unit">&#36;</span></span>
            :
              <span>Loading...</span>
          } 
        </div>
      </div>
    )
  }
}

export default observer(SystemInfo);
