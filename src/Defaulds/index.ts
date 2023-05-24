import { SHARED_WALLET as SABI } from "../Ethereum/ABIs/index.ts"

export interface IArbitrade {
    setparams(key: IParams['arbitrade']['keys'], val: any): void
}

export interface IArbitradeRouteBuilder {
    amount: number,
    dex: any
    dexId: number
    onRemove(dexId: number): void
    onShowDexes(old: (state: boolean) => boolean): void
    onShowTokens(old: (state: boolean) => boolean): void
    setParams: IArbitrade['setparams']
}

export interface ITokenInfo {
    logoURI: string
    address: string
    name: string
    symbol: string
    decimals: number
}

export interface IDex {
    ROUTER: string
    FACTORY: string
    ICON: string
    NAME: string
    SYMBOL: string
    paths: [ITokenInfo]
    output: any
}

export interface IParams {
    snipper: {
        keys: 'autoFetchLastPair' | 'dex' | 'pair' | 'pair' | 'mode' | 'dataDisplay' | 'inPosition' | 'takeProfit'
        | 'lasBuyPrice' | 'lastSellPrice' | 'lastBuyTime' | 'takeProfitPercentage' | 'pushNotificationEnabled'
        autoFetchLastPair: boolean
        pair: any
        dex: string
        mode: 'mini' | 'full' | 'small',
        dataDisplay: 'variants' | 'transactions' | 'pool'
        inPosition: boolean
        takeProfit: boolean
        takeProfitPercentage: number,
        autoBuy: boolean
        lasBuyPrice: number
        lastSellPrice: number
        lastBuyTime: number
        pushNotificationEnabled: boolean
    }

    arbitrade: {
        keys: 'dexes' | 'currentDexId' | 'amountIn' | 'settings'
        currentDexId: number
        amountIn: number
        dexes?: [IDex]
        settings?: {
            auto?: boolean
        }
    }
}

export const Params: IParams = {
    snipper: {
        keys: 'dex',
        autoFetchLastPair: false,
        pair: '',
        dex: 'pancakeswap',
        mode: 'mini',
        dataDisplay: 'variants',
        inPosition: false,
        takeProfit: false,
        autoBuy: false,
        lasBuyPrice: 0,
        lastSellPrice: 0,
        lastBuyTime: 0,
        takeProfitPercentage: 10,
        pushNotificationEnabled: false
    },
    arbitrade: {
        keys: 'dexes',
        currentDexId: 0,
        amountIn: 1,
        dexes: [] as any
    }
}

export interface IContractRead {
    functionName: string,
    abi: typeof SABI,
    address: string | any
    args?: any
}