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

export const toWei = (val: string | number, decimals: undefined | number = 18): ethers.BigNumber | number => {
    if (!val || !decimals) return ethers.utils.parseUnits(String(0), 18)
    const vals = ethers.utils.parseUnits(String(val), decimals)
    return vals
}

export const toBN = (val: string | number): ethers.BigNumber => {
    const vals = ethers.BigNumber.from(val)
    return vals
}

export const fmtNumCompact = (val: number | string): string => {
    const formatter = Intl.NumberFormat("en", { notation: "compact" });
    return formatter.format(Number(val));
}

export const cut = (val: string | number | unknown, position: "middle" | "left" | "right" | undefined = "middle") => {
    const valz = String(val)
    switch (position) {
        case "left":
            return '...' + valz.slice(-4)
        case "middle":
            return valz.slice(0, 3) + '...' + valz.slice(-3)
        case "right":
            return valz.slice(0, 4) + '...'
    }
}

export const encodeFunctionCall = (funcName: string, abi: any, params: any): any => {
    if (!Boolean(funcName) || !Boolean(abi) || !Boolean(params)) return '0x0'
    let iface = new ethers.utils.Interface(abi);
    const encodedData = iface.encodeFunctionData(funcName, params)
    return encodedData
}

export const isAddress = (val: string) => ethers.utils.isAddress(String(val))
export const toUpper = (val: string) => String(val?.toUpperCase())
export const toLower = (val: string) => String(val?.toLowerCase())
