// Libraries
import React from "react";

export function MenuItems(props) {
  return (
    <div className="dropdown-menu-items">
      { props.children }
    </div>
  );
}

export function MenuItem(props) {
  return (
    <a { ...props } className={ "dropdown-item" + (props.icon ? " has-icon" : "") }>
      {
        props.iconsvg ? props.iconsvg : props.icon && <img className="dropdown-item-icon" src={ props.icon } alt=">" />
      }
      <span>{ props.text }</span>
    </a>
  );
}

export function MenuFooter(props) {
  return (
    <div className="dropdown-footer">
      { props.children }
    </div>
  );
}

export class DropdownMenu extends React.Component {
  render() {
    return (
      <div className="dropdown">
        <img className="dropdown-button" src={ this.props.icon } alt="˅" />
        <svg className="dropdown-arrow" height="13" viewBox="0 0 22 13" width="22" xmlns="http://www.w3.org/2000/svg"><path d="m509.572637 289.001538 9.427363 11.998462h-22l9.427363-11.998462c.682427-.868544 1.939737-1.019421 2.80828-.336994.125361.098498.238496.211632.336994.336994z" fill="#d8d8d8" fillRule="evenodd" transform="translate(-497 -288)" /></svg>
        <div className="dropdown-content">
          { this.props.children }
        </div>
      </div>
    )
  }
}
