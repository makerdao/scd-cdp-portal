import React from 'react';
import {observer} from 'mobx-react';
import {printNumber, toBigNumber, toWei} from '../helpers';

class LegacyCups extends React.Component {
  render() {
    return (
      Object.keys(this.props.system.tub.legacyCups).length > 0 &&
      <div>
        <header className="col">
          <h1 className="typo-h1 inline-headline">Migrate CDPs</h1>
        </header>
        Your account has { this.props.system.tub.legacyCups.length } existing CDPs to be migrated.
        {
          Object.keys(this.props.system.tub.legacyCups).map(key =>
            <React.Fragment key={ key }>
              <div>
                CDP ID #{ key }
              </div>
              <table>
                <thead>
                  <tr>
                    <th>DAI Debt</th>
                    <th>Locked PETH</th>
                    <th>% Ratio</th>
                    <th>Liquidation Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{ printNumber(this.props.system.tab(this.props.system.tub.legacyCups[key])) }</td>
                    <td>{ printNumber(this.props.system.tub.legacyCups[key].ink) }</td>
                    <td>
                      {
                        this.props.system.tub.off === false
                          ? this.props.system.tub.legacyCups[key].art.gt(toBigNumber(0)) && this.props.system.tub.legacyCups[key].pro
                            ? <span>
                                { printNumber(toWei(this.props.system.tub.legacyCups[key].ratio).times(100)) }%
                              </span>
                            : '-'
                          : '-'
                      }
                    </td>
                    <td>
                      { this.props.system.tub.off === false && this.props.system.tub.legacyCups[key].liq_price && this.props.system.tub.legacyCups[key].liq_price.gt(0) ? printNumber(this.props.system.tub.legacyCups[key].liq_price) : '-' }
                    </td>
                    <td>
                      {
                        this.props.system.tub.off === false
                        ?
                          this.props.system.tub.legacyCups[key].lad === '0x0000000000000000000000000000000000000000'
                          ?
                            'Closed'
                          :
                            this.props.system.tub.legacyCups[key].safe === 'N/A' || this.props.system.pip.val.lt(0)
                            ?
                              'N/A'
                            :
                              this.props.system.tub.legacyCups[key].safe
                              ?
                                this.props.system.tub.legacyCups[key].art.eq(0) || this.props.system.tub.legacyCups[key].ratio.gte(2)
                                ?
                                  'Safe'
                                :
                                  'Risk'
                              :
                                'Unsafe'
                        :
                          '-'
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
              <div>
                <a href="#action" style={ {display: 'block'} } data-method="migrate" data-cup={ key } onClick={ this.props.handleOpenDialog }>Migrate CDP #{ key }</a>
              </div>
            </React.Fragment>
          )
        }
        <hr />
        <button onClick={ () => this.props.setOpenMigrate(false) }>
          Return to Dashboard
        </button>
      </div>
    )
  }
}

export default observer(LegacyCups);
