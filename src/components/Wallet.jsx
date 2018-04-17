import React from 'react';
import {observer} from 'mobx-react';
import {printNumber, etherscanAddress} from '../helpers';

const Token = props => {
  return (
    <div className="col col-2-m">
      <h2 className="typo-h2">
        Wallet
        <span className="typo-c wallet-id">-{ props.account ? etherscanAddress(props.network, props.account.substring(2, 8), props.account) : 'Loading...' }</span>
      </h2>
      {
        props.account
        ?
          <ul className="wallet">
            <li><span className="value"><span>{ printNumber(props.profile.accountBalance) }</span><span className="unit">ETH</span></span></li>
            {/* <li><span className="value"><span>{ printNumber(props.system.gem.myBalance) }</span><span className="unit">WETH</span></span></li>
            <li><span className="value"><span>{ printNumber(props.system.skr.myBalance) }</span><span className="unit">PETH</span></span></li> */}
            <li><span className="value"><span>{ printNumber(props.system.dai.myBalance) }</span><span className="unit">DAI</span></span></li>
            <li><span className="value"><span>{ printNumber(props.system.gov.myBalance) }</span><span className="unit">MKR</span></span></li>
          </ul>
        :
          <p>Log in with your account to see you dashboard</p>
      }
    </div>
  )
}

export default observer(Token);
