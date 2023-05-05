import { useNetwork } from "wagmi"
import UniswapIcons from '../../Assets/image/Uniswap_Logo.svg.png'
import PancakeSwapIcons from '../../Assets/image/pancakeswap-cake-logo.png'
import { tokensList } from "../TokensList";


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
        PRICE_ORACLEA: "0xbEd5197e4C6Fb8e62cc75Ee3e77F7Ba880cf6b33",
        WETH_ADDRESSA: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
        TOKENS: tokensList[97],
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
                ICON: PancakeSwapIcons,
                NAME: 'pancakeswap',
                SYMBOL: 'CAKE'
            },
        ]
    }
}


export const useADDR = (chainID?: number | undefined) => {
    const { chain } = useNetwork()
    return (ADDRESSES as any)?.[AVAILABLE_CHAINS[chainID as number]] ?? (ADDRESSES as any)?.[(chain as any)?.id] ?? ADDRESSES[97]
}