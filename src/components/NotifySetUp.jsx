// Libraries
import React from "react";
import {inject, observer} from "mobx-react";

// Utils
import {etherscanTx} from "../utils/helpers";

// Images
import cdpCreated from "images/cdp-created.svg";
import cdpCreatedIcon1 from "images/cdp-created-icon-1.svg";
import cdpCreatedIcon2 from "images/cdp-created-icon-2.svg";
import cdpCreatedIcon3 from "images/cdp-created-icon-3.svg";

import cdpCreating1 from "images/cdp-creating-1.svg";
import cdpCreating2 from "images/cdp-creating-2.svg";
import cdpCreating3 from "images/cdp-creating-3.svg";
import cdpCreating4 from "images/cdp-creating-4.svg";
import cdpCreating5 from "images/cdp-creating-5.svg";
import cdpCreating6 from "images/cdp-creating-6.svg";

const cdpCreatingAnimation = [cdpCreating1, cdpCreating2, cdpCreating3, cdpCreating4, cdpCreating5, cdpCreating6];

class CreatingCDPAnimation extends React.Component {
  constructor(props){
    super(props);
    this.state = { currentCount: 1 }
  }
  timer() {
    this.setState({
      currentCount: this.state.currentCount === 6 ? 1 : this.state.currentCount + 1
    })
  }
  componentDidMount() {
    this.intervalId = setInterval(this.timer.bind(this), 2000);
  }
  componentWillUnmount() {
    clearInterval(this.intervalId);
  }
  render() {
    return(
      <React.Fragment>
        <img className="main" src={ cdpCreatingAnimation[this.state.currentCount - 1] } alt="Creating CDP" />
      </React.Fragment>
    );
  }
}

@inject("transactions")
@inject("system")
@inject("network")
@observer
class NotifySetUp extends React.Component {
  render() {
    const txs = Object.keys(this.props.transactions.registry).filter(tx => this.props.transactions.registry[tx].cdpCreationTx);
    const txHash = txs[0] || null;

    return (
      this.props.transactions.showCreatingCdpModal &&
      <div className="modal create-cdp">
        <div className="modal-inner">
          {
            this.props.transactions.registry[txs[0]].pending || Object.keys(this.props.system.tub.cups).length === 0
            ?
              <React.Fragment>
                <h2>Creating your CDP</h2>
                <CreatingCDPAnimation />
                <p style={ {margin: "margin: 0 auto", padding: "2rem 0 2.5rem"} }>
                {
                  txHash
                  ?
                    etherscanTx(this.props.network.network, "View transaction", txHash)
                  :
                    "Creating your new CDP..."
                }
                </p>
              </React.Fragment>
            :
              <React.Fragment>
                <h2>Congratulations on your new CDP</h2>
                <img className="main" src={ cdpCreated } alt="CDP created" />
                <p>
                  Welcome to the CDP Portal where you can view and manage<br />your collateral and debt position on a decentralized system.
                </p>
                <ul>
                  <li>
                    <div className="icon"><img src={ cdpCreatedIcon1 } alt="*" style={ {height: "24px"} } /></div>
                    Check current collateral<br />to debt position
                  </li>
                  <li>
                    <div className="icon"><img src={ cdpCreatedIcon2 } alt="*" style={ {height: "25px"} } /></div>
                    Deposit or withdraw<br />collateral
                  </li>
                  <li>
                    <div className="icon"><img src={ cdpCreatedIcon3 } alt="*" style={ {height: "30px"} } /></div>
                    Generate or pay<br />back SAI
                  </li>
                </ul>
                <div className="align-center" style={ {paddingBottom: "3.7rem", userSelect: "none"} }>
                  <button className="modal-btn is-primary" onClick={ () => this.props.transactions.cleanCdpCreationProperty(txs[0]) } style={ {width: "13rem"} }>OK</button>
                </div>
              </React.Fragment>
          }
      </div>
    </div>
    )
  }
}

export default NotifySetUp;
