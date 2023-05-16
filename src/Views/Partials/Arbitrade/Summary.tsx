import { ChevronRightRounded, ChevronLeftRounded } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useLocalStorage } from "usehooks-ts";
import { Params, IParams } from "../../../Defaulds";
import { useEffect, useState } from "react";
import { usePrepareContractWrite, useNetwork, useContractWrite, useAccount, useContractRead } from "wagmi";
import { PRICE_ORACLE } from "../../../Ethereum/ABIs/index.ts"
import { useADDR } from "../../../Ethereum/Addresses";
import { fmWei, toUpper, toWei, strEqual } from "../../../Helpers";
import { Web3Button } from "@web3modal/react";
import { motion } from 'framer-motion'
import { ethers } from "ethers";

export interface ITranactionBuillder {
    _paths: string[]
    _pathLengths: number[]
    _routes: string[]
    _inputes: number[]
    _minOutputs: number[]
    _deadline: number
}

export default function Summary() {

    const [params, storeParams] = useLocalStorage<IParams>('@Params', Params)
    const [ButtonText, setButtonText] = useState<string>("Start Transaction")
    const { isConnected, address, } = useAccount()

    const { chain } = useNetwork()
    const ADDR = useADDR(chain?.id);

    const Builder = {
        _paths: [], _pathLengths: [], _routes: [], _inputes: [], _minOutputs: [], _deadline: 100,
    } as ITranactionBuillder

    const Transactable = params?.arbitrade?.dexes?.map((dex, index: number) => {
        Builder['_paths'].push(...(dex?.paths?.map(path => path?.address) || []))
        Builder['_pathLengths'].push(dex?.paths?.length)
        Builder['_routes'].push(dex.ROUTER)
        Builder['_inputes'].push(toWei(index === 0 ? params?.arbitrade?.amountIn : params?.arbitrade?.dexes?.[index - 1]?.output) as number)
        Builder['_minOutputs'].push(toWei(params?.arbitrade?.dexes?.[index]?.output) as number)
        Builder['_deadline'] = 240 // in seconds, contract has the current timestamp
        return Builder
    })

    const { config, error: swapError, isError: isErrorPWRITE } = usePrepareContractWrite({
        functionName: 'multiPathSwap',
        abi: PRICE_ORACLE,
        address: ADDR['PRICE_ORACLEA'],
        args: (Object.values(Transactable?.[0] || [])),
        overrides: {
            gasLimit: toWei(0.005, 'gwei') as ethers.BigNumber,
            gasPrice: toWei(10, 'gwei') as ethers.BigNumber,
            // maxFeePerGas: toWei(20, 'gwei') as ethers.BigNumber,
            // maxPriorityFeePerGas: toWei(25, 'gwei') as ethers.BigNumber,
            value: strEqual(params?.arbitrade?.dexes?.[0]?.paths?.[0]?.symbol?.slice(-3), chain?.nativeCurrency?.symbol?.slice(-3)) ? toWei(params?.arbitrade?.amountIn) : 0
        },
        cacheTime: 0,
        enabled: Boolean(Number(params?.arbitrade?.dexes?.[0]?.paths?.length) > 1 &&
            Number(params?.arbitrade?.dexes?.[params?.arbitrade?.dexes?.length - 1]?.paths?.length) > 1)

    })

    const {
        write: swap,
        data: hasSwapData,
        isLoading: isTransacting,
        isError: swapHasError,
        error: swapE,
        reset: resetSwap
    } = useContractWrite(config)

    const { data: tokenAllowance } = useContractRead({
        address: params?.arbitrade?.dexes?.[0]?.paths?.[0]?.address as any,
        abi: PRICE_ORACLE,
        functionName: 'allowance',
        args: [address, ADDR['PRICE_ORACLEA']],
        enabled: !strEqual(params?.arbitrade?.dexes?.[0]?.paths?.[0]?.address, ADDR?.WETH_ADDRESSA),
        cacheTime: 0,
        watch: true,
    })

    const { write: approve, data: approvalData, isLoading: isApproving } = useContractWrite({
        mode: 'recklesslyUnprepared',
        functionName: 'approve',
        abi: PRICE_ORACLE,
        address: params?.arbitrade?.dexes?.[0]?.paths?.[0]?.address as any,
        args: [ADDR['PRICE_ORACLEA'], toWei(5e10)]
    })


    const hasAllowance = () => {
        if (!strEqual(params?.arbitrade?.dexes?.[0]?.paths?.[0]?.address, ADDR?.WETH_ADDRESSA))
            return Number(fmWei(tokenAllowance as any, params?.arbitrade?.dexes?.[0]?.paths?.[0]?.decimals))
        return 1
    }

    const handleSendTransaction = async () => {
        if (hasAllowance() <= 0)
            return approve()
        console.log(hasSwapData, isErrorPWRITE, swapError, swapE, swapHasError, hasAllowance(),
            params?.arbitrade?.dexes?.[0]?.paths?.[0]?.symbol, chain?.nativeCurrency?.symbol
        )
        swap?.()
    }

    useEffect(() => {
        if (hasAllowance() <= 0)
            setButtonText("Approve ".concat(params?.arbitrade?.dexes?.[0]?.paths?.[0]?.symbol as string))
        if (isApproving)
            setButtonText('Approving...'.concat(params?.arbitrade?.dexes?.[0]?.paths?.[0]?.symbol as string))



        return () => {
            setButtonText('Send transaction')
            // resetSwap()
        }
    }, [
        tokenAllowance,
        swapError,
        isErrorPWRITE,
        swapHasError,
        swapE,
        hasSwapData,
        isApproving,
        params?.arbitrade?.dexes?.[0]?.paths?.[0]?.symbol
    ]
    )

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
                                disabled={isApproving || isTransacting}
                                onClick={handleSendTransaction}
                                className='dark-button'
                                variant="contained">
                                {ButtonText}
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