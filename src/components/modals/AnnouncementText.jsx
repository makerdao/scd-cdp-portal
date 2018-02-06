import React, { Component } from 'react';

class AnnouncementText extends Component {
  render() {
    return(
      <div>
        <p>
          We are proud to announce that after more than 2.5 years of development the Maker community is finally able to release its first decentralized stablecoin system.
        </p>
        <p>
          We call this system Dai (“Dai System and Software” ). Dai is a basic decentralized stablecoin design that is soft-pegged to 1 USD and backed by ETH as collateral (“Dai”). You can read about it in more detail here: <a href="https://makerdao.com/whitepaper" target="_blank" rel="noopener noreferrer">https://makerdao.com/whitepaper</a>.
        </p>
        <p>
          MKR holders retain the ability to perform a global settlement of Dai. A global settlement essentially “unwinds” the system and shuts it down permanently. Every user that holds Dai at the time of the global settlement will receive a claim to 1 USD worth of ETH at the time the global settlement is enacted. CDP users will have their active positions closed automatically and receive their excess collateral as ETH. The global settlement is the ultimate mechanism enforcing the 1 USD soft-peg of Dai. (Please note that the actual mechanics are slightly more complicated than described here, since users need to convert PETH and W-ETH to regular ETH).
        </p>
        <p>
          MKR holders have scheduled this Dai instance to become globally settled at some point in the future to allow for additional upgrades to Dai with a fresh Dai deployment.
        </p>
        <p>
          If MKR holders detect too large an influx of new users external to the Maker community, they will probably use the global settlement to shutdown the system in order to protect users. The global settlement might be also triggered when the Debt Ceiling is reached (see below).
        </p>
        <p>
          By clicking Accept below, you understand and agree that the system will be globally settled at the time discretionarily chosen by MKR holders and that the global settlement might happen at any time and without prior announcement.
        </p>
        <p>
          The first Dai instance has been deployed with the following parameters:
        </p>
        <ul>
          <li>Liquidation Ratio: 150%</li>
          <li>Liquidation Penalty: 13%</li>
          <li>Debt Ceiling: 50 million Dai</li>
          <li>Target Rate: 0% (USD)</li>
          <li>Stability Fee: 0.5%</li>
          <li>Boom/Bust Spread: -3%</li>
          <li>Join/Exit Spread: 0%</li>
        </ul>
        <p>
          We believe that the important data point to understand is the Liquidation Ratio of 150% and the Liquidation Penalty of 13%. This means that a Dai CDP user must hold his collateral-to-debt ratio above 150% at all times. If the collateral-to-debt ratio of a CDP falls below 150%, it becomes vulnerable to liquidation. If liquidation is triggered, the outstanding debt of the CDP increases by 13%, and the CDP is then settled based on the price feed.
        </p>
        <p>
          This Dai instance is just the first of many deployments. There will be continuous iteration on the Dai design and upgrades will be enforced by globally settling prior deployments. If a Dai instance hits its Debt Ceiling, it may also be necessary to globally settle it. The Debt Ceiling of the first Dai instance is at 50 million USD. The final iteration of Dai will have recapitalization financed by MKR dilution, and multiple collateral types.
          </p>
        <p>
          Dai System and Software is based on experimental blockchain and smart contract technology which carries significant and inherent operational, technological, financial and regulatory risks. It cannot be excluded that, as a result of defects, technical bugs, network forks, intentional attacks of third parties, acts of God, unscheduled maintenance, or other events, the Dai System and Software experiences disruption, suspension or termination, and/or the value of Dai over time may experience extreme volatility or depreciate in full, as well as ETH may be lost. Attacks by hackers on the Dai System and Software, smart contracts or other software used may have unforeseeable consequences, including loss of Dai and/or ETH. Also, market conditions may change and thus no market liquidity is guaranteed. All smart contracts are ultimately controlled by the network of miners. There are also other risks associated with use of the Dai System and Software, including those that cannot be anticipated and by clicking Accept below you declare and confirm that you understand the risks of using experimental public blockchain technology.
        </p>
        <p>
          The Dai System and Software and all of the matters set forth in the White Paper are new and untested. Use of the Dai System and Software requires deep knowledge of smart contract technology and related fields. Its use without proper skills and preparation may result in unintended consequences. Source code of the Dai System and Software as well as information on security reviews conducted so far is available here: <a href="https://medium.com/@MakerDAO/single-collateral-dai-source-code-and-security-reviews-523e1a01a3c8" target="_blank" rel="noopener noreferrer">https://medium.com/@MakerDAO/single-collateral-dai-source-code-and-security-reviews-523e1a01a3c8</a>.
        </p>
        <p>
          All users of the Dai System and Software expressly acknowledge, understands and agrees that the user is using the Dai System and Software at the user’s sole risk and that the Dai System and Software are each provided, used and acquired on an “AS IS” and on an “AS AVAILABLE” basis without representations, warranties, promises or guarantees whatsoever of any kind by any entity and the user shall rely on its own examination and investigation thereof.
        </p>
        <p>
          By clicking Accept, you confirm that you have read all the above important information, that you understand them and that you agree to them.
        </p>
      </div>
    )
  }
}

export default AnnouncementText;
