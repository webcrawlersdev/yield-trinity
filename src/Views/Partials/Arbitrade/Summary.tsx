import { ChevronRightRounded, ChevronLeftRounded, ArrowRight, ExpandCircleDownRounded } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import { useLocalStorage } from "usehooks-ts";
import { Params, IParams, IArbitradeRouteBuilder } from "../../../Defaulds";
import { useEffect, useState } from "react";
import { usePrepareContractWrite, useNetwork, useWaitForTransaction, useContractWrite, useAccount, useContractRead } from "wagmi";
import { PRICE_ORACLE } from "../../../Ethereum/ABIs/index.ts"
import { useADDR } from "../../../Ethereum/Addresses";
import { fmWei, toWei, strEqual, precise, sub } from "../../../Helpers";
import { Web3Button } from "@web3modal/react";
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { Link } from "react-router-dom";
import { ethers } from "ethers";

export interface ITranactionBuillder {
    _paths: string[]
    _pathLengths: number[]
    _routes: string[]
    _inputes: number[]
    _minOutputs: number[]
    _deadline: number
}

export default function Summary(props: { onShowDexes: IArbitradeRouteBuilder['onShowDexes'] }) {

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

    const { config, error: writePrepareError, isError: isWritePrepareError } = usePrepareContractWrite({
        functionName: 'multiPathSwap',
        abi: PRICE_ORACLE,
        address: ADDR['PRICE_ORACLEA'],
        args: (Object.values(Transactable?.[0] || [])),
        overrides: {
            // gasLimit: toWei(0.004, 'gwei') as ethers.BigNumber,
            // gasPrice: toWei(10, 'gwei') as ethers.BigNumber,
            // maxFeePerGas: toWei(20, 'gwei') as ethers.BigNumber,
            // maxPriorityFeePerGas: toWei(25, 'gwei') as ethers.BigNumber,
            value: strEqual(params?.arbitrade?.dexes?.[0]?.paths?.[0]?.symbol?.slice(-3), chain?.nativeCurrency?.symbol?.slice(-3)) ? toWei(params?.arbitrade?.amountIn) : 0
        },
        cacheTime: 0,
        enabled: Boolean(Number(params?.arbitrade?.dexes?.[0]?.paths?.length) > 1 &&
            Number(params?.arbitrade?.dexes?.[params?.arbitrade?.dexes?.length - 1]?.paths?.length) > 1),
        staleTime: 0

    })

    const {
        write: swap,
        data: hasSwapData,
        isLoading: isTransacting,
        isError: swapHasError,
        error: swapE,
        reset: resetSwap,
    } = useContractWrite(config)

    const { data: tokenAllowance } = useContractRead({
        address: params?.arbitrade?.dexes?.[0]?.paths?.[0]?.address as any,
        abi: PRICE_ORACLE,
        functionName: 'allowance',
        args: [address, ADDR['PRICE_ORACLEA']],
        enabled: !strEqual(params?.arbitrade?.dexes?.[0]?.paths?.[0]?.address, ADDR?.WETH_ADDRESSA),
        cacheTime: 0,
        staleTime: 0,
        watch: true,
    })

    const { write: approve, data: approvalData, isLoading: isApproving } = useContractWrite({
        mode: 'recklesslyUnprepared',
        functionName: 'approve',
        abi: PRICE_ORACLE,
        address: params?.arbitrade?.dexes?.[0]?.paths?.[0]?.address as any,
        args: [ADDR['PRICE_ORACLEA'], toWei(5e10)],
    })

    const waitTransaction = useWaitForTransaction({
        hash: approvalData?.hash || hasSwapData?.hash,
        enabled: Boolean(approvalData?.hash || hasSwapData?.hash),
    })

    const hasAllowance = () => {
        if (!strEqual(params?.arbitrade?.dexes?.[0]?.paths?.[0]?.address, ADDR?.WETH_ADDRESSA))
            return Number(fmWei(tokenAllowance as any, params?.arbitrade?.dexes?.[0]?.paths?.[0]?.decimals))
        return 1
    }

    const handleSendTransaction = async () => {
        if (hasAllowance() <= 0)
            return approve()
        swap?.()
    }

    useEffect(() => {
        const TRANSACTING_TOAST_ID = 'TRANSACTING';
        const TRANSACTION_TOAST_ER = "ERROR"

        if (hasAllowance() <= 0 && params?.arbitrade?.dexes?.[0]?.paths?.[0]?.address)
            setButtonText("Approve ".concat(params?.arbitrade?.dexes?.[0]?.paths?.[0]?.symbol as string))
        if (isApproving)
            setButtonText('Approving...'.concat(params?.arbitrade?.dexes?.[0]?.paths?.[0]?.symbol as string))

        if (waitTransaction.isLoading)
            toast.promise(
                hasSwapData?.wait as any || approvalData?.wait as any,
                { error: 'An Error Occured', success: 'Successful', pending: 'Wait, Working...' },
                { toastId: TRANSACTING_TOAST_ID }
            );
        if (isWritePrepareError) {
            toast.warn('This transaction is likely going to fail...', {
                'autoClose': false,
                'position': 'bottom-center',
                toastId: TRANSACTING_TOAST_ID
            })
        }

        return () => {
            setButtonText('Send transaction')
            resetSwap()
        }
    }, [
        tokenAllowance,
        swapHasError,
        swapE,
        isWritePrepareError,
        hasSwapData,
        isApproving,
        params?.arbitrade?.dexes?.[0]?.paths?.[0]?.symbol
    ])

    return (
        <div className="arb-summary space-between" style={{ flexWrap: 'wrap' }}>
            <div className="space-between">
                <Button
                    onClick={() => props?.onShowDexes?.(o => !o)}
                    style={{ margin: 0, flexGrow: 1, fontSize: 12, fontWeight: 400 }}
                    disabled={params?.arbitrade?.dexes?.length as any >= 4}
                    className={`primary-button summary-container`}>
                    {params?.arbitrade?.dexes?.length as any >= 4 ? 'Limited For Account' : 'Select  Dexchange'}
                </Button>
            </div>
            <div className="space-between" style={{ flexWrap: 'wrap' }}>
                <div className="space-between" style={{ flexWrap: 'wrap' }}>
                    <div className="summary-container">
                        <span className="trade-amount">
                            <span className="orangered">Input</span>&nbsp;
                            {precise(params?.arbitrade?.amountIn)}&nbsp;
                            {params?.arbitrade?.dexes?.[0]?.paths?.[0]?.symbol}
                        </span>
                    </div>
                    <ArrowRight />
                    <div className="summary-container">
                        <span className="trade-amount">
                            <span className="green">Expect</span>&nbsp;
                            <span className="orangered">
                                {
                                    params?.arbitrade?.dexes?.[params?.arbitrade?.dexes?.length - 1]?.output ?
                                        precise(sub(
                                            params?.arbitrade?.dexes?.[params?.arbitrade?.dexes?.length - 1]?.output,
                                            params?.arbitrade?.dexes?.[params?.arbitrade?.dexes?.length - 1]?.output * 0.03 / 100)
                                            , 5) : <CircularProgress size={13} color="warning" />
                                }
                            </span>&nbsp;
                            {
                                params?.arbitrade?.dexes?.[params?.arbitrade?.dexes?.length - 1]
                                    ?.paths?.[params?.arbitrade?.dexes?.[params?.arbitrade?.dexes?.length - 1]
                                        ?.paths?.length - 1]?.symbol.concat('+')
                            }
                        </span>
                    </div>
                </div>
                {
                    isWritePrepareError && <div className="error-message  " style={{ flexGrow: 1 }}>
                        TNX May Fail
                        <div className="message">
                            {writePrepareError?.message}
                        </div>
                    </div>
                }
                {isConnected ?
                    <Button
                        style={{ margin: 0, flexGrow: 1, fontSize: 12, fontWeight: 400 }}
                        disabled={waitTransaction?.isLoading || isApproving || isTransacting}
                        onClick={handleSendTransaction}
                        className='primary-button summary-container' >
                        {ButtonText} {waitTransaction?.isLoading || isApproving || isTransacting && <CircularProgress size={13} color="success" />}
                    </Button> :
                    <Web3Button />
                }
            </div>

        </div>
    )
}