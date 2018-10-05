// Libraries
import React from "react";
import {inject, observer} from "mobx-react";

const walletIcons = {
  metamask:
    <svg width="16" height="15" viewBox="0 0 16 15" xmlns="http://www.w3.org/2000/svg" className="metamask">
      <path d="m.80977778 0-.80977778 2.41601058.52977778 2.5629545-.34311111.26954745.49777777.39034798-.37866666.29749384.504.45976321-.32.21816214.73244444.85642166-1.08444444 3.47076144 1.02044444 3.4914959 3.66222222-.9691087 1.944 1.53615h2.43288889l2.11822227-1.5740129 3.5262222 1.0069716 1.0213333-3.4923974h.0044445l-1.0897778-3.46985994.7315555-.85642166-.32-.21726065.5048889-.45976321-.3786666-.29749384.4977777-.39124947-.3431111-.27044894.5297778-2.56205301-.8106667-2.41601058-5.1004444 1.89945309h-4.1768889zm9.14133333 8.52004327 2.08355559.99435062-2.91555559.85191421zm-5.98577778.99164613 2.08444445-.99164613.832 1.84626483zm2.80088889 2.8379109.36177778-.2109501h1.744l.34044444.2217681.11466667 1.28914h-2.68z" fill="#fff" fillRule="evenodd" transform=""/>
    </svg>,
  parity:
    <svg width="279" height="275" viewBox="0 0 279 275" xmlns="http://www.w3.org/2000/svg" className="parity">
      <g fill="none" fillRule="evenodd" transform="translate(-2 7)">
        <g stroke="#fff" strokeWidth="15"><path d="m-8.53265977 62.102551 208.40176977-13.4779793" transform="matrix(.88092119 -.473263 .473263 .88092119 -14.967598 51.758121)"/>
          <path d="m4.46734023 83.102551 208.40176977-13.4779793" transform="matrix(.88092119 -.473263 .473263 .88092119 -23.358097 60.411195)"/>
          <path d="m17.4673402 105.102551 208.4017698-13.4779793" transform="matrix(.88092119 -.473263 .473263 .88092119 -32.221858 69.183348)"/>
          <path d="m31.4673402 128.102551 208.4017698-13.477979" transform="matrix(.88092119 -.473263 .473263 .88092119 -41.439804 78.547843)"/>
          <path d="m44.4673402 149.102551 208.4017698-13.477979" transform="matrix(.88092119 -.473263 .473263 .88092119 -49.830302 87.200917)"/>
          <path d="m57.4673448 171.100411 208.4017692-13.47798" transform="matrix(.88092119 -.473263 .473263 .88092119 -58.694063 95.97307)"/>
          <path d="m70.4673448 192.100411 208.4017692-13.47798" transform="matrix(.88092119 -.473263 .473263 .88092119 -67.084562 104.626144)"/>
          <path d="m83.4673448 213.100411 208.4017692-13.47798" transform="matrix(.88092119 -.473263 .473263 .88092119 -75.47506 113.279218)"/>
        </g>
        <g fill="#fff" fillRule="nonzero">
          <path d="m73 87h135.961579v34.814562h-135.961579z"/>
          <path d="m73 145h135.961579v34.814562h-135.961579z"/>
        </g>
      </g>
    </svg>,
  mist:
    <svg width="12" height="18" viewBox="0 0 12 18" xmlns="http://www.w3.org/2000/svg" className="mist">
      <g fill="#fff" transform="">
        <path d="m5.80571353 0-.121503.40630925v11.79015365l.121503.1193266 5.56270757-3.23499153z"/>
        <path d="m5.68421053 0-5.68421053 9.08076643 5.68421053 3.23502307v-5.72256799z"/>
        <path d="m5.75328255 13.5985616-.06907202.0806987v4.1273572l.06907202.1933825 5.61513855-7.5789474z"/>
        <path d="m5.68421053 18v-4.4014384l-5.68421053-3.177509z"/>
        <path d="m5.68421053 12.3157895 5.68421057-3.2133023-5.68421057-2.47090825z"/>
        <path d="m0 9.1024872 5.68421053 3.2133023v-5.68421055z"/>
      </g>
    </svg>
};

@inject("network")
@observer
class WalletClientSelector extends React.Component {
  render() {
    return (
      <div className="frame no-account">
        <div className="heading">
          <div className="back-arrow" onClick={ e => { this.props.network.downloadClient = false } }>
            <svg width="10" height="15" viewBox="0 0 10 15" xmlns="http://www.w3.org/2000/svg">
              <path d="m6.97569475 14.7465148c-.1771738-.0949145-1.76189501-1.5945642-3.533633-3.3315002-3.54347599-3.45488909-3.60253392-3.54031217-3.3564592-4.35657717.10827288-.33220088.71853819-.97761972 3.39583116-3.57827799 1.79142397-1.7559189 3.40567414-3.25556856 3.59269093-3.34099164 1.19100165-.54101285 2.52964813.58847012 2.12608559 1.78439326-.0885869.25626925-.86618302 1.08202571-2.72650791 2.91387624-1.42723339 1.39524367-2.59854906 2.58167536-2.59854906 2.62913263 0 .03796581 1.17131567 1.2243975 2.59854906 2.62913267 1.8504819 1.8128676 2.63792101 2.6481155 2.72650791 2.9043847.41340553 1.2149061-1.11225774 2.4203207-2.22451548 1.7464275z" fill="#fff" transform="matrix(1 0 0 -1 0 15)"/>
            </svg>
          </div>
          <h2>Get a Wallet</h2>
        </div>
        <section className="content">
        <div className="helper-text no-wrap">Select a web wallet to see more information</div>
          <a className="web-wallet" href="https://metamask.io/" target="_blank" rel="noopener noreferrer">
            <div className="provider-icon">{ walletIcons["metamask"] }</div>
            MetaMask
          </a>
          <a className="web-wallet" href="https://www.parity.io/" target="_blank" rel="noopener noreferrer">
            <div className="provider-icon">{ walletIcons["parity"] }</div>
            Parity
          </a>
          <a className="web-wallet" href="https://github.com/ethereum/mist/releases" target="_blank" rel="noopener noreferrer">
            <div className="provider-icon">{ walletIcons["mist"] }</div>
            Mist
          </a>
        </section>
      </div>
    )
  }
}

export default WalletClientSelector;
