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
            if (valz.length <= 4) return valz
            return '...' + valz.slice(-4)
        case "middle":
            return valz.slice(0, 3) + '...' + valz.slice(-3)
        case "right":
            if (valz.length <= 4) return valz
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
export const priceDifference = (val: string | number, val2: string | number): { subtract: any, percentage: any } => {
    const oldp = Number(val)
    const newp = Number(val2)
    const subtract = oldp - newp;
    const addition = (oldp + newp) / 2
    const division = subtract / addition
    const percentage = (division * 100).toFixed(2)
    return { subtract, percentage }
}

export const percentageof = (perc: number | string, num: number | string) => {
    const percent = Number(perc) / 100
    const final = Number(num) * percent
    return final
}

export const wait = async (seconds?: number) => {
    return new Promise((resolved) => setTimeout(() => resolved('continue'), seconds || 1000))
}