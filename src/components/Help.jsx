import React from 'react';

const Help = (props) => {
  return (
    <div>
      <header className="col">
        <h1 className="typo-h1">Help</h1>
      </header>
      <div className="row">
        <div className="col col-2 col-extra-padding">
          <h2 className="typo-h2 ">FAQ</h2>
          
          <h3 className="typo-h3 typo-white">First steps</h3>
          <ul className="typo-cl expandable">
            <li><a href="">What is a Colleteral Dept Position (CDP)?</a></li>
            <li><a href="">How do I open a CDP?</a></li>
            <li><a href="">How do create a Loan?</a></li>
            <li><a href="">How can I free ETH?</a></li>
          </ul>
          
          <h3 className="typo-h3 typo-white">Most asked questions</h3>
          <ul className="typo-cl expandable">
            <li><a href="">How does the Avatar work?</a></li>
            <li><a href="">Why are there two diffrent SAI Coins?</a></li>
            <li><a href="">Why are there two diffrent SAI Coins?</a></li>
          </ul>
          
        </div>
        <div className="col col-2 col-extra-padding">
          <h2 className="typo-h2 ">Videos</h2>
          
          <h3 className="typo-h3 typo-white">First steps</h3>
          <ul className="typo-cl expandable">
            <li><a href="">What is a Colleteral Dept Position (CDP)?</a></li>
            <li><a href="">How do I open a CDP?</a></li>
            <li><a href="">How do create a Loan?</a></li>
            <li><a href="">How can I free ETH?</a></li>
          </ul>
          
        </div>
      </div>
    </div>
  )
}

export default Help;
