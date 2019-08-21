// Libraries
import React from "react";
import jazzicon from "jazzicon";
import checkIsMobile from "ismobilejs";

// Utils
import web3, { getWebClientProviderName } from "./web3";

export const WAD = web3.toBigNumber(web3.toWei(1));

export const BIGGESTUINT256 = web3.toBigNumber(2).pow(256).minus(1);

var padLeft = (string, chars, sign) => {
  return new Array(chars - string.length + 1).join(sign ? sign : "0") + string;
};

export const toBytes32 = (x, prefix = true) => {
  let y = web3.toHex(x);
  y = y.replace("0x", "");
  y = padLeft(y, 64);
  if (prefix) y = "0x" + y;
  return y;
}

export const toBytes12 = (x, prefix = true) => {
  let y = web3.toHex(x);
  y = y.replace("0x", "");
  y = padLeft(y, 24);
  if (prefix) y = "0x" + y;
  return y;
}

export const addressToBytes32 = (x, prefix = true) => {
  let y = x.replace("0x", "");
  y = padLeft(y, 64);
  if (prefix) y = "0x" + y;
  return y;
}

export const formatAmount = amount => amount ? web3.fromWei(toBigNumber(amount).round(0)).valueOf() : '';

export const formatNumber = (number, decimals = false, isWei = true, round = false) => {
  web3.BigNumber.config({
    ROUNDING_MODE: web3.BigNumber.ROUND_HALF_UP,
    FORMAT: {
      decimalSeparator: ".",
      groupSeparator: ",",
      groupSize: 3
    }
  });

  let object = toBigNumber(number);

  if (isWei) object = web3.fromWei(object.round(0));

  // If rounding, use BigNumber's .toFormat() method
  if (round) return decimals ? object.toFormat(decimals) : object.toFormat();

  if (decimals) {
    const d = toBigNumber(10).pow(decimals);
    object = object.mul(d).trunc().div(d).toFixed(decimals);
  } else {
    object = object.valueOf();
  }

  const parts = object.toString().split(".");
  return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? `.${parts[1]}` : "");
}

export const formatDate = timestamp => {
  const date = new Date(timestamp * 1000);
  let string = date.toDateString();
  string = string.slice(4, string.length);
  string = `${string.slice(0, string.length - 5)}, ${date.getFullYear()}`;
  return `${string} at ${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}`;
}

const addZero = value => {
  return value > 9 ? value: `0${value}`;
}

export const fromRaytoWad = x => {
  const y = toBigNumber(x).div(toBigNumber(10).pow(9))
  return y;
}

export const mobileToggle = className => {
  return checkIsMobile.any
    ? className + '-mobile'
    : className
}

export const copyToClipboard = e => {
  const value = e.target.title.replace(/,/g, "");
  var aux = document.createElement("input");
  aux.setAttribute("value", web3.toBigNumber(value).valueOf());
  document.body.appendChild(aux);
  aux.select();
  document.execCommand("copy");
  document.body.removeChild(aux);
  const div = document.createElement("div");
  div.innerHTML = "Copied to clipboard";
  Object.assign(div.style, {
    position: "absolute",
    fontSize: "0.8rem",
    border: "1px solid #D2D2D2",
    color: "#555",
    padding: "2px",
    background: "rgba(255, 255, 255, 0.9)",
    marginTop: "5px",
    borderRadius: "2px",
    zIndex: "1000",
    textAlign: "center",
    lineHeight: "3",
    minWidth: "115px",
    fontWeight: "600",
    letterSpacing: "0.01rem",
    cursor: "pointer"
  });
  e.target.appendChild(div);
  const parent = e.target;
  setTimeout(() => parent.removeChild(div), 1000);
}

export const printNumber = (number, decimalPlaces = 3, round = false) => {
  return <span className="printedNumber" onClick={ copyToClipboard } title={ formatNumber(number, false) }>{ formatNumber(number, decimalPlaces, true, round) }</span>
}

export const truncateAddress = (address, chars = 8) => {
  return `${address.substring(0, chars)}...${address.substring(42 - chars, 42)}`;
}

// Multiply WAD values
export const wmul = (a, b) => {
  return toBigNumber(a).times(b).div(WAD);
}

//Divide WAD values
export const wdiv = (a, b) => {
  return toBigNumber(a).times(WAD).div(b);
}

const etherscanUrl = network => {
  return `https://${ network !== "main" ? `${network}.` : "" }etherscan.io`;
}

export const etherscanAddress = (network, text, address) => {
  return <a href={ `${etherscanUrl(network)}/address/${address}` } target="_blank" rel="noopener noreferrer">{ text }</a>
}

export const etherscanTx = (network, text, tx) => {
  return <a href={ `${etherscanUrl(network)}/tx/${tx}` } target="_blank" rel="noopener noreferrer">{ text }</a>
}

export const etherscanToken = (network, text, token, holder = false) => {
  return <a href={ `${etherscanUrl(network)}/token/${token}${holder ? `?a=${holder}` : ""}` } target="_blank" rel="noopener noreferrer">{ text }</a>
}

export const methodSig = method => {
  return web3.sha3(method).substring(0, 10)
}

export const min = (num1, num2) => {
  return web3.BigNumber.min(num1, num2);
}

export const capitalize = string => {
  return string.replace(/\b[a-z]|\B[A-Z]/g, x => String.fromCharCode(x.charCodeAt(0)^32));
}

export const jsNumberForAddress = address => {
  return parseInt(address.slice(2, 10), 16);
}

export const getJazziconIcon = (address, size) => {
  return <div className="identicon" style={ {width: `${size}px`, height: `${size}px`, overflow: "hidden", borderRadius: "50%" } } dangerouslySetInnerHTML={ {__html: jazzicon(size, jsNumberForAddress(address)).innerHTML} } />
}

export const {toBigNumber , toWei, fromWei, isAddress, toAscii, toHex, toChecksumAddress} = web3;

export const formatClientName = name => {
  switch (name) {
    case "imtoken":
      return "imToken";
    case "ledger":
      return "Ledger Nano S";
    case "alphawallet":
      return "AlphaWallet";
    case "metamask":
      return "MetaMask";
    case "coinbase":
      return "Coinbase Wallet";
    case "walletlink":
      return "Coinbase Wallet";
    case "web":
      let webClientName = getWebClientProviderName();
      return webClientName === "metamask" ? "MetaMask" : capitalize(webClientName);
    default:
      return capitalize(name);
  }
}
