
import React from "react";
import {inject, observer} from "mobx-react";

import {getWebClientProviderName} from "../blockchainHandler";

class WalletClientSelector extends React.Component {
  render() {
    return (
      <div className="frame no-account">
        <div className="heading">
          <h2>Connect a Wallet</h2>
        </div>
        <section className="content">
          <div className="helper-text no-wrap">Get started by connecting one of the wallets below</div>
          <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.setWeb3WebClient() } } className="web-wallet">
          {
            getWebClientProviderName() ?
            <React.Fragment>
              <svg width="16" height="15" viewBox="0 0 16 15" xmlns="http://www.w3.org/2000/svg">
                <path d="m.80977778 0-.80977778 2.41601058.52977778 2.5629545-.34311111.26954745.49777777.39034798-.37866666.29749384.504.45976321-.32.21816214.73244444.85642166-1.08444444 3.47076144 1.02044444 3.4914959 3.66222222-.9691087 1.944 1.53615h2.43288889l2.11822227-1.5740129 3.5262222 1.0069716 1.0213333-3.4923974h.0044445l-1.0897778-3.46985994.7315555-.85642166-.32-.21726065.5048889-.45976321-.3786666-.29749384.4977777-.39124947-.3431111-.27044894.5297778-2.56205301-.8106667-2.41601058-5.1004444 1.89945309h-4.1768889zm9.14133333 8.52004327 2.08355559.99435062-2.91555559.85191421zm-5.98577778.99164613 2.08444445-.99164613.832 1.84626483zm2.80088889 2.8379109.36177778-.2109501h1.744l.34044444.2217681.11466667 1.28914h-2.68z" fill="#fff" fillRule="evenodd" transform=""/>
              </svg>
              { this.props.formatClientName(getWebClientProviderName()) }
            </React.Fragment>
            :
            <React.Fragment>
              <svg fill="none" height="22" viewBox="0 0 22 22" width="22" xmlns="http://www.w3.org/2000/svg">
                <g stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="m10 20c5.5228 0 10-4.4772 10-10 0-5.52285-4.4772-10-10-10-5.52285 0-10 4.47715-10 10 0 5.5228 4.47715 10 10 10z" transform="translate(1 1)"/><path d="m0 0h20" transform="translate(1 11)"/><path d="m4 0c2.50128 2.73835 3.92275 6.29203 4 10-.07725 3.708-1.49872 7.2616-4 10-2.50128-2.7384-3.9227528-6.292-4-10 .0772472-3.70797 1.49872-7.26165 4-10z" transform="translate(7 1)"/></g>
              </svg>
              Web Wallet
            </React.Fragment>
          }
          </a>
          <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.showHW("ledger") } }>
            <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.5219 0H8.37065V13.5793H21.9945V3.53305C22 1.62553 20.4357 0 18.5219 0ZM5.25315 0H3.55018C1.63641 0 0 1.55366 0 3.53858V5.23599H5.25315V0ZM0 8.41518H5.25315V13.6512H0V8.41518ZM16.7468 21.9945H18.4498C20.3636 21.9945 22 20.4408 22 18.4559V16.764H16.7468V21.9945ZM8.37065 16.764H13.6238V22H8.37065V16.764ZM0 16.764V18.4614C0 20.3689 1.55875 22 3.55018 22H5.25315V16.764H0Z" fill="white"/>
            </svg>
            Ledger Nano S
          </a>
          <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.showHW("trezor") } }>
            <svg width="17" height="24" viewBox="0 0 17 24" xmlns="http://www.w3.org/2000/svg">
              <path d="m8.51365 0c-3.38835 0-6.13051 2.66445-6.13051 5.95681v2.23256c-1.18986.20931-2.38314.48835-2.38314.85048v11.65115s0 .3223.372687.4751c1.350563.5316 6.663903 2.3588 7.884553 2.7774.15729.0565.20175.0565.24276.0565.05811 0 .08547 0 .24276-.0565 1.22065-.4186 6.54764-2.2458 7.89824-2.7774.3453-.1395.359-.4618.359-.4618v-11.66445c0-.36213-1.1762-.65448-2.3695-.85048v-2.23256c.0171-3.29236-2.7421-5.95681-6.11685-5.95681zm0 2.84717c1.99675 0 3.20375 1.17276 3.20375 3.11298v1.9402c-2.23951-.15286-4.15083-.15286-6.40404 0v-1.9402c0-1.94354 1.20695-3.11298 3.20029-3.11298zm-.01365 7.91033c2.7866 0 5.1253.2093 5.1253.5847v7.2691c0 .113-.0137.1262-.1163.1661-.0991.0432-4.75259 1.6744-4.75259 1.6744s-.18804.0565-.24276.0565c-.05811 0-.24276-.0698-.24276-.0698s-4.65343-1.6312-4.75259-1.6744-.11625-.0565-.11625-.1661v-7.2691c-.02735-.3754 2.31136-.5714 5.09795-.5714z" fill="#fff"/>
            </svg>
            Trezor
          </a>
        </section>
      </div>
    )
  }
}

export default inject("network")(observer(WalletClientSelector));
