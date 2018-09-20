// Libraries
import React from "react";
import {inject, observer} from "mobx-react";
import Markdown from "markdown-to-jsx";
import DocumentTitle from "react-document-title";

// Components
import Menu from "./Menu";

@inject("content")
@observer
class Terms extends React.Component {
  render() {
    return (
      <DocumentTitle title="CDP Portal: Terms of Service">
        <div className="full-width-page">
          <div className="wrapper">
            <Menu page="terms" />
            <main className="main-column fullwidth markdown">
              <Markdown children={ this.props.content.getTerms() } />
            </main>
          </div>
        </div>
      </DocumentTitle>
    )
  }
}

export default Terms;
