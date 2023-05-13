import { ChevronRightRounded, ChevronLeftRounded } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useLocalStorage } from "usehooks-ts";
import { Params, IParams } from "../../../Defaulds";
import { useEffect, useState } from "react";
import { usePrepareContractWrite, useNetwork, useContractWrite, useAccount } from "wagmi";
import { PRICE_ORACLE } from "../../../Ethereum/ABIs/index.ts"
import { useADDR } from "../../../Ethereum/Addresses";
import { toWei } from "../../../Helpers";
import { Web3Button } from "@web3modal/react";
import { motion } from 'framer-motion'
import { ethers } from "ethers";

export interface ITranactionBuillder {
    _paths: string[]
    _pathIndex: number[]
    _routes: string[]
    _inputes: number[]
    _minOutputs: number[]
    _deadline: number
}

export default function Summary() {

    const [params, storeParams] = useLocalStorage<IParams>('@Params', Params)
    const [Transaction, setTransaction] = useState<ITranactionBuillder>()
    const { isConnected, address, } = useAccount()

    const { chain } = useNetwork()
    const ADDR = useADDR(chain?.id);

    const Builder = {
        _paths: [], _pathIndex: [], _routes: [], _inputes: [], _minOutputs: [], _deadline: 100,
    } as ITranactionBuillder

    const Transactable = params?.arbitrade?.dexes?.map((dex, index: number) => {
        Builder['_paths'].push(...(dex?.paths?.map(path => path?.address) || []))
        Builder['_pathIndex'].push(index)
        Builder['_routes'].push(dex.ROUTER)
        Builder['_inputes'].push(toWei(index === 0 ? params?.arbitrade?.amountIn : params?.arbitrade?.dexes?.[index - 1]?.output) as number)
        Builder['_minOutputs'].push(toWei(params?.arbitrade?.dexes?.[index]?.output) as number)
        Builder['_deadline'] = Date.now() + 240
        return Builder
    })

    const { config, error: swapError, isError: isErrorPWRITE } = usePrepareContractWrite({
        functionName: 'multiPathSwap',
        abi: PRICE_ORACLE,
        address: ADDR['PRICE_ORACLEA'],
        args: (Object.values(Transactable?.[0] || {})),
        overrides: {
            gasLimit: toWei(76) as ethers.BigNumber
            // value: toUpper(selectedTrade?.tokenInfo?.address) === toUpper(ADDR['WETH_ADDRESSA']) ? toWei(selectedTrade?.tradeAmount) : 0,
        },
        cacheTime: 0,
        enabled: false
    })

    const {
        write: swap,
        data: hasSwapData,
        isLoading: isTransacting,
        isError: swapHasError,
        error: swapE,
        reset: resetSwap
    } = useContractWrite(config)

    useEffect(() => {
        console.log("DONE _ _ _ _ ENOD - - - -")
        console.log(swapError, isErrorPWRITE, swapHasError, swapE, hasSwapData)
    }, [swapError, isErrorPWRITE, swapHasError, swapE, hasSwapData])


    return (
        <div className="arb-summary space-between">
            <ChevronRightRounded />
            <div className="space-between">
                <div className="space-between">

                </div>
                <div className="space-between">
                    <motion.div animate={{ scale: [.75] }}>
                        {isConnected ?
                            <Button
                                disabled
                                onClick={() => swap?.()}
                                className=' dark-button'
                                variant="contained">
                                SEND TRANSACTION
                            </Button> :
                            <Web3Button />
                        }
                    </motion.div>

                    <ChevronLeftRounded />
                </div>
            </div>
        </div>
    )
}