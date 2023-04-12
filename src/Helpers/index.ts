import { ethers } from 'ethers'


export const precise = (val: string | number, decimals: undefined | number = 2): string => {
    const vals = Number(val).toFixed(decimals)
    return vals
}

export const fmWei = (val: string | number, decimals: undefined | string | number = 18): string => {
    if (!val) return precise(0)
    const vals = ethers.utils.formatUnits(String(val), decimals)
    return vals
}

export const toWei = (val: string | number, decimals: undefined | number = 18): ethers.BigNumber => {
    const vals = ethers.utils.parseUnits(String(val), decimals)
    return vals
} 