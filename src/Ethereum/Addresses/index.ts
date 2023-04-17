
const BSC_TESTNET = {
    SHARED_WALLET: "0xE66B70549FDc0278877E91D007E33d5b6A32b682",
    PRICE_ORACLEA: "0x70916D2Ee5F0696161Be68795792bAF1FCbB0671",
    WETH_ADDRESSA: "0xae13d989dac2f0debff460ac112a837c89baa7cd"
}

export const useADDR = (chainID: number | undefined): typeof BSC_TESTNET   => {
    if (chainID === 67) return BSC_TESTNET
    return BSC_TESTNET
}