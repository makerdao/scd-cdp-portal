// Libraries
import React from "react";
import {observer} from "mobx-react";
import {Link} from "react-router-dom";
import Markdown from "markdown-to-jsx";
import DocumentTitle from "react-document-title";

// Components
import Menu from "./Menu";
import NotFound from "./NotFound";

// JSON Content
import markdown from '../json/faq.json'

class HelpItem extends React.Component {
  render() {
    const helpId = this.props.match.params.helpId || null;
    if (!helpId || !markdown[helpId]) return <NotFound />;

    return (
      <DocumentTitle title={ "Dai Dashboard: " + markdown[helpId].title }>
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
                    <div className="breadcrumbs"><Link className="breadcrumb-root" to="/help">FAQ</Link><span className="breadcrumb-page">{ markdown[helpId].title }</span></div>
                    <div className="help-faq-item-markdown-container">
                      <Markdown className="help-faq-item-markdown" children={ markdown[helpId].markdown } />
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

export default observer(HelpItem);
