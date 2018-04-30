import React from 'react';
import {observer} from "mobx-react";

class NotifySetUp extends React.Component {
  render() {
    const txs = Object.keys(this.props.transactions.registry).filter(tx => this.props.transactions.registry[tx].cdpCreationTx);
    
    return (
      txs.length > 0 &&
      <div style={ {position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, background: 'rgba(255,255,255,0.4)', zIndex: 997} }>
        <div style={ {position: 'relative', width: '700px', height: '400px', background: '#202930', zIndex: 998, margin: 'auto'} }>
          {
            this.props.transactions.registry[txs[0]].pending || Object.keys(this.props.system.tub.cups).length === 0
            ?
              'Creating CDP...'
            :
              <React.Fragment>
                CDP Created <button onClick={ () => this.props.transactions.cleanCdpCreationProperty(txs[0]) }>Got it</button>
              </React.Fragment>
          }
        </div>
      </div>
    )
  }
}

export default observer(NotifySetUp);
