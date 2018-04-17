import React, {Component} from 'react';
// import CupChart from './CupChart'
import CupHistory from './CupHistory';
// import {printNumber, toBytes32, wmul, toBigNumber, toWei, methodSig} from '../helpers';
import {printNumber, wmul, toBigNumber, toWei} from '../helpers';


class Cup extends Component {
  cupId = this.props.system.tub.cupId ? this.props.system.tub.cupId : Object.keys(this.props.system.tub.cups)[0];
  cup = this.props.system.tub.cups[this.cupId];

  // shut = () => {
  //   const id = Math.random();
  //   const title = `Shut CDP ${this.cupId}`;
  //   this.logRequestTransaction(id, title);
  //   this.proxyObj.execute['address,bytes'](
  //     this.saiProxyAddr(),
  //     `${methodSig(`shut(bytes32)`)}${toBytes32(this.cupId, false)}`,
  //     (e, tx) => this.log(e, tx, id, title, [['getMyCups'], ['getAccountBalance'], ['setUpToken', 'sai'], ['setUpToken', 'sin']])
  //   );
  // }

  // give = newOwner => {
  //   const id = Math.random();
  //   const title = `Transfer CDP ${this.cupId} to ${newOwner}`;
  //   this.logRequestTransaction(id, title);
  //   this.proxyObj.execute['address,bytes'](
  //     this.saiProxyAddr(),
  //     `${methodSig(`give(bytes32, address)`)}${toBytes32(this.cupId, false)}${addressToBytes32(newOwner, false)}`,
  //     (e, tx) => this.log(e, tx, id, title, [['getMyCups']])
  //   );
  // }

  // lockAndDraw = (eth, dai) => {
  //   let action = false;
  //   let title = '';

  //   if (eth.gt(0) || dai.gt(0)) {
  //     if (!this.cupId) {
  //       title = `Lock ${eth.valueOf()} ETH + Draw ${dai.valueOf()} DAI`;
  //       action = `${methodSig(`lockAndDraw(address,uint256)`)}${addressToBytes32(this.state.system.tub.address, false)}${toBytes32(toWei(dai), false)}`;
  //     } else {
  //       if (dai.equals(0)) {
  //         title = `Lock ${eth.valueOf()} ETH`;
  //         action = `${methodSig(`lock(address,bytes32)`)}${addressToBytes32(this.state.system.tub.address, false)}${toBytes32(this.cupId, false)}`;
  //       } else if (eth.equals(0)) {
  //         title = `Draw ${dai.valueOf()} DAI`;
  //         action = `${methodSig(`draw(address,bytes32,uint256)`)}${addressToBytes32(this.state.system.tub.address, false)}${toBytes32(this.cupId, false)}${toBytes32(toWei(dai), false)}`;
  //       } else {
  //         title = `Lock ${eth.valueOf()} ETH + Draw ${dai.valueOf()} DAI`;
  //         action = `${methodSig(`lockAndDraw(address,bytes32,uint256)`)}${addressToBytes32(this.state.system.tub.address, false)}${toBytes32(this.cupId, false)}${toBytes32(toWei(dai), false)}`;
  //       }
  //     }

  //     const id = Math.random();
  //     this.logRequestTransaction(id, title);
  //     this.proxyObj.execute['address,bytes'](
  //       this.saiProxyAddr(),
  //       action,
  //       {value: toWei(eth)},
  //       (e, tx) => this.log(e, tx, id, title, this.cupId ? [['reloadCupData', this.cupId], ['getAccountBalance'], ['setUpToken', 'sai'], ['setUpToken', 'sin']] : [['getMyCups'], ['getAccountBalance'], ['setUpToken', 'sai'], ['setUpToken', 'sin']])
  //     );
  //   }
  // }

  // wipeAndFree = (eth, dai) => {
  //   let action = false;
  //   let title = '';
  //   if (eth.gt(0) || dai.gt(0)) {
  //     if (dai.equals(0)) {
  //       title = `Withdraw ${eth.valueOf()} ETH`;
  //       action = `${methodSig(`free(address,bytes32,uint256)`)}${addressToBytes32(this.state.system.tub.address, false)}${toBytes32(this.cupId, false)}${toBytes32(toWei(eth), false)}`;
  //     } else if (eth.equals(0)) {
  //       title = `Wipe ${dai.valueOf()} DAI`;
  //       action = `${methodSig(`wipe(address,bytes32,uint256)`)}${addressToBytes32(this.state.system.tub.address, false)}${toBytes32(this.cupId, false)}${toBytes32(toWei(dai), false)}`;
  //     } else {
  //       title = `Wipe ${dai.valueOf()} DAI + Withdraw ${eth.valueOf()} ETH`;
  //       action = `${methodSig(`wipeAndFree(address,bytes32,uint256,uint256)`)}${addressToBytes32(this.state.system.tub.address, false)}${toBytes32(this.cupId, false)}${toBytes32(toWei(eth), false)}${toBytes32(toWei(dai), false)}`;
  //     }
  //     const id = Math.random();
  //     this.logRequestTransaction(id, title);
  //     this.proxyObj.execute['address,bytes'](
  //       this.saiProxyAddr(),
  //       action,
  //       (e, tx) => this.log(e, tx, id, title, [['reloadCupData', this.cupId], ['getAccountBalance'], ['setUpToken', 'sai'], ['setUpToken', 'sin']])
  //     );
  //   }
  // }

