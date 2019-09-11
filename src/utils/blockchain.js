// Libraries
import Promise from "bluebird";
import checkIsMobile from "ismobilejs";

// Utils
import web3 from "./web3";
import settings from "../settings";
import BigNumber from 'bignumber.js';

const promisify = Promise.promisify;
const schema = {};

schema.tub = require("../abi/saitub");
schema.top = require("../abi/saitop");
schema.tap = require("../abi/saitap");
schema.vox = require("../abi/saivox");
schema.proxyregistry = require("../abi/proxyregistry");
schema.dsproxy = require("../abi/dsproxy");
schema.dsethtoken = require("../abi/dsethtoken");
schema.dstoken = require("../abi/dstoken");
schema.dsvalue = require("../abi/dsvalue");
schema.saiProxyCreateAndExecute = require("../abi/saiProxyCreateAndExecute");
schema.saivaluesaggregator = require("../abi/saivaluesaggregator");


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
  console.debug(`Address ${account} loaded`);
}

export const getDefaultAccount = () => {
  return typeof web3.eth.defaultAccount !== "undefined" ? web3.eth.defaultAccount : null;
}

export const getDefaultAccountByIndex = index => {
  return new Promise(async (resolve, reject) => {
    try {
      const accounts = await getAccounts();
      resolve(accounts[index]);
    } catch (e) {
      reject(new Error(e));
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
  return promisify(web3.eth.estimateGas)({ to, data, value, from });
}

export const getTransaction = tx => {
  return promisify(web3.eth.getTransaction)(tx);
}

export const getTransactionReceipt = tx => {
  return promisify(web3.eth.getTransactionReceipt)(tx);
}

export const getTransactionCount = address => {
  return promisify(web3.eth.getTransactionCount)(address, "pending");
}

export const getNode = () => {
  return promisify(web3.version.getNode)();
}

export const getBlock = block => {
  return promisify(web3.eth.getBlock)(block);
}

export const getBlockNumber = () => {
  return promisify(web3.eth.getBlockNumber)();
}

export const setFilter = (fromBlock, address) => {
  return promisify(web3.eth.filter)({ fromBlock, address });
}

export const resetFilters = bool => {
  web3.reset(bool);
}

export const getProviderUseLogs = () => {
  return web3.useLogs;
}

export const getCurrentProviderName = () => {
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
  return promisify(objects[token].approve)(dst, -1, { gasPrice });
}

export const getProxy = account => {
  return promisify(objects.proxyRegistry.proxies)(account.toLowerCase()).then(r => r === "0x0000000000000000000000000000000000000000" ? null : getProxyOwner(r).then(r2 => r2 === account.toLowerCase() ? r : null));
}

export const getProxyOwner = proxy => {
  return promisify(loadObject("dsproxy", proxy.toLowerCase()).owner)();
}

export const proxyExecute = (proxyAddr, targetAddr, calldata, gasPrice, value = 0) => {
  const proxyExecuteCall = loadObject("dsproxy", proxyAddr).execute["address,bytes"];
  return promisify(proxyExecuteCall)(targetAddr, calldata, { value, gasPrice });
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

export const allowance = (token, srcAddr, dstAddr) => {
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

export const balanceOf = (token, address) => {
  return new Promise((resolve, reject) => {
    objects[token].balanceOf.call(address, (e, r) => {
      if (!e) {
        resolve(r);
      } else {
        reject(e);
      }
    });
  });
}

export const totalSupply = (token) => {
  return new Promise((resolve, reject) => {
    objects[token].totalSupply.call((e, r) => {
      if (!e) {
        resolve(r);
      } else {
        reject(e);
      }
    });
  });
}

export const sendTransaction = web3.eth.sendTransaction;

export const stopProvider = () => {
  web3.stop();
}

export const setHWProvider = (device, network, path, accountsOffset = 0, accountsLength = 1) => {
  return web3.setHWProvider(device, network, path, accountsOffset = 0, accountsLength);
}

export const setWebClientWeb3 = (specificProvider = null) => {
  return web3.setWebClientWeb3(specificProvider);
}

export const setWebClientProvider = provider => {
  return web3.setWebClientProvider(provider);
}

export const { getWebClientProviderName } = require("./web3");

export const checkNetwork = (actualIsConnected, actualNetwork) => {
  return new Promise((resolve, reject) => {
    let isConnected = null;
    getNode().then(r => {
      isConnected = true;
    }, () => {
      isConnected = false;
    }).then(() => {
      if (actualIsConnected !== isConnected) {
        if (isConnected === true) {
          let network = false;
          getBlock(0).then(res => {
            switch (res.hash) {
              case "0xa3c565fc15c7478862d50ccd6561e3c06b24cc509bf388941c25ea985ce32cb9":
                network = "kovan";
                break;
              case "0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3":
                network = "main";
                break;
              default:
                console.debug("setting network to private");
                console.debug("res.hash:", res.hash);
                network = "private";
            }
            if (actualNetwork !== network) {
              resolve({
                status: 1,
                data: {
                  network: network,
                  isConnected: true,
                  latestBlock: 0
                }
              });
            }
          }, () => {
            if (actualNetwork !== network) {
              resolve({
                status: 1,
                data: {
                  network: network,
                  isConnected: true,
                  latestBlock: 0
                }
              });
            }
          });
        } else {
          resolve({
            status: 0,
            data: {
              isConnected: isConnected,
              network: false,
              latestBlock: 0
            }
          });
        }
      }
    }, e => reject(e));
  });
}


// always returns mainet info
export async function getStabilityFee() {
  const { nodeURL, tub } = settings.chain.main;
  const rawResponse = await fetch(nodeURL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: tub,
          data: "0xddca3f43" // keccak("fee()")
        },
        'latest'
      ],
      id: 1
    })
  });

  const RAY = new BigNumber('1e27');
  const feeHex = (await rawResponse.json()).result;
  const baseBigNumber = new BigNumber(feeHex).div(RAY);
  const secondsPerYear = 60 * 60 * 24 * 365;
  BigNumber.config({ POW_PRECISION: 100 });
  return baseBigNumber
    .pow(secondsPerYear)
    .minus(1)
    .multipliedBy(100);
}

export const isMobileWeb3Wallet = () => {
  return checkIsMobile.any && (window.web3 || window.ethereum);
};
