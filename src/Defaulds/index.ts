export interface IParams {
    snipper: {
        keys: 'autoFetchLastPair' | 'dex' | 'pair' | 'pair' | 'mode' | 'dataDisplay' | 'inPosition' | 'takeProfit'
        | 'lasBuyPrice' | 'lastSellPrice' | 'lastBuyTime' | 'takeProfitPercentage'
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
        takeProfitPercentage: 10
    }
}