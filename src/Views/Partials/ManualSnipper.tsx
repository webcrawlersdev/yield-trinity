import { Box, Button, CircularProgress, FormControlLabel, Grid, Input, Radio, Switch } from "@mui/material";
import { useWeb3Modal } from "@web3modal/react";
import { ArrowDropDown, ArrowRight, DoubleArrow, Settings, SettingsApplications, Timelapse } from "@mui/icons-material";
import {
    useAccount, useContractRead,
    useContractReads,
    useNetwork,
    useProvider,
    useToken,
    useBalance,
    useContractWrite,
    usePrepareContractWrite
} from "wagmi";
import { useADDR } from "../../Ethereum/Addresses";
import { useEffect, useState } from 'react'
import { cut, fmWei, isAddress, percentageof, precise, priceDifference, toBN, toUpper, toWei } from "../../Helpers";
import { motion } from 'framer-motion'
import { PRICE_ORACLE } from '../../Ethereum/ABIs/index.ts'
import { fmtNumCompact } from "../../Helpers";
import { toast } from 'react-toastify'
import useDecentralizedExchange from "../../Hooks/useDecentralizedExchamge";
import { ISnipperParams } from "../Snipper";
import { useLocalStorage } from "usehooks-ts";
import { Params } from "../../Defaulds";
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { wait } from "@testing-library/user-event/dist/utils";
dayjs.extend(relativeTime)

