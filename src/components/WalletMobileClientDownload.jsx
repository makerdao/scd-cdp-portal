// Libraries
import React from 'react';
import { inject, observer } from 'mobx-react';
import walletIcons from './WalletIcons'

@inject('network')
@observer
class WalletMobileClientDownload extends React.Component {
  render() {
    return (
      <div className="frame no-account">
        <div className="heading">
          <div
            className="back-arrow"
            onClick={e => {
              this.props.network.downloadClient = false;
            }}
          >
            <svg
              width="10"
              height="15"
              viewBox="0 0 10 15"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m6.97569475 14.7465148c-.1771738-.0949145-1.76189501-1.5945642-3.533633-3.3315002-3.54347599-3.45488909-3.60253392-3.54031217-3.3564592-4.35657717.10827288-.33220088.71853819-.97761972 3.39583116-3.57827799 1.79142397-1.7559189 3.40567414-3.25556856 3.59269093-3.34099164 1.19100165-.54101285 2.52964813.58847012 2.12608559 1.78439326-.0885869.25626925-.86618302 1.08202571-2.72650791 2.91387624-1.42723339 1.39524367-2.59854906 2.58167536-2.59854906 2.62913263 0 .03796581 1.17131567 1.2243975 2.59854906 2.62913267 1.8504819 1.8128676 2.63792101 2.6481155 2.72650791 2.9043847.41340553 1.2149061-1.11225774 2.4203207-2.22451548 1.7464275z"
                fill="#fff"
                transform="matrix(1 0 0 -1 0 15)"
              />
            </svg>
          </div>
          <h2>Get a Mobile Wallet</h2>
        </div>
        <section className="content">
          <div className="helper-text no-wrap">
            Select a mobile wallet to see more information
          </div>
          <a
            className="web-wallet"
            href="https://wallet.coinbase.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="provider-icon">{walletIcons['coinbase']}</div>
            Coinbase
          </a>
          <a
            className="web-wallet"
            href="https://trustwallet.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="provider-icon">{walletIcons['trust']}</div>
            Trust
          </a>
          <a
            className="web-wallet"
            href="https://token.im/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="provider-icon">{walletIcons['imtoken']}</div>
            ImToken
          </a>
        </section>
      </div>
    );
  }
}

export default WalletMobileClientDownload;
