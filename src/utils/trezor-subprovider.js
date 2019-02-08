//@flow
import HookedWalletSubprovider from "web3-provider-engine/dist/es5/subproviders/hooked-wallet";
import EthereumTx from "ethereumjs-tx";
import TrezorConnect from 'trezor-connect';

const allowedHdPaths = ["44'/1'", "44'/60'", "44'/61'"];

function makeError(msg, id) {
  const err = new Error(msg);
  // $FlowFixMe
  err.id = id;
  return err;
}

function obtainPathComponentsFromDerivationPath(derivationPath) {
  // check if derivation path follows 44'/60'/x'/n pattern
  const regExp = /^(44'\/(?:1|60|61)'\/\d+'\/\d+?\/)(\d+)$/;
  const matchResult = regExp.exec(derivationPath);
  if (matchResult === null) {
    throw makeError("To get multiple accounts your derivation path must follow pattern 44'/60|61'/x'/n ", "InvalidDerivationPath");
  }
  return { basePath: matchResult[1], index: parseInt(matchResult[2], 10) };
}

/**
 */
type SubproviderOptions = {
  // refer to https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
  networkId: number,
  // derivation path
  path?: string,
  // number of accounts to derivate
  accountsLength?: number,
  // offset index to use to start derivating the accounts
  accountsOffset?: number
};

const defaultOptions = {
  networkId: 1, // mainnet
  path: "44'/60'/0'/0/0", // trezor default derivation path
  accountsLength: 1,
  accountsOffset: 0
};

/**
 * Create a HookedWalletSubprovider for Trezor devices.
 */
export default function createTrezorSubprovider(
  options?: SubproviderOptions
): HookedWalletSubprovider {
  const { networkId, path, accountsLength, accountsOffset } = {
    ...defaultOptions,
    ...options
  };
  if (!allowedHdPaths.some(hdPref => path.startsWith(hdPref))) {
    throw makeError(`Trezor derivation path allowed are ${allowedHdPaths.join(", ")}. ${path} is not supported`, "InvalidDerivationPath");
  }

  const pathComponents = obtainPathComponentsFromDerivationPath(path);

  const addressToPathMap = {};

  let alreadyOpenTrezorModal = false;

  async function getAccounts() {
    try {
      if (!alreadyOpenTrezorModal) {
        alreadyOpenTrezorModal = true;
        const addresses = {};

        const accountsBundle = [];
        for (let i = accountsOffset; i < accountsOffset + accountsLength; i++){
          const path = pathComponents.basePath + (pathComponents.index + i).toString();
          accountsBundle.push({ path: 'm/'+path, showOnTrezor: false });
        }
        const addressData = await TrezorConnect.ethereumGetAddress({
            bundle: accountsBundle
        });
        //throw on !addressData.success
        const addressDataArray = addressData.payload;
        for (let i = 0; i < addressDataArray.length; i++){
          const path = addressDataArray[i].serializedPath;
          const address = addressDataArray[i].address;
          addresses[path] = address;
          addressToPathMap[address.toLowerCase()] = path;
        }
        return addresses;
      } else {
        return Object.keys(addressToPathMap).reduce((obj, key) => {
          obj[addressToPathMap[key]] = key;
          return obj;
        }, {});
      }
    } catch(e) {
      throw makeError(e);
    } finally {
    }
  }

  function trezorSignMessage(path, data) {
    return new Promise((resolve, reject) => {
      TrezorConnect.ethereumSignMessage(
        path,
        data,
        result => {
          if (result.success) {
            resolve(result);
          } else {
            reject(new Error(result.error));
          }
        }
      )
    });
  }

  async function signPersonalMessage(msgData) {
    const path = addressToPathMap[msgData.from.toLowerCase()];
    if (!path) throw new Error(`address unknown '${msgData.from}'`);
    try {
      const result = await trezorSignMessage(path, msgData.data);
      return `0x${result.signature}`;
    } catch (e) {
      throw makeError(e);
    }
  }

  function trezorSignTransaction(path, txData) {
    return TrezorConnect.ethereumSignTransaction({
      path: path,
      transaction: {
        nonce: txData.nonce,
        gasPrice: txData.gasPrice,
        gasLimit: txData.gas,
        to: txData.to,
        value: txData.value ? txData.value : "",
        data: txData.data ? txData.data : "",
        chainId: parseInt(networkId, 10),
      }
    });
  }

  async function signTransaction(txData) {
    const path = addressToPathMap[txData.from.toLowerCase()];
    if (!path) throw new Error(`address unknown '${txData.from}'`);
    try {
      const tx = new EthereumTx(txData);
      const resultObj = await trezorSignTransaction(path, txData);
      //if !result.success throw
      const result = resultObj.payload;
      tx.v = result.v;
      tx.r = result.r;
      tx.s = result.s;
      // EIP155: v should be chain_id * 2 + {35, 36}
      const signedChainId = Math.floor((tx.v[0] - 35) / 2);
      const validChainId = networkId & 0xff; // FIXME this is to fixed a current workaround that app don't support > 0xff
      if (signedChainId !== validChainId) {
        throw makeError(`Invalid networkId signature returned. Expected: ${networkId}, Got: ${signedChainId}`, "InvalidNetworkId");
      }
      return `0x${tx.serialize().toString("hex")}`;
    } catch (e) {
      throw makeError(e);
    }
  }

  const subprovider = new HookedWalletSubprovider({
    getAccounts: callback => {
      getAccounts()
        .then(res => callback(null, Object.values(res)))
        .catch(err => callback(err, null));
    },
    signPersonalMessage: (txData, callback) => {
      signPersonalMessage(txData)
        .then(res => callback(null, res))
        .catch(err => callback(err, null));
    },
    signTransaction: (txData, callback) => {
      signTransaction(txData)
        .then(res => callback(null, res))
        .catch(err => callback(err, null));
    }
  });

  return subprovider;
}
