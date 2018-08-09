// Libraries
import React from "react";
import {observer} from "mobx-react";
import {Route, Switch, withRouter} from "react-router-dom";

// Components
import Help from "./Help";
import HelpItem from "./HelpItem";
import Home from "./Home";
import NotFound from "./NotFound";
import Terms from "./Terms";

import "./App.css";

@withRouter
@observer
class App extends React.Component {
  componentDidUpdate = prevProps => {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return (
      <Switch>
        <Route exact path="/help" title="Dai Dashboard: Help" component={ Help } />
        <Route path="/help/:helpId" title="Dai Dashboard: Help" component={ HelpItem } />
        <Route exact path="/terms" title="Dai Dashboard: Terms of Service" render={() => <Terms />} />
        <Route exact path="/" title="Dai Dashboard" component={ Home } />
        <Route component={ NotFound } />
      </Switch>
    )
  }
}

export default App;
