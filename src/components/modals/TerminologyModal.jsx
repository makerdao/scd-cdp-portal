import React from 'react';
import ReactModal from 'react-modal';

const TerminologyModal = (props) => {
  const style = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    content: {
      backgroundColor: '#202930',
      border: 1,
      borderStyle: 'solid',
      borderRadius: '4px',
      borderColor: '#d2d6de',
      bottom: 'auto',
      height: '80%',  // set height
      left: '50%',
      padding: '2rem',
      position: 'fixed',
      right: 'auto',
      top: '50%', // start from center
      transform: 'translate(-50%,-50%)', // adjust top "up" based on height
      width: '90%',
      maxWidth: '800px',
      overflow: 'hidden'
    }
  };

  return (
    <ReactModal
        isOpen={ props.modal.show }
        contentLabel="Action Modal"
        style={ style } >
      <div id="termsWrapper">
        <a href="#action" className="close" onClick={ props.handleCloseTerminologyModal }>X</a>
        <h2>Terminology</h2>
        <div className="content">
          <div>
            <strong>% Tot (PETH):</strong> Ratio of collateral PETH to total outstanding PETH<br />
            <strong>% Ratio:</strong> Collateral ratio of the CDP<br />
            <strong>Account:</strong> User’s active ethereum account<br />
            <strong>Avail. Dai (to draw):</strong> Maximum Dai that can currently be drawn from a CDP<br />
            <strong>Avail. PETH (to free):</strong> Maximum PETH that can currently be released from a CDP<br />
            <strong>Bite:</strong> Initiate liquidation of an undercollateralized CDP<br />
            <strong>Boom:</strong> Buy DAI with PETH<br />
            <strong>Bust:</strong> Buy PETH with DAI<br />
            <strong>CDP Fee:</strong> CDP interest rate<br />
            <strong>Collateral Auction:</strong> The auction selling collateral in a liquidated CDP. It is designed to prioritize covering the debt owed by the CDP, then to give the owner the best price possible for their collateral refund<br />
            <strong>Collateralized Debt Position (CDP):</strong> A smart contract whose users receive an asset (Dai), which effectively operates as a debt instrument with an interest rate. The CDP user has posted collateral in excess of the value of the loan in order to guarantee their debt position<br />
            <strong>Collateral Ratio:</strong> Ratio of the value of a CDP’s collateral to the value of its debt<br />
            <strong>Debt Ceiling:</strong> Maximum number of DAI that can be issued<br />
            <strong>Debt (Dai):</strong> Amount of outstanding DAI debt in a CDP<br />
            <strong>Deficit:</strong> Whether the system is at less than 100% overall collateralisation<br />
            <strong>Draw:</strong> Create Dai against a CDP<br />
            <strong>ETH:</strong> Ethereum<br />
            <strong>ETH/USD:</strong> Price of 1 ETH in USD (as determined by the median of the feeds)<br />
            <strong>Exit:</strong> Exchange PETH for ETH<br />
            <strong>Free:</strong> Remove collateral from a CDP<br />
            <strong>Give:</strong> Transfer CDP ownership<br />
            <strong>Join:</strong> Exchange ETH for PETH<br />
            <strong>Keepers:</strong> Independent economic actors that trade Dai, CDPs and/or MKR, create Dai or close CDPs and seek arbitrage opportunities in The Dai Stablecoin System and as a result help maintain Dai market rationality and price stability<br />
            <strong>Liq. Penalty:</strong> Penalty charged by the system upon liquidation, as a percentage of the CDP collateral<br />
            <strong>Liq. Ratio:</strong> Collateralization ratio below which a CDP may be liquidated<br />
            <strong>Liquidation price:</strong> ETH price at which a CDP will become unsafe and at risk of liquidation<br />
            <strong>Lock:</strong> Add collateral to a CDP<br />
            <strong>Locked (PETH):</strong> Amount of PETH collateral in a CDP<br />
            <strong>Oracles:</strong> Ethereum accounts (contracts or users) selected to provide price feeds into various components of The Dai &amp; Dai Stablecoin System<br />
            <strong>Open:</strong> Open a new CDP<br />
            <strong>Pending Sale (DAI):</strong> Amount of surplus DAI pending sale via boom<br />
            <strong>Pending Sale (PETH):</strong> Amount of PETH collateral pending liquidation via bust<br />
            <strong>Redeemable:</strong> Amount of ETH available to cash for DAI<br />
            <strong>Risk Parameters:</strong> The stability fee, liquidation ratio, boom/bust gap, and debt ceiling<br />
            <strong>Safe:</strong> Whether the overall collateralization of the system is above the liquidation ratio<br />
            <strong>DAI Target Rate:</strong> Annual % change of Dai target price in USD. This represents Dai deflation or inflation when positive or negative, respectively<br />
            <strong>DAI/USD:</strong> Target price for 1 DAI in USD<br />
            <strong>PETH:</strong> The token used as collateral in CDPs which represents a claim on the ETH collateral pool of the Dai Stablecoin System<br />
            <strong>PETH/ETH:</strong> Amount of collateral pool ETH claimed by 1 PETH<br />
            <strong>Shut:</strong> Close a CDP - Wipe all debt, Free all collateral, and delete the CDP<br />
            <strong>Spread (boom/bust):</strong> Discount/premium relative to Dai target price at which the system buys/sells collateral PETH for DAI. When negative, collateral is being sold at a discount (under ‘bust’) and bought at a premium (under ‘boom’)<br />
            <strong>Spread (join/exit):</strong> Discount/premium for converting between ETH and PETH via join and exit; the profits are accrued to the PETH collateral pool<br />
            <strong>Status:</strong> Whether the CDP is safe, unsafe (vulnerable to liquidation), or closed<br />
            <strong>Tap:</strong> Liquidator<br />
            <strong>Top:</strong> System overview / settlement<br />
            <strong>Total Locked:</strong> Amount of PETH locked as collateral in CDPs<br />
            <strong>Total Pooled:</strong> Amount of ETH in the PETH collateral pool<br />
            <strong>Tub:</strong> CDP engine<br />
            <strong>Wipe:</strong> Use Dai to cancel CDP debt<br />
            <strong>Wrap/Unwrap ETH:</strong> Convert Ethereum into an ERC-20 compatible token<br />
          </div>
        </div>
      </div>
    </ReactModal>
  )
}

export default TerminologyModal;
