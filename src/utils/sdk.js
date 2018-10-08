export const wipeDai = async (cdp, amount, useOtc) => {
  const result = await cdp.wipeDai(amount, useOtc);
  console.debug('SDK: wipeDai() result:', result);
}

export const lockEth = async (cdp, amount) => {
  const result = await cdp.lockEth(amount);
  console.debug('SDK: lockEth() result:', result);
}

export const freeEth = async (cdp, amount) => {
  const result = await cdp.freeEth(amount);
  console.debug('SDK: freeEth() result:', result);
}

export const drawDai = async (cdp, amount) => {
  const result = await cdp.drawDai(amount);
  console.debug('SDK: drawDai() result:', result);
}

export const setAllowance = async (token, allow, spender) => {
  console.debug(`SDK: setAllowance(${token},${allow},${spender})`);
  allow ?
    await window.maker.service('allowance').requireAllowance(token, spender) :
    await window.maker.service('allowance').removeAllowance(token, spender);
}
