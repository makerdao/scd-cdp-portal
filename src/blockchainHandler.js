import web3 from './web3';
import Promise from 'bluebird';

// const settings = require('./settings');
const promisify = Promise.promisify;
const schema = {};

schema.tub = require('./abi/saitub');
schema.top = require('./abi/saitop');
schema.tap = require('./abi/saitap');
schema.vox = require('./abi/saivox');
schema.proxyregistry = require('./abi/proxyregistry');
schema.dsproxy = require('./abi/dsproxy');
schema.dsethtoken = require('./abi/dsethtoken');
schema.dstoken = require('./abi/dstoken');
schema.dsvalue = require('./abi/dsvalue');

export const objects = {
}

export const getAccounts = () => {
  return promisify(web3.eth.getAccounts)();
}

export const loadObject = (type, address, label = null) => {
  const object = web3.eth.contract(schema[type].abi).at(address);
  if (label) {
    objects[label] = object;
  }
  return object;
}

export const setDefaultAccount = account => {
  web3.eth.defaultAccount = account;
}

export const getDefaultAccount = () => {
  return typeof web3.eth.defaultAccount !== 'undefined' ? web3.eth.defaultAccount : null;
}

export const setDefaultAccountByIndex = index => {
  return new Promise(async (resolve, reject) => {
    try {
      const accounts = await getAccounts();
      const address = typeof accounts[index] !== 'undefined' ? accounts[index] : null;
      if (address) {
        console.log(`Address ${address} loaded`);
      }
      web3.eth.defaultAccount = address;
      resolve(true);
    } catch (e) {
      console.log(e);
      resolve(false);
    }
  });
}

export const getNetwork = () => {
  return promisify(web3.version.getNetwork)();
}

export const getGasPrice = () => {
  return promisify(web3.eth.getGasPrice)();
}

export const estimateGas = (to, data, value, from) => {
  return promisify(web3.eth.estimateGas)({to, data, value, from});
}

export const getTransaction = tx => {
  return promisify(web3.eth.getTransaction)(tx);
}

export const getTransactionReceipt = tx => {
  return promisify(web3.eth.getTransactionReceipt)(tx);
}

export const getTransactionCount = address => {
  return promisify(web3.eth.getTransactionCount)(address, 'pending');
}

export const getNode = () => {
  return promisify(web3.version.getNode)();
}

export const getBlock = block => {
  return promisify(web3.eth.getBlock)(block);
}

export const setFilter = (fromBlock, address) => {
  return promisify(web3.eth.filter)({fromBlock, address});
}

export const resetFilters = bool => {
  web3.reset(bool);
}

export const getProviderUseLogs = () => {
  return web3.useLogs;
}

export const getProviderName = () => {
  return web3.currentProvider.name;
}

export const getEthBalanceOf = addr => {
  return promisify(web3.eth.getBalance)(addr);
}

export const getTokenBalanceOf = (token, addr) => {
  return promisify(objects[token].balanceOf)(addr);
}

export const getTokenAllowance = (token, from, to) => {
  return promisify(objects[token].allowance.call)(from, to);
}

export const getTokenTrusted = (token, from, to) => {
  return promisify(objects[token].allowance.call)(from, to)
        .then((result) => result.eq(web3.toBigNumber(2).pow(256).minus(1)));
}

export const tokenApprove = (token, dst, gasPrice) => {
  return promisify(objects[token].approve)(dst, -1, {gasPrice});
}

/*
   On the contract side, there is a mapping (address) -> []DsProxy
   A given address can have multiple proxies. Since lists cannot be
   iterated, the way to access a give element is access it by index
 */
export const getProxy = (account, proxyIndex) => {
  return promisify(objects.proxyRegistry.proxies)(account, proxyIndex);
}

export const getProxiesCount = account => {
  return promisify(objects.proxyRegistry.proxiesCount)(account);
}

export const getProxyAddress = account => {
  if (!account) return null;
  return getProxiesCount(account).then(async r => {
    if (r.gt(0)) {
      for (let i = r.toNumber() - 1; i >= 0; i--) {
        const proxyAddr = await getProxy(account, i);
        if (await getProxyOwner(proxyAddr) === account) {
          return proxyAddr;
        }
      }
    }
    return null;
  });
}

export const getProxyOwner = proxy => {
  return promisify(loadObject('dsproxy', proxy).owner)();
}

export const proxyExecute = (proxyAddr, targetAddr, calldata, gasPrice, value = 0) => {
  const proxyExecuteCall = loadObject('dsproxy', proxyAddr).execute['address,bytes'];
  return promisify(proxyExecuteCall)(targetAddr,calldata, {value, gasPrice});
}

export const getContractAddr = (contractFrom, contractName) => {
  return new Promise((resolve, reject) => {
    objects[contractFrom][contractName].call((e, r) => {
      if (!e) {
        if (schema[contractName]) {
          loadObject(contractName, r, contractName);
        }
        resolve(r);
      } else {
        reject(e);
      }
    });
  });
}

export const getAllowance = (token, srcAddr, dstAddr) => {
  return new Promise((resolve, reject) => {
    objects[token].allowance.call(srcAddr, dstAddr, (e, r) => {
      if (!e) {
        resolve(r);
      } else {
        reject(e);
      }
    });
  });
}

export const transferETH = (to, value) => {
  return promisify(web3.eth.sendTransaction)({ to, value });
}

export const stopProvider = () => {
  web3.stop();
}

export const setHWProvider = (device, network, path, accountsOffset = 0, accountsLength = 1) => {
  return web3.setHWProvider(device, network, path, accountsOffset = 0, accountsLength = 1);
}

export const setWebClientProvider = () => {
  return web3.setWebClientProvider();
}
