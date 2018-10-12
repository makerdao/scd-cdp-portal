export const wipeDai = async (cdp, amount, useOtc) => {
  const result = await cdp.wipeDai(amount, { useOtc });
  console.debug('SDK: wipeDai() result:', result);
}

export const lockEth = async (cdp, amount) => {
  const result = await cdp.lockEth(amount);
  console.debug('SDK: lockEth() result:', result);
}

export const openLockAndDraw = async (amountEth, amountDai, dsProxyAddress) => {
  const cdpService = window.maker.service('cdp');
  const cdp = await cdpService.openProxyCdpLockEthAndDrawDai(amountEth, amountDai, dsProxyAddress);
  console.debug('SDK: openLockAndDraw() result:', cdp);
  return cdp;
}

export const createOpenLockAndDraw = async (amountEth, amountDai) => {
  const cdpService = window.maker.service('cdp');
  const cdp = await cdpService.openProxyCdpLockEthAndDrawDai(amountEth, amountDai);
  console.debug('SDK: createOpenLockAndDraw() result:', cdp);
  return cdp;
}

export const freeEth = async (cdp, amount) => {
  const result = await cdp.freeEth(amount);
  console.debug('SDK: freeEth() result:', result);
}

export const drawDai = async (cdp, amount) => {
  const result = await cdp.drawDai(amount);
  console.debug('SDK: drawDai() result:', result);
}

export const shut = async (cdp, useOtc = false) => {
  const result = await cdp.shut({ useOtc });
  console.debug('SDK: shut() result:', result);
}

export const setAllowance = async (token, allow, spender) => {
  console.debug(`SDK: setAllowance(${token},${allow},${spender})`);
  allow ?
    await window.maker.service('allowance').requireAllowance(token, spender) :
    await window.maker.service('allowance').removeAllowance(token, spender);
}
