import { useNetwork } from "wagmi"
import UniswapIcons from '../../Assets/image/Uniswap_Logo.svg.png'


enum NETWORKS {
    AVAX = 43114,
    FANTOM = 250,
    ETH = 1,
    AETH = 42161,
    BSC_TESTNET = 97
}

const AVAILABLE_CHAINS = [NETWORKS.AVAX, NETWORKS.FANTOM, NETWORKS.ETH, NETWORKS.AETH, NETWORKS.BSC_TESTNET];

const ADDRESSES = {
    [97]: {
        SHARED_WALLET: "0xE66B70549FDc0278877E91D007E33d5b6A32b682",
        PRICE_ORACLEA: "0x280e61f997eceE738899674d7071626836ab5E51",
        WETH_ADDRESSA: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
        DEXS: [
            {
                ROUTER: "",
                FACTORY: "",
                ICON: UniswapIcons,
                NAME: 'uniswap',
                SYMBOL: 'UNI'
            },
            {
                ROUTER: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
                FACTORY: "0x6725f303b657a9451d8ba641348b6761a6cc7a17",
                ICON: UniswapIcons,
                NAME: 'pancakeswap',
                SYMBOL: 'CAKE'
            },
            {
                ROUTER: "",
                FACTORY: "",
                ICON: UniswapIcons,
                NAME: 'kyberswap',
                SYMBOL: 'UNI'
            },
        ]
    }
}


export const useADDR = (chainID: number | undefined) => {
    const { chain } = useNetwork()
    return (ADDRESSES as any)?.[AVAILABLE_CHAINS[chainID as number]] ?? (ADDRESSES as any)?.[(chain as any)?.id] ?? ADDRESSES[97]
}