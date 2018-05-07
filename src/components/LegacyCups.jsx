import React from 'react';
import {observer} from 'mobx-react';

class LegacyCups extends React.Component {
  render() {
    return (
      Object.keys(this.props.legacyCups).length > 0 &&
      <div>
        You have legacy CDPs to migrate:
        {
          Object.keys(this.props.legacyCups).map(id =>
            <a href="#action" style={ {display: 'block'} } key={ id } data-method="migrate" data-cup={ id } onClick={ this.props.handleOpenDialog }>Migrate CDP {id}</a>
          )
        }
        <hr />
      </div>
    )
  }
}

export default observer(LegacyCups);