export default function ManualSnipper(props: ISnipperParams) {
    const { settings, setparams, dexes } = props
    const { isConnected, address, } = useAccount()
    const { chain } = useNetwork()
    const ADDR = useADDR(chain?.id);
    const ProviderInstance = useProvider()
    const [baseTokenBalance, setBaseTokenBalance] = useState<string | number>(0)
    const [routeOutputs, setRouteOutputs] = useState<any>()
    const [selectedPair, setSelectedPair] = useState({ transactionCount: 0 })
    const [buttonText, setButtonText] = useState('Transact')
    const { open, isOpen } = useWeb3Modal()
    const auto = (): boolean => params?.snipper?.autoFetchLastPair
    const [params] = useLocalStorage<typeof Params>('@Params', Params)
    const { dex } = useDecentralizedExchange(params?.snipper?.dex)

    const { data: Pairs } = useContractRead({
        abi: PRICE_ORACLE,
        address: ADDR['PRICE_ORACLEA'],
        args: [params?.snipper?.pair],
        functionName: 'getTokensFromPair',
        watch: true,
    })

    const { data: token0 } = useToken({ address: (Pairs as any)?.[0] })
    const { data: token1 } = useToken({ address: (Pairs as any)?.[1] })
    const [selectedTrade, setSelectedTrade] = useState<any>({ tradeType: 'buy', tradeAmount: precise(Math.random() * 2), tokenInfo: token0 })
    const { data: token0Balance } = useBalance({ address, token: token0?.address, watch: true })
    const { data: token1Balance } = useBalance({ address, token: token1?.address, watch: true })
    const { data: token0InPool } = useBalance({ address: params?.snipper?.pair, token: token0?.address, watch: true })
    const { data: token1InPool } = useBalance({ address: params?.snipper?.pair, token: token1?.address, watch: true })
    const { data: tokenAllowance } = useContractRead({
        address: (selectedTrade.tradeType === 'sell') ? token1?.address : token0?.address,
        abi: PRICE_ORACLE,
        functionName: 'allowance',
        args: [address, ADDR['PRICE_ORACLEA']],
        watch: true,
    })
    const PriceOracleContracts = {
        abi: PRICE_ORACLE, address: ADDR['PRICE_ORACLEA'], functionName: "priceInToken",
        args: [token0?.address, token1?.address, dex.ROUTER, dex.FACTORY],
        watch: true,
        enabled: Boolean(token0?.address && token1?.address)
    }
    const { data: tokenPriceInToken, } = useContractRead(PriceOracleContracts)
    const { data: outputs, isLoading: isFetchingOutput } = useContractReads({
        contracts: [{
            ...PriceOracleContracts,
            functionName: "getRouteOutputs",
            args: [
                [dex.ROUTER],
                (selectedTrade.tradeType === 'sell') ? [token1?.address, token0?.address] : [token0?.address, token1?.address],
                toWei(Number(Number.isNaN(selectedTrade.tradeAmount) ? 0 : selectedTrade.tradeAmount), selectedTrade?.tokenInfo?.decimals)
            ]
        }, {
            ...PriceOracleContracts, functionName: "predictFuturePrices",
            args: [
                [dex.ROUTER],
                (selectedTrade.tradeType === 'sell') ? [token1?.address, token0?.address] : [token0?.address, token1?.address],
                toWei(Number(Number.isNaN(selectedTrade.tradeAmount) ? 0 : selectedTrade.tradeAmount), selectedTrade?.tokenInfo?.decimals)
            ]
        }, {
            ...PriceOracleContracts, functionName: "priceImpacts",
            args: [
                token1?.address, token0?.address,
                [dex.FACTORY],
                toWei(Number(Number.isNaN(selectedTrade.tradeAmount) ? 0 : selectedTrade.tradeAmount), selectedTrade?.tokenInfo?.decimals)
            ],
        }
        ], watch: true, enabled: Boolean(!Number.isNaN(selectedTrade.tradeAmount))
    })

    const { data: lastPair } = useContractRead({
        functionName: 'getLastPair',
        abi: PRICE_ORACLE,
        address: ADDR['PRICE_ORACLEA'],
        watch: true,
        args: [dex?.FACTORY],
        enabled: auto(),
    })

    const { write: approve, data: approvalData, isLoading: isApproving } = useContractWrite({
        mode: 'recklesslyUnprepared',
        functionName: 'approve',
        abi: PRICE_ORACLE,
        address: selectedTrade?.tokenInfo?.address,
        args: [ADDR['PRICE_ORACLEA'],
        toWei(selectedTrade.tradeAmount, selectedTrade?.tokenInfo?.decimals)]
    })

    const { config, error: swapError, isError: isErrorPWRITE } = usePrepareContractWrite({
        functionName: 'swap',
        abi: PRICE_ORACLE,
        address: ADDR['PRICE_ORACLEA'],
        args: [
            (selectedTrade.tradeType === 'sell') ? [token1?.address, token0?.address] : [token0?.address, token1?.address],
            toWei(selectedTrade?.tradeAmount, selectedTrade?.tokenInfo?.decimals),
            toWei(routeOutputs?.RoutOutputs, selectedTrade?.tokenInfo?.decimals),
            dex.ROUTER,
            120
        ],
        overrides: {
            value: toUpper(selectedTrade?.tokenInfo?.address) === toUpper(ADDR['WETH_ADDRESSA']) ? toWei(selectedTrade?.tradeAmount) : 0,
        },
    })

    const { write: swap,
        data: hasSwapData,
        isLoading: isTransacting,
        isError: swapHasError,
        error: swapE,
        reset: resetSwap
    } = useContractWrite(config)

    const handleSwap = async () => {
        if (toUpper(selectedTrade?.tokenInfo?.address) !== toUpper(ADDR['WETH_ADDRESSA']))
            if (selectedTrade?.tokenInfo?.symbol !== chain?.nativeCurrency?.symbol)
                if (Number(fmWei(tokenAllowance as any)) <= 0) {
                    approve?.()
                    toast.warn("Approval snipper to spend your ".concat(selectedTrade?.tokenInfo?.symbol).concat(' on your behalf'))
                    swap?.()
                    return
                }

        if (isErrorPWRITE) toast.error((swapError as any)?.reason, { toastId: "ERROR_TOAST" })
        swap?.()
    }

    useEffect(() => {
        const outPuts = fmWei((outputs as any)?.[0], selectedTrade?.tokenInfo?.decimals)
        const future = fmWei((outputs as any)?.[1], selectedTrade?.tokenInfo?.decimals)
        setRouteOutputs((o: any) => o = {
            ...o,
            RoutOutputs: outPuts,
            FuturePrice: future
        })

        if (auto() && isAddress(lastPair as string))
            setparams('pair', lastPair as string)

    }, [outputs, lastPair, params.snipper.autoFetchLastPair])

    useEffect(() => {
        const TRANSACTING_TOAST_ID = 'TRANSACTING';
        const TRANSACTION_TOAST_ER = "ERROR"

        if (hasSwapData && !swapHasError) {
            toast.promise(
                hasSwapData.wait,
                { error: 'error', success: 'Swap Successful', pending: 'Wait, Swapping...' },
                { toastId: TRANSACTING_TOAST_ID }
            );
            resetSwap()
        }

        if (swapHasError || swapError) {
            swapHasError && toast.error(
                'Transaction Failed: '.concat((swapE as any)?.reason),
                { toastId: TRANSACTING_TOAST_ID }
            );
            resetSwap()
        }

        if (hasSwapData) {
            console.log(params?.snipper);
            (async () => {
                setButtonText('working...')
                await hasSwapData?.wait().then(async () => {
                    if (selectedTrade?.tradeType === 'buy') {
                        setparams('lastSellPrice', 0)
                        await wait(200)
                        setparams('inPosition', true)
                        await wait(200)
                        setparams('lastBuyTime', Date.now())
                        await wait(200)
                        setparams('lasBuyPrice', Number(fmWei(tokenPriceInToken as any, token1?.decimals)))
                    }
                    else {
                        setparams('lasBuyPrice', 0)
                        await wait(200)
                        setparams('lastSellPrice', Number(fmWei(tokenPriceInToken as any, token0?.decimals)))
                        await wait(200)
                        setparams('inPosition', false)
                        await wait(200)
                        setparams('lastBuyTime', 0)
                    }
                    setButtonText('transact')
                })
            })();
        }

        return () => {
            (async () => {
                if (toUpper(selectedTrade?.tokenInfo?.address) !== toUpper(ADDR['WETH_ADDRESSA']))
                    if (Number(fmWei(tokenAllowance as any)) <= 0)
                        setButtonText('Approve')
                    else { setButtonText('Transact') }
                else setButtonText('Transact')
                const baseBalance = await ProviderInstance.getBalance(String(address));
                setBaseTokenBalance(o => o = precise(fmWei(String(baseBalance))));
                const poolTnxCount = await ProviderInstance.getTransactionCount(params?.snipper?.pair);
                setSelectedPair(p => ({ ...p, transactionCount: Number(poolTnxCount) }));
            })();
        }
    }, [tokenPriceInToken, token1, hasSwapData, selectedTrade, swapHasError, swapE, swapError]);

    const DexSelector = <div className="space-between isolated-container" style={{ zIndex: 20 }}>
        <Button
            onClick={() => dexes(o => !o)}
            variant='contained'
            style={{ padding: '.2rem' }}
            className={`primary-button dark-button ${!dex?.NAME && 'error'}`}>
            <img src={dex?.ICON} alt={dex?.SYMBOL} className="icon" />&nbsp;{dex?.NAME ?? `Invalid DEX`}&nbsp;<ArrowDropDown />
        </Button>
    </div>

    const Variants = <motion.div initial={{ x: -100 }} animate={{ x: 0 }} className="info-container">
        <div className="only-two-flexed">
            <div className="two-flexed-inner">

                <div className="table-small">
                    <div className="table-small-inner">
                        <span >PRICE</span>
                        <span>{fmWei(tokenPriceInToken as any, token1?.decimals)}</span>
                        <span>- - -</span>
                    </div>
                    <div className="table-small-inner">
                        <span>FUTURE PRICE</span>
                        <span>
                            {selectedTrade.tradeType === 'sell' ? token1?.symbol : token0?.symbol}
                            /
                            {selectedTrade.tradeType === 'sell' ? token0?.symbol : token1?.symbol}
                        </span>
                        <span>
                            {isFetchingOutput ? <CircularProgress color="inherit" size={10} /> : fmtNumCompact(routeOutputs?.FuturePrice)}
                        </span>
                    </div>
                    <p className="paragraph small-text">
                        Your position
                    </p>
                    <div className="table-small-inner">
                        <span>IN POSITION</span>
                        <span>
                            {params?.snipper?.inPosition ? "Yes" : "No"}
                        </span>
                        <span>
                            {
                                !params?.snipper?.lastBuyTime ? "Not in position"
                                    : dayjs(Date.now()).to(params?.snipper?.lastBuyTime)
                            }
                        </span>
                    </div>
                    <div className="table-small-inner" style={{ opacity: params?.snipper?.lasBuyPrice ? 1 : .2 }}>
                        <span>LAST BUY PRICE</span>
                        <span>
                            {params?.snipper?.lasBuyPrice}
                        </span>
                        <span >- - -</span>
                    </div>
                    <div className="table-small-inner" style={{ opacity: params?.snipper?.takeProfit ? 1 : .2 }}>
                        <span>SELLING PRICE</span>
                        <span>
                            {percentageof(params?.snipper?.takeProfitPercentage+100, params?.snipper?.lasBuyPrice)}
                        </span>
                        <span >
                            {params?.snipper?.takeProfitPercentage}
                        </span>
                    </div>
                    <div className="table-small-inner">
                        <span>POT. PROFIT (now)</span>
                        <span>{precise(Number(fmWei(tokenPriceInToken as any, token1?.decimals)) - params?.snipper?.lasBuyPrice)}</span>
                        <span>
                            {
                                priceDifference(
                                    Number(fmWei(tokenPriceInToken as any, token1?.decimals)) - params?.snipper?.lasBuyPrice,
                                    params?.snipper?.lasBuyPrice
                                ).percentage
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>

    const PoolInfo = <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="info-container">
        <div className="only-two-flexed">
            <div className="two-flexed-inner">
                <div className="table-small">
                    <div className="table-small-inner">
                        <span > {token0InPool?.symbol} IN POOL </span>
                        <span></span>
                        <span>{token0InPool?.formatted}</span>
                    </div>
                    <div className="table-small-inner">
                        <span > {token1InPool?.symbol} IN POOL </span>
                        <span></span>
                        <span>{token1InPool?.formatted}</span>
                    </div>
                    <div className="table-small-inner">
                        <span className="orangered"> Watching... <CircularProgress dir='rtl' color="info" size={10} /></span>
                        <span></span>
                        <span>---</span>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>

    const Transactions = <motion.div initial={{ x: 100 }} animate={{ x: 0 }} className="info-container">
        <div className="only-two-flexed">
            <div className="two-flexed-inner">
                <div className="table-small">
                    <div className="table-small-inner">
                        <span> TOTAL TRANSACTIONS </span>
                        <span></span>
                        <span>{selectedPair?.transactionCount}</span>
                    </div>
                    <div className="table-small-inner">
                        <span className="orangered">MORE DATA </span>
                        <span></span>
                        <span>COMING SOON... </span>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>

    const ExTendedContainer = <div className="expanded-container">
        <Box className="box-navigation">
            <div className="space-between" style={{ width: '100%', }}>
                <div className="space-between">
                    <Button variant='contained' disabled={params?.snipper?.dataDisplay === 'variants'} onClick={() => setparams('dataDisplay', 'variants')} className="box-navigation-btn" >
                        Variants
                    </Button>
                    <Button disabled={params?.snipper?.dataDisplay === 'pool'} onClick={() => setparams('dataDisplay', 'pool')} className="box-navigation-btn" >
                        Pool
                    </Button>
                    <Button disabled={params?.snipper?.dataDisplay === 'transactions'} onClick={() => setparams('dataDisplay', 'transactions')} className="box-navigation-btn"  >
                        Transactions
                    </Button>
                </div>
            </div>
        </Box>

        {!Pairs ? <h3 className="headline-3" style={{ padding: '2rem', textAlign: 'center' }}>NOT ENOUGH DATA</h3> :
            <Box>
                <h3 className="headline-3   space-between" style={{ marginTop: '1rem', marginBottom: 0 }}>
                    {token0?.symbol}/{token1?.symbol}
                    <div className="space-between" style={{ gap: 0 }}>
                        <a target="_blank" className="green" href={`${chain?.blockExplorers?.default?.url}/address/${params?.snipper?.pair}`}>&nbsp;{cut(params?.snipper?.pair)}</a>
                        <ArrowRight />
                    </div>
                </h3>

                {params?.snipper?.dataDisplay === 'variants' && Variants}
                {params?.snipper?.dataDisplay === 'pool' && PoolInfo}
                {params?.snipper?.dataDisplay === 'transactions' && Transactions}
            </Box>
        }
    </div>

    return <Grid className="dash" style={{ borderRadius: 20 }}>
        <Box className={`dash-lin-box relative-container expanable ${params?.snipper?.mode}`}>
            <div className="contained">
                <div className="space-between" style={{ width: '100%', }}>
                    <div className="space-between">
                        <FormControlLabel control={<Switch onChange={() => setparams('autoFetchLastPair', !auto())} checked={auto()} />} label="Auto" />
                        <CircularProgress color="inherit" size={10} />
                    </div>
                    {DexSelector}
                    <Settings className="primary-button" onClick={() => { typeof settings === 'function' && settings(o => !o) }} />
                </div>
                <Box className="box-input-area">
                    <Box className="input-area">
                        <div className="filter-input-wrapper space-between" style={{ width: '100%', marginBlock: '1rem' }}>
                            <input className="input-reading"
                                onChange={(e: any) => setparams('pair', e.target.value)}
                                onFocus={() => setparams('autoFetchLastPair', false)}
                                value={params?.snipper?.pair}
                                placeholder='Pair Address... 0x0...' />
                        </div>

                        <div className="toggle-slide-switch" style={{ width: '100%', marginTop: '1rem', }}>
                            <Button
                                className="secondary-button active-side"
                                variant="contained"
                                style={{ width: '100%' }}
                                disabled={selectedTrade.tradeType === 'buy'}
                                onMouseDown={() => setparams('autoFetchLastPair', false)}
                                onClick={() => setSelectedTrade((t: any) => t = { ...t, tradeType: 'buy', tokenInfo: token0 })}>
                                <Radio checked={selectedTrade.tradeType === 'buy'} />
                                {cut(token0Balance?.symbol, 'right')} {precise(token0Balance?.formatted ?? 0, 3)}
                            </Button>
                            <Button
                                className="secondary-button active-side"
                                variant="contained"
                                style={{ width: '100%' }}
                                onMouseDown={() => setparams('autoFetchLastPair', false)}
                                disabled={selectedTrade.tradeType === 'sell'}
                                onClick={() => setSelectedTrade((t: any) => t = { ...t, tradeType: 'sell', tokenInfo: token1 })}>
                                <Radio checked={selectedTrade.tradeType === 'sell'} />
                                {cut(token1Balance?.symbol, 'right')} {precise(token1Balance?.formatted ?? 0, 3)}
                            </Button>
                        </div>

                        <Button className="" style={{ marginTop: '1rem' }}>
                            {baseTokenBalance !== 0 ? `${chain?.nativeCurrency?.symbol}${baseTokenBalance}`
                                : <span className='danger-color '>connect your wallet</span>}
                        </Button>


                        <Box className="alone-contianer " style={{ padding: '.4rem', marginTop: '.5rem' }}>
                            <div className="space-between" style={{ gap: 0, paddingInline: '.6rem' }}>
                                <Input
                                    disableUnderline
                                    type="number"
                                    value={selectedTrade.tradeAmount}
                                    maxRows={1}
                                    onFocus={() => setparams('autoFetchLastPair', false)}
                                    autoFocus
                                    error={String(selectedTrade.tradeAmount).length > 15 ? true : false}
                                    className="input-reading transparent-input"
                                    onChange={(i: any) => setSelectedTrade((a: any) => a = { ...a, tradeAmount: String(selectedTrade.tradeAmount).length <= 15 && i.target.valueAsNumber })}
                                    placeholder={`${selectedTrade.tokenInfo?.symbol} 0.00`}
                                />
                                <label className="input-label">{selectedTrade.tokenInfo?.symbol}</label>
                            </div>
                        </Box>
                    </Box>

                    <motion.div className="trade-route ">
                        {selectedTrade.tradeType === 'sell' ? token1?.symbol : token0?.symbol}
                        <span className="green">{fmtNumCompact(selectedTrade?.tradeAmount)}</span>
                        <DoubleArrow />
                        {selectedTrade.tradeType === 'sell' ? token0?.symbol : token1?.symbol}
                        {isFetchingOutput ? <CircularProgress color="inherit" size={10} /> : <span className="green">{fmtNumCompact(routeOutputs?.RoutOutputs)}</span>}
                    </motion.div>

                    <Box className="input-area" >
                        {
                            isConnected ?
                                <Button variant="contained"
                                    onClick={handleSwap}
                                    className={`primary-button ${(isTransacting || isApproving) && 'bg-red'}`} style={{ width: ' 100%', marginTop: '1.4rem' }}>
                                    {buttonText}{(isTransacting || isApproving) && <CircularProgress color="success" size={10} />}
                                </Button>
                                : <Button onClick={() => open()}
                                    style={{ width: ' 100%', marginTop: '1.4rem' }}
                                    variant="contained"
                                    disabled={isOpen} className=" primary-button">
                                    {isOpen ? "Connecting..." : "Connect Your Wallet"}
                                </Button>
                        }
                    </Box>
                </Box>
            </div>

            {params?.snipper?.mode === 'mini' && ExTendedContainer}
        </Box>
    </Grid>
}