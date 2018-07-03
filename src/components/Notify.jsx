import React from 'react';
import {observer} from "mobx-react";

class Item extends React.Component {
  displayName = "Item";

  hideNotification = () => {
    this.props.hideNotification(this.props.id);
  }

  render = () => {
    return (
      React.createElement("div", { className: "col nf-" + this.props.theme, onClick: this.hideNotification },
        React.createElement("button", { className: "close-box" }),
        React.createElement("h3", { className: "notification-headline" }, this.props.title),
        React.createElement("p", { className: "", dangerouslySetInnerHTML: { __html: this.props.msg } })
      )
    )
  }
};

class Notify extends React.Component {
  displayName = "Notify";
  key = 0;

  constructor() {
    super();
    this.state = {}
  }

  componentDidMount = () => {
    this.props.transactions.notificator = this.props.network.notificator = this;
  }

  getInitialState = () => {
    return {};
  }

  success = (key, title, msg, time) => {
    this.addNotify(key, title, msg, time, 'success');
  }

  error = (key, title, msg, time) => {
    this.addNotify(key, title, msg, time, 'error');
  }

  info = (key, title, msg, time) => {
    this.addNotify(key, title, msg, time, 'info');
  }

  notice = (key, title, msg, time) => {
    this.addNotify(key, title, msg, time, 'notice');
  }

  addNotify = (key, title, msg, time, theme) => {
    const state = {...this.state}
    state[key] = { title: title, msg: msg, time: time, theme: theme };
    this.setState(state);
    this.countToHide(time, key);
  }

  countToHide = (duration, key) => {
    if (duration) {
      var that = this;
      setTimeout(function () {
        that.hideNotification(key);
      }, duration);
    }
  }

  hideNotification = (key) => {
    delete this.state[key];
    this.setState(this.state);
  }

  render = () => {
    var keys = Object.keys(this.state);
    var state = this.state;
    var hide = this.hideNotification;
    var el = keys.map(function (key) {
      return React.createElement(Item, {
        id: key,
        key: key,
        theme: state[key].theme,
        hideNotification: hide,
        title: state[key].title,
        msg: state[key].msg
      }
      )
    });
    return (React.createElement("div", { className: "notifications-container" }, el));
  }
};

export default observer(Notify);
