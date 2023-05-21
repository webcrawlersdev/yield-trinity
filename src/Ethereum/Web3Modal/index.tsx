import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal as Web3Modal0, useWeb3Modal } from '@web3modal/react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon, bscTestnet, bsc } from 'wagmi/chains'

export default function ({ children }: { children: React.ReactNode }) {

    const chains = [bscTestnet, polygon, bsc] //arbitrum, mainnet, polygon,
    const projectId = (process.env.REACT_APP_WAGMI_APP_ID) as any

    const { provider } = configureChains(chains,
        [w3mProvider({ projectId })],
    )

    const wagmiClient = createClient({
        autoConnect: true,
        connectors: [
            ...w3mConnectors({ projectId, version: 2, chains }),
        ],
        provider,
    })

    const ethereumClient = new EthereumClient(wagmiClient, chains)

    return (
        <>
            <WagmiConfig client={wagmiClient} >
                {children}
            </WagmiConfig>
            <Web3Modal0
                projectId={projectId}
                ethereumClient={ethereumClient}
            />
        </>
    )
}