// Libraries
import React from "react";
import {observer} from "mobx-react";
import {Route, Switch, withRouter} from "react-router-dom";

// Components
import Help from "./Help";
import Home from "./Home";
import NotFound from "./NotFound";
import Terms from "./Terms";

import "./App.css";

class App extends React.Component {
  componentDidUpdate = prevProps => {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return (
      <Switch>
        <Route exact path="/help" render={() => <Help />} />
        <Route exact path="/terms" render={() => <Terms />} />
        <Route exact path="/" render={() => <Home />} />
        <Route component={ NotFound } />
      </Switch>
    )
  }
}

export default withRouter(observer(App));
