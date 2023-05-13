import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon, bscTestnet, bsc } from 'wagmi/chains'

const chains = [bscTestnet] //arbitrum, mainnet, polygon,
const projectId = '392fab7e968f534cfc3980b87f8d682f'

const { provider } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiClient = createClient({
    autoConnect: true,
    connectors: w3mConnectors({ projectId, version: 2, chains }),
    provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)

export default function ({ children }: { children: React.ReactNode }) {
    return (
        <>
            <WagmiConfig client={wagmiClient}>
                {children}
            </WagmiConfig>
            <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
        </>
    )
}