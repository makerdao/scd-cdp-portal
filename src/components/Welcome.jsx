import React from 'react';

class Welcome extends React.Component {

  render() {
    return (
      <div>
        <div>Welcome</div>
        <a href="#open" onClick={ e => { e.preventDefault(); this.props.setOpenCDPWizard() } }>Open CDP</a>
      </div>
    )
  }
}

export default Welcome;
