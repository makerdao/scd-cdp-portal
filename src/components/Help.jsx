// Libraries
import React from "react";
import {inject} from "mobx-react";
import {Link} from "react-router-dom";
import DocumentTitle from "react-document-title";

// Components
import Menu from "./Menu";

class Help extends React.Component {
  render() {
    return (
      <DocumentTitle title="Dai Dashboard: Help">
        <div className="full-width-page">
          <div className="wrapper">
            {
              <Menu page="help" />
            }
            <main className="main-column fullwidth help-page">
              <div>
                <header className="col">
                  <h1 className="typo-h1">Help</h1>
                </header>
                <div className="row">
                  <div className="col col-2 col-extra-padding">
                    <h2 className="typo-h2 ">FAQ</h2>
                    <h3 className="typo-h3 typo-white">First steps</h3>
                    <ul className="typo-cl bullets">
                      <li><Link to="/help/what-is-a-cdp">What is a Colleteral Dept Position (CDP)?</Link></li>
                      <li><Link to="/help/how-do-i-open-a-cdp">How do I open a CDP?</Link></li>
                      <li><Link to="/help/how-do-i-generate-dai">How do I generate DAI?</Link></li>
                      <li><Link to="/help/how-do-i-free-eth">How do I free ETH?</Link></li>
                      <li><Link to="/help/what-is-peth">What is PETH?</Link></li>
                      <li><Link to="/help/how-do-i-get-mkr">How do I get MKR tokens?</Link></li>
                    </ul>
                    <h3 className="typo-h3 typo-white">Most asked questions</h3>
                    <ul className="typo-cl bullets">
                      <li><Link to="/help/how-does-the-avatar-work">How does the avatar work?</Link></li>
                    </ul>
                  </div>
                  <div className="col col-2 col-extra-padding" style={ {paddingLeft: '2.5em'} }>
                    <h2 className="typo-h2 ">Videos</h2>
                    <h3 className="typo-h3 typo-white">First steps</h3>
                    <ul className="typo-cl bullets">
                      <li><a href="">What is a Colleteral Dept Position (CDP)?</a></li>
                      <li><a href="">How do I create a CDP?</a></li>
                      <li><a href="">How do I generate DAI?</a></li>
                      <li><a href="">How do I free ETH?</a></li>
                    </ul>
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

export default inject("content")(Help);
