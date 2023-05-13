import { useContractRead, useNetwork } from "wagmi"
import { IContractRead, IDex, IParams, Params } from "../../../Defaulds"
import { useADDR } from "../../../Ethereum/Addresses"
import { PRICE_ORACLE } from "../../../Ethereum/ABIs/index.ts"
import { fmWei, precise, toWei } from "../../../Helpers"
import { useEffect } from "react"
import { useLocalStorage } from "usehooks-ts"
import { CircularProgress } from "@mui/material"

// export const RoutePathOutput = () => {

// }

export default function ArbitrageRoutePath(props: { dex: IDex, dexId: number }) {
    const { dex, dexId } = props
    const { chain } = useNetwork()
    const ADDR = useADDR(chain?.id)
    const [params, storeParams] = useLocalStorage<IParams>('@Params', Params)

    const setParams = (key: IParams['arbitrade']['keys'], val: any) =>
        storeParams(o => o = { ...o, arbitrade: { ...o.arbitrade, [key]: val } })

    const handleOutputUpdateForDex = async (dexId: any, output: any) => {
        const modified = params?.arbitrade?.dexes?.map((dex, index) => {
            if (index === dexId)
                dex['output'] = output
            return dex
        })
        setParams('dexes', modified)
    }

    const target: IContractRead = {
        functionName: "getRouteOutputs",
        abi: PRICE_ORACLE,
        address: ADDR['PRICE_ORACLEA'] as any,
        args: [[dex?.ROUTER], [], toWei(
            dexId === 0 ? params?.arbitrade?.amountIn : params?.arbitrade?.dexes?.[dexId - 1]?.output)
        ]
    }

    dex?.paths?.map((token, index) => {
        const data = target['args'][1] || []
        data?.push(token?.address)
        target['args'][1] = data
        return target
    })

    const { data, error, isLoading } = useContractRead({
        ...target,
        watch: true,
        cacheTime: 0
    })

    useEffect(() => {
        handleOutputUpdateForDex(dexId, fmWei(data as any ?? 0))
    }, [data, error])


    const RoutePath = <div className="trade-path">
        <div className="dex-name">{dex?.NAME}</div>
        <br />
        <div className="trade-paths space-between">
            {
                dex?.paths?.map((path: any, index: number) => {
                    return (
                        <div key={"PATH-DEX-" + Math.random()} className="trade-path-ind">

                            <div className="space-between">
                                <div className="space-between" style={{ width: 'max-content', gap: '.3rem' }}>
                                    <div className="token-icon-wrap">
                                        <img src={path?.logoURI} alt={path?.symbol} className="token-icon" />
                                    </div>
                                    <span className="token-info">{path?.symbol}</span>
                                </div>
                                
                                <span className="trade-amount">
                                    {isLoading ? <CircularProgress size={16} color="warning" />
                                        : (index == 0) &&
                                        precise(
                                            (dexId === 0) ? params?.arbitrade?.amountIn
                                                : params?.arbitrade?.dexes?.[dexId - 1]?.output, 4
                                        )
                                    }
                                    {isLoading ? '' : (index == dex?.paths?.length - 1) && precise(dex?.output, 4)}
                                </span>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    </div>

    return RoutePath
}