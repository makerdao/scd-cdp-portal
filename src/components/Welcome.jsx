import React from 'react';

class Welcome extends React.Component {

  render() {
    return (
      <div>
        <div>Welcome</div>
        <a href="#open" onClick={ this.props.changePage } data-page="open">Open CDP</a>
      </div>
    )
  }
}

export default Welcome;
