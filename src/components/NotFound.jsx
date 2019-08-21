// Libraries
import React from "react";

// Images
import image404 from "images/404.svg";

class NotFound extends React.Component {
  render() {
    return (
      <React.Fragment>
        <div className="not-found">
          <div className="not-found-text-container-1">
            <div className="not-found-text-container-2">
              <svg className="maker-logo" width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fillRule="evenodd"><path d="m-208 0h1440v1020h-1440z" fill="#0b1216"/>
                  <g transform=""><path d="m0 0h72v72h-72z" fill="#fff"/>
                  <g transform="translate(21 26)"><path d="m13.2417802 21.89008v-11.492l-13.24043245-10.0332v21.5252" stroke="#1abc9c"/><path d="m17.3157441 21.89008v-11.492l13.2404325-10.0332v21.5252" stroke="#546979"/><path d="m13.2417802 21.89008v-11.492l-13.24043245-10.0332v21.5252" stroke="#1abc9c"/><path d="m17.3157441 21.89008v-11.492l13.2404325-10.0332v21.5252" stroke="#1b1b1b"/></g>
                  <g transform="translate(21 26)"><path d="m13.2417802 21.89008v-11.492l-13.24043245-10.0332v21.5252" stroke="#1abc9c"/><path d="m17.3157441 21.89008v-11.492l13.2404325-10.0332v21.5252" stroke="#546979"/></g><path d="m34.2417802 47.89008v-11.492l-13.2404325-10.0332v21.5252" stroke="#1abc9c"/><path d="m38.3157441 47.89008v-11.492l13.2404325-10.0332v21.5252" stroke="#1b1b1b"/></g>
                </g>
              </svg>
              <h1>Page not found – Error 404</h1>
              <h2>You spotted a black hole.</h2>
              <p>Don’t go too close – it sucks up<br />pages and contents.</p>
            </div>
            <img src={ image404 } draggable="false" alt="You spotted a black hole" />
          </div>
        </div>
        <div className="not-found-2">
          <div className="not-found-text-container-1">
            <p>We are confident you will find what you were<br />looking for on the main page.</p>
            <button className="text-btn" onClick={ () => { window.location = '/'; }}>GO TO MAIN PAGE</button>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default NotFound;