  actions = {
    lock: {
            active: this.props.system.tub.off === false && this.props.profile.accountBalance && this.props.profile.accountBalance.gt(0),
            helper: 'Add collateral to a CDP'
          },
    free: {
            active: this.props.system.pip.val.gt(0) && this.cup.ink.gt(0) && this.cup.safe && (this.props.system.tub.off === false || this.cup.art.eq(0)),
            helper: 'Remove collateral from a CDP'
          },
    draw: {
            active: this.props.system.pip.val.gt(0) && this.props.system.tub.off === false && this.cup.ink.gt(0) && this.cup.safe,
            helper: 'Create Dai against a CDP'
          },
    wipe: {
            active: this.props.system.tub.off === false && this.cup.art.gt(0),
            helper: 'Use Dai to cancel CDP debt'
          },
    shut: {
            active: this.props.system.pip.val.gt(0) && this.props.system.tub.off === false,
            helper: 'Close a CDP - Wipe all debt, Free all collateral, and delete the CDP'
          },
    give: {
            active: this.props.system.pip.val.gt(0) && this.props.system.tub.off === false,
            helper: 'Transfer CDP ownership'
          },
  };

  render(){ 
    return (
      <div>
        <div className="row">
          <div className="col col-2">
            <h3 className="typo-c inline-headline">Collateralization</h3>
            <div className="value typo-cl right">
              {
                this.props.system.tub.off === false
                ? 
                  this.cup.art.gt(toBigNumber(0)) && this.cup.pro
                    ?
                      <span>
                        { printNumber(toWei(this.cup.ratio).times(100)) }<span className="unit">%</span>
                      </span>
                    :
                      '-'
                  :
                    '-'
              }
            </div>
          </div>
          <div className="col col-2">
            <h3 className="typo-c inline-headline">Liquidation price</h3>
            <div className="value typo-cl right">
              {
                this.props.system.tub.off === false && this.cup.liq_price && this.cup.liq_price.gt(0)
                ?
                  <span>{ printNumber(this.cup.liq_price) }<span className="unit">&#36;</span></span>
                :
                  '-'
              }
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col col-2">
            <h3 className="typo-cl inline-headline">Collateral</h3>
            <div className="inner-row">
              <h4 className="typo-c inline-headline">Locked</h4>
              <div className="right">
                <span className="value typo-cl">{ printNumber(wmul(this.cup.ink, this.props.system.tub.per)) }<span className="unit">ETH</span> / { printNumber(this.cup.ink) }<span className="unit">PETH</span></span>
                <button className="text-btn disable-on-dialog" disabled={ !this.actions.lock.active } data-method="lock" data-cup={ this.cupId } onClick={ this.props.handleOpenDialog }>Lock</button>
              </div>	
            </div>
            <div className="inner-row">
              <h4 className="typo-c inline-headline">Available</h4>
              <div className="right">
                <span className="value typo-cl">
                  {
                    this.props.system.tub.off === false
                    ?
                      <span>{ printNumber(wmul(this.cup.avail_skr, this.props.system.tub.per)) }<span className="unit">ETH</span> / { printNumber(this.cup.avail_skr) }<span className="unit">PETH</span></span>
                    :
                      '-'
                  }
                </span>
                <button className="text-btn disable-on-dialog" disabled={ !this.actions.free.active } data-method="free" data-cup={ this.cupId } onClick={ this.props.handleOpenDialog }>Free</button>
              </div>	
            </div>
          </div>
          <div className="col col-2">
            <h3 className="typo-cl inline-headline">Loan</h3>
            <div className="inner-row">
              <h4 className="typo-c inline-headline">Available</h4>
              <div className="right">
                <span className="value typo-cl">
                  {
                    this.props.system.tub.off === false
                    ?
                      <span>{ printNumber(this.cup.avail_dai) }<span className="unit">DAI</span></span>
                    :
                      '-'
                  }
                </span>
                <button className="text-btn disable-on-dialog" disabled={ !this.actions.draw.active } data-method="draw" data-cup={ this.cupId } onClick={ this.props.handleOpenDialog }>Draw</button>
              </div>
            </div>
            <div className="inner-row">
              <h4 className="typo-c inline-headline">Debt</h4>
              <div className="right">
                <span className="value typo-cl">{ printNumber(this.props.tab(this.cup)) }<span className="unit">DAI</span></span>
                <button className="text-btn disable-on-dialog" disabled={ !this.actions.wipe.active } data-method="wipe" data-cup={ this.cupId } onClick={ this.props.handleOpenDialog }>Wipe</button>
              </div>
            </div>
          </div>
        </div>
        {
          Object.keys(this.props.system.chartData.cupPrices).length > 0 &&
          <div className="col">
            <div>
              <ul className="legend typo-cs right">
                <li>
                  <span className="dot dot-white"></span>
                  <span>Collateral</span>
                </li>
                <li>
                  <span className="dot dot-red"></span>
                  <span>Liquidation limit</span>
                </li>
                <li>
                  <span className="dot dot-blue"></span>
                  <span>Loan</span>
                </li>
              </ul>
            </div>
            {/* <CupChart prices={ this.props.system.chartData.cupPrices } highestValue={ this.props.system.chartData.highestValue } /> */}
          </div>
        }
        {
          this.cup.history &&
          <CupHistory actions={ this.cup.history }/>
        }
      </div>
    )
  }
}

export default Cup;
