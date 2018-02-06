import React from 'react';
import { printNumber, etherscanAddress } from '../helpers';

const Token = (props) => {
  return (
    <div className="col col-2-m">
      <h2 className="typo-h2">
        Wallet
        {
          props.profile.activeProfile &&
          <span className="typo-c wallet-id">-{ props.profile.activeProfile ? etherscanAddress(props.network, props.profile.activeProfile.substring(2, 8), props.profile.activeProfile) : 'Loading...' }</span>
            
        }
      </h2>
      {
        props.profile.activeProfile
        ?
          <ul className="wallet">
            <li><span className="value"><span>{ printNumber(props.profile.accountBalance) }</span><span className="unit">ETH</span></span></li>
            <li><span className="value"><span>{ printNumber(props.system.gem.myBalance) }</span><span className="unit">WETH</span></span></li>
            <li><span className="value"><span>{ printNumber(props.system.skr.myBalance) }</span><span className="unit">PETH</span></span></li>
            <li><span className="value"><span>{ printNumber(props.system.dai.myBalance) }</span><span className="unit">DAI</span></span></li>
            <li><span className="value"><span>{ printNumber(props.system.gov.myBalance) }</span><span className="unit">MKR</span></span></li>
          </ul>
        :
          <p>Log in with you account to see you dashboard</p>
      }
    </div>
  )
}

export default Token;
