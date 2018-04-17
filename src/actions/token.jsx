import * as Blockchain from "../blockchainHandler";
import { toBigNumber, toWei, isAddress } from '../helpers';

export function setUpToken(token) {
  Blockchain.objects.tub[token.replace('dai', 'sai')].call((e, r) => {
    if (!e) {
      this.setState((prevState, props) => {
        const system = {...prevState.system};
        const tok = {...system[token]};
        tok.address = r;
        system[token] = tok;
        return {system};
      }, () => {
        Blockchain.loadObject(token === 'gem' ? 'dsethtoken' : 'dstoken', r, token);
        this.getDataFromToken(token);
        this.setFilterToken(token);
      });
    }
  })
}

export function setFilterToken(token) {
  const filters = ['Transfer', 'Approval'];

  if (token === 'gem') {
    filters.push('Deposit');
    filters.push('Withdrawal');
  } else {
    filters.push('Mint');
    filters.push('Burn');
  }

  for (let i = 0; i < filters.length; i++) {
    const conditions = {};
    if (Blockchain.objects[token][filters[i]]) {
      Blockchain.objects[token][filters[i]](conditions, {fromBlock: 'latest'}, (e, r) => {
        if (!e) {
          this.logTransactionConfirmed(r.transactionHash);
          this.getDataFromToken(token);
        }
      });
    }
  }
}

export function getDataFromToken(token) {
  this.getTotalSupply(token);

  if (token !== 'sin' && isAddress(this.state.network.defaultAccount)) {
    this.getBalanceOf(token, this.state.network.defaultAccount, 'myBalance');
  }
  if (token === 'gem' || token === 'skr' || token === 'sin') {
    this.getBalanceOf(token, this.state.system.tub.address, 'tubBalance');
  }
  if (token === 'gem' || token === 'skr' || token === 'dai' || token === 'sin') {
    this.getBalanceOf(token, this.state.system.tap.address, 'tapBalance');
    this.getBoomBustValues();
  }
  if (token === 'gem' || token === 'skr') {
    this.getParameterFromTub('per', true);
  }
  if (token === 'gov') {
    this.getBalanceOf(token, this.state.system.pit.address, 'pitBalance');
  }
}

export function getTotalSupply(token) {
  Blockchain.objects[token].totalSupply.call((e, r) => {
    if (!e) {
      this.setState((prevState, props) => {
        const system = {...prevState.system};
        const tok = {...system[token]};
        tok.totalSupply = r;
        system[token] = tok;
        return {system};
      }, () => {
        if (token === 'sin') {
          this.calculateSafetyAndDeficit();
        }
      });
    }
  })
}

export function getBalanceOf(token, address, field) {
  Blockchain.objects[token].balanceOf.call(address, (e, r) => {
    if (!e) {
      this.setState((prevState, props) => {
        const system = {...prevState.system};
        const tok = {...system[token]};
        tok[field] = r;
        system[token] = tok;
        return {system};
      }, () => {
        if ((token === 'skr' || token === 'dai') && field === 'tubBalance') {
          this.calculateSafetyAndDeficit();
        }
      });
    }
  })
}

export function checkAllowance(token, callbacks) {
  console.log('checkAllowance', token);
  let promise;
  const valueObj = toBigNumber(2).pow(256).minus(1); // uint(-1)

  promise = Blockchain.getAllowance(token, this.state.network.defaultAccount, this.state.profile.proxy);

  Promise.resolve(promise).then(r => {
    if (r.equals(valueObj)) {
      callbacks.forEach(callback => this.executeCallback(callback));
    } else {
      const tokenName = token.replace('gem', 'weth').replace('gov', 'mkr').replace('skr', 'peth').toUpperCase();
      const id = Math.random();
      const title = `${tokenName}: approve`;
      this.logRequestTransaction(id, title);
      Blockchain.objects[token].approve(this.state.profile.proxy, -1, {}, (e, tx) => this.log(e, tx, id, title, callbacks));
    }
  }, () => {});
}

export function transferToken(token, to, amount) {
  const tokenName = token.replace('gov', 'mkr').toUpperCase();
  const id = Math.random();
  const title = `${tokenName}: transfer ${to} ${amount}`;
  this.logRequestTransaction(id, title);
  const log = (e, tx) => {
    if (!e) {
      this.logPendingTransaction(id, tx, title, [['setUpToken', token]]);
    } else {
      console.log(e);
      this.logTransactionRejected(id, title);
    }
  }
  Blockchain.objects[token].transfer(to, toWei(amount), {}, log);
}
