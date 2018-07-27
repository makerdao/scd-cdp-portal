// Libraries
import React from "react";
import {inject, observer} from "mobx-react";
import {Link} from "react-router-dom";
import Markdown from "markdown-to-jsx";
import DocumentTitle from "react-document-title";

// Components
import Menu from "./Menu";
import NotFound from "./NotFound";

class HelpItem extends React.Component {
  render() {
    const helpId = this.props.match.params.helpId || null;
    const helpItem = this.props.content.getHelpItem(helpId);
    if (!helpId || !helpItem) return <NotFound />;

    return (
      <DocumentTitle title={ "Dai Dashboard: " + helpItem.title }>
        <div className="full-width-page">
          <div className="wrapper">
            <Menu page="help" />
            <main className="main-column fullwidth help-page">
              <div>
                <header className="col">
                  <h1 className="typo-h1">Help</h1>
                </header>
                <div className="row">
                  <div className="col col-extra-padding">
                    <div className="breadcrumbs"><Link className="breadcrumb-root" to="/help">FAQ</Link><span className="breadcrumb-page">{ helpItem.title }</span></div>
                    <div className="help-faq-item-markdown-container">
                      <Markdown className="help-faq-item-markdown" children={ helpItem.markdown } />
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </DocumentTitle>
    )
  }
}

export default inject("content")(observer(HelpItem));
