var React = require('react');
var createReactClass = require('create-react-class');

var Item = createReactClass({
  displayName: "Item",
  hideNotification: function () {
    this.props.hideNotification(this.props.id);
  },
  render: function () {
    return (
      React.createElement("div", { className: "col nf-" + this.props.theme, onClick: this.hideNotification },
        React.createElement("button", { className: "close-box" }),
        React.createElement("h3", { className: "notification-headline" }, this.props.title),

        React.createElement("p", { className: "" }, this.props.msg)
      )
    )
  }
});

var Notify = createReactClass({
  displayName: "Notify",
  key: 0,
  getInitialState: function () {
    return {};
  },
  success: function (key, title, msg, time) {
    this.addNotify(key, title, msg, time, 'success');
  },
  error: function (key, title, msg, time) {
    this.addNotify(key, title, msg, time, 'error');
  },
  info: function (key, title, msg, time) {
    this.addNotify(key, title, msg, time, 'info');
  },
  addNotify: function (key, title, msg, time, theme) {
    const state = {...this.state}
    state[key] = { title: title, msg: msg, time: time, theme: theme };
    this.setState(state);
    this.countToHide(time, key);
  },
  countToHide: function (duration, key) {
    if (duration) {
      var that = this;
      setTimeout(function () {
        that.hideNotification(key);
      }, duration);
    }
  },
  hideNotification: function (key) {
    delete this.state[key];
    this.setState(this.state);
  },
  render: function () {
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
});

module.exports = Notify;
