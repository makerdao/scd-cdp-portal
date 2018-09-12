export const wipeDai = async (dsProxyAddress, cdpId, amount, useOtc) => {
  console.debug(`SDK: wipeDai(${dsProxyAddress},${cdpId},${amount},${useOtc}`);
  const cdp = await window.maker.getCdp(cdpId, dsProxyAddress);
  const result = await cdp.wipeDai(amount, useOtc);
  console.debug('SDK: wipeDai() result:', result);
}

export const lockEth = async (dsProxyAddress, cdpId, amount) => {
  console.debug(`SDK: lockEth(${dsProxyAddress},${cdpId},${amount}`);
  const cdp = await window.maker.getCdp(cdpId, dsProxyAddress);
  const result = await cdp.lockEth(amount);
  console.debug('SDK: lockEth() result:', result);
}

export const freeEth = async (dsProxyAddress, cdpId, amount) => {
  console.debug(`SDK: freeEth(${dsProxyAddress},${cdpId},${amount}`);
  const cdp = await window.maker.getCdp(cdpId, dsProxyAddress);
  const result = await cdp.freeEth(amount);
  console.debug('SDK: freeEth() result:', result);
}

export const drawDai = async (dsProxyAddress, cdpId, amount) => {
  console.debug(`SDK: drawDai(${dsProxyAddress},${cdpId},${amount}`);
  const cdp = await window.maker.getCdp(cdpId, dsProxyAddress);
  const result = await cdp.drawDai(amount);
  console.debug('SDK: drawDai() result:', result);
}

export const setAllowance = async (token, allow, spender) => {
  console.debug(`SDK: setAllowance(${token},${allow},${spender}`);
  allow ?
    await window.maker.service('allowance').requireAllowance(token, spender) :
    await window.maker.service('allowance').removeAllowance(token, spender);
}
