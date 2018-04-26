import React from 'react';
import web3 from './web3';

export const WAD = web3.toBigNumber(web3.toWei(1));

var padLeft = (string, chars, sign) => {
  return new Array(chars - string.length + 1).join(sign ? sign : "0") + string;
};

export const toBytes32 = (x, prefix = true) => {
  let y = web3.toHex(x);
  y = y.replace('0x', '');
  y = padLeft(y, 64);
  if (prefix) y = '0x' + y;
  return y;
}

export const toBytes12 = (x, prefix = true) => {
  let y = web3.toHex(x);
  y = y.replace('0x', '');
  y = padLeft(y, 24);
  if (prefix) y = '0x' + y;
  return y;
}

export const addressToBytes32 = (x, prefix = true) => {
  let y = x.replace('0x', '');
  y = padLeft(y, 64);
  if (prefix) y = '0x' + y;
  return y;
}

export const formatNumber = (number, decimals = false, isWei = true) => {
  web3.BigNumber.config({ ROUNDING_MODE: 4 });

  let object = toBigNumber(number);

  if (isWei) object = web3.fromWei(object.round(0));

  if (decimals) {
    const d = toBigNumber(10).pow(decimals);
    object = object.mul(d).trunc().div(d).toFixed(decimals);
  } else {
    object = object.valueOf();
  }

  const parts = object.toString().split('.');
  return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (parts[1] ? `.${parts[1]}` : '');
}

export const formatDate = timestamp => {
  const date = new Date(timestamp * 1000);
  return `${date.toDateString()} ${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}`;
}

const addZero = value => {
  return value > 9 ? value: `0${value}`;
}

export const fromRaytoWad = x => {
  const y = toBigNumber(x).div(toBigNumber(10).pow(9))
  return y;
}

export const copyToClipboard = e => {
  const value = e.target.title.replace(',', '');
  var aux = document.createElement("input");
  aux.setAttribute('value', value);
  document.body.appendChild(aux);
  aux.select();
  document.execCommand("copy");
  document.body.removeChild(aux);
  const div = document.createElement("div");
  div.innerHTML = "Copied to clipboard";
  div.style.position = 'absolute';
  div.style.fontSize = '10px';
  div.style.border = '1px solid #D2D2D2';
  div.style.color = '#555';
  div.style.padding = '2px';
  div.style.background = '#FFF';
  div.style.marginTop = '5px';
  e.target.appendChild(div);
  const parent = e.target;
  setTimeout(() => parent.removeChild(div), 1000);
}

export const printNumber = number => {
  return <span className="printedNumber" onClick={ copyToClipboard } title={ formatNumber(number, 18) }>{ formatNumber(number, 3) }</span>
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
  return `https://${ network !== 'main' ? `${network}.` : '' }etherscan.io`;
}

export const etherscanAddress = (network, text, address) => {
  return <a href={ `${etherscanUrl(network)}/address/${address}` } target="_blank" rel="noopener noreferrer">{ text }</a>
}

export const etherscanTx = (network, text, tx) => {
  return <a href={ `${etherscanUrl(network)}/tx/${tx}` } target="_blank" rel="noopener noreferrer">{ text }</a>
}

export const etherscanToken = (network, text, token, holder = false) => {
  return <a href={ `${etherscanUrl(network)}/token/${token}${holder ? `?a=${holder}` : ''}` } target="_blank" rel="noopener noreferrer">{ text }</a>
}

export const methodSig = method => {
  return web3.sha3(method).substring(0, 10)
}

export const min = (num1, num2) => {
  return web3.BigNumber.min(num1, num2);
}

export const {toBigNumber , toWei, fromWei, isAddress, toAscii, toHex, toChecksumAddress} = web3;
