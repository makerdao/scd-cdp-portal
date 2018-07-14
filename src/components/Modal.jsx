import React from "react";
import {observer} from "mobx-react";

class Modal extends React.Component {
  constructor() {
    super();
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }
  componentWillMount() {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
  }
  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }
  handleKeyDown(event) {
    if (event.keyCode === 27) this.props.close();
  }
  handleInnerClick(e) {
    e.stopPropagation();
  }
  render() {
    return (
      <React.Fragment>
      {
        this.props.show &&
        <div className="modal" onClick={ this.props.close }>
          <div className="modal-inner" onClick={ this.handleInnerClick }>
            { this.props.children }
          </div>
        </div>
      }
      </React.Fragment>
    )
  }
}

export default observer(Modal);
