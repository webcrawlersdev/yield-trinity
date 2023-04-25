import { Box, Button, CircularProgress, Divider, Grid, Input, Radio, Switch } from "@mui/material";
import Master from "../../Layouts/Master";
import { Web3Button } from "@web3modal/react";
import { ArrowDropDown, ArrowRight, DoubleArrow, Fullscreen, FullscreenExit, Key } from "@mui/icons-material";
import {
    useAccount, useContractRead,
    useContractReads,
    useNetwork,
    useProvider,
    useToken,
    useBalance,
    usePrepareSendTransaction,
    useSendTransaction,
    useContractWrite
} from "wagmi";
import ContentModal from "../../Components/Modal";
import { useADDR } from "../../Ethereum/Addresses";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from 'react'
import { cut, encodeFunctionCall, fmWei, precise, toBN, toLower, toUpper, toWei } from "../../Helpers";
import { motion } from 'framer-motion'
import { PRICE_ORACLE } from '../../Ethereum/ABIs/index.ts'
import { fmtNumCompact } from "../../Helpers";
import { toast } from 'react-toastify'

export default function ManualSnipper() {
    const { isConnected, address, } = useAccount()
    const { chain } = useNetwork()
    const ADDR = useADDR(chain?.id);
    const ProviderInstance = useProvider()
    const [showDexs, setShowDexs] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams({ dex: 'uniswap', pair: '' });
    const [baseTokenBalance, setBaseTokenBalance] = useState<string | number>(0)
    const [expandedContainer, setExpandedContainer] = useState(true)
    const [routeOutputs, setRouteOutputs] = useState<any>()
    const [selectedPair, setSelectedPair] = useState({ transactionCount: 0 })
    const [priceInfo, setPriceInfo] = useState({ lastPrice: '0', currentPrice: '0', priceChange: '0' })
    const [dataDisplayType, setDataDisplayType] = useState<'variants' | 'transactions' | 'pool'>('variants')
    const dex = (ADDR?.DEXS as any)?.filter((d: any) => d?.NAME?.includes(toLower(searchParams.get('dex') as any).replace(/[^a-zA-Z]+/g, '')))[0]
    const pair = (searchParams.get('pair') as any).replace(' ', '')

    const handleNewDexSelected = (dexname: string) => {
        setShowDexs(false)
        setSearchParams({ dex: dexname, pair: searchParams.get('pair') as any })
    }

    const handlePairChange = (pair: string) => setSearchParams({ dex: searchParams.get('dex') as any, pair })

    const { data: Pairs } = useContractRead({
        abi: PRICE_ORACLE,
        address: ADDR['PRICE_ORACLEA'],
        args: [pair],
        functionName: 'getTokensFromPair',
        watch: true,
    })

    const { data: token0 } = useToken({ address: (Pairs as any)?.[0] })
    const { data: token1 } = useToken({ address: (Pairs as any)?.[1] })
    const [selectedTrade, setSelectedTrade] = useState<any>({ tradeType: 'buy', tradeAmount: precise(Math.random() * 2), tokenInfo: token0 })
    const { data: token0Balance } = useBalance({ address, token: token0?.address, watch: true })
    const { data: token1Balance } = useBalance({ address, token: token1?.address, watch: true })
    const { data: token0InPool } = useBalance({ address: searchParams.get('pair') as any, token: token0?.address, watch: true })
    const { data: token1InPool } = useBalance({ address: searchParams.get('pair') as any, token: token1?.address, watch: true })
    const { data: tokenAllowance } = useContractRead({
        address: (selectedTrade.tradeType === 'sell') ? token1?.address : token0?.address,
        abi: PRICE_ORACLE,
        functionName: 'allowance',
        args: [address, ADDR['PRICE_ORACLEA']],
        watch: true
    })
    const PriceOracleContracts = {
        abi: PRICE_ORACLE, address: ADDR['PRICE_ORACLEA'], functionName: "priceInToken",
        args: [token0?.address, token1?.address, dex.ROUTER, dex.FACTORY],
        watch: true,
        enabled: Boolean(token0?.address && token1?.address)
    }
    const { data: tokenPriceInToken } = useContractRead(PriceOracleContracts)
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

    const { write: approve } = useContractWrite({
        mode: 'recklesslyUnprepared',
        functionName: 'approve',
        abi: PRICE_ORACLE,
        address: selectedTrade?.tokenInfo?.address,
        args: [ADDR['PRICE_ORACLEA'],
        toWei(selectedTrade.tradeAmount, selectedTrade?.tokenInfo?.decimals)]
    })

    const { write: swap,
        data: hasSwapData,
        isLoading: isTransacting,
        isError: swapHasError,
        error: swapE,
        reset: resetSwap
    } = useContractWrite({
        mode: 'recklesslyUnprepared',
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
            value: toUpper(selectedTrade?.tokenInfo?.address) === toUpper(ADDR['WETH_ADDRESSA']) ? toWei(selectedTrade?.tradeAmount) : 0
        }
    })

    const handleSwap = () => {
        if (toUpper(selectedTrade?.tokenInfo?.address) !== toUpper(ADDR['WETH_ADDRESSA']))
            if (Number(fmWei(tokenAllowance as any)) <= 0)
                return approve?.()
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

    }, [outputs,])

    useEffect(() => {
        const TRANSACTING_TOAST_ID = 'TRANSACTING';

        if (hasSwapData && !swapHasError) {
            toast.promise(
                hasSwapData.wait,
                { error: 'error', success: 'Swap Successful', pending: 'Wait, Swapping...' },
                { toastId: TRANSACTING_TOAST_ID }
            );
            resetSwap()
        }

        if (swapHasError) {
            toast.error(
                'Something went wrong\n\ncheck if: INSUFFICIENT_BALANCE\nREFLECTIONAL_TOKEN',
                { toastId: TRANSACTING_TOAST_ID }
            );
            resetSwap()
        }

        (async () => {
            const baseBalance = await ProviderInstance.getBalance(String(address));
            setBaseTokenBalance(o => o = precise(fmWei(String(baseBalance))));
            const poolTnxCount = await ProviderInstance.getTransactionCount(searchParams.get('pair') as any);
            setSelectedPair(p => ({ ...p, transactionCount: Number(poolTnxCount) }));
        })();

        setPriceInfo((p) => {
            const currentPrice = Number(fmWei(tokenPriceInToken as any ?? 0, token1?.decimals));
            const lastPrice = Number(p.currentPrice);
            const priceDiff = lastPrice - currentPrice;
            const priceChange = ((priceDiff / currentPrice) * 100).toFixed(2);
            return { ...p, currentPrice: precise(currentPrice, 16), lastPrice: precise(lastPrice, 16), priceChange };
        });

    }, [tokenPriceInToken, dataDisplayType, searchParams, token1, hasSwapData, swapHasError, swapE]);

    const DexSelector = <div className="space-between relative-container " style={{ zIndex: 20 }}>
        <Button
            onClick={() => setShowDexs(o => !o)}
            variant='contained'
            style={{ padding: '.2rem' }}
            className={`primary-button dark-button ${!dex?.NAME && 'error'}`}>
            <img src={dex?.ICON} alt={dex?.SYMBOL} className="icon" />&nbsp;{dex?.NAME ?? `Invalid DEX`}&nbsp;<ArrowDropDown />
        </Button>
        <ContentModal shown={showDexs}>
            <div className="flexed-tabs">
                {
                    (ADDR?.DEXS as any)?.map((dex: any, index: any) => {
                        if (!(dex?.NAME?.includes((searchParams.get('dex') as any)?.toLowerCase()?.replace(/[^a-zA-Z]+/g, '')))) {
                            return <Button
                                key={index + '-' + dex.NAME}
                                onClick={() => handleNewDexSelected(dex?.NAME)}
                                variant='contained' style={{ padding: '.2rem' }}
                                className={`primary-button dark-button flexed-tab ${!dex?.NAME && 'error'}`}>
                                <img src={dex?.ICON} alt={dex?.SYMBOL} className="icon" />&nbsp;{dex?.NAME ?? `Invalid DEX`}
                            </Button>
                        }
                        return <></>
                    })
                }
            </div>
        </ContentModal >
    </div >

    const Variants = <motion.div initial={{ x: -100 }} animate={{ x: 0 }} className="info-container">
        <div className="only-two-flexed">
            <div className="two-flexed-inner">

                <div className="table-small">
                    <div className="table-small-inner">
                        <span > LAST PRICE </span>
                        <span>{priceInfo?.lastPrice}</span>
                        <span className="green">---</span>
                    </div>
                    <div className="table-small-inner">
                        <span >CURRENT PRICE</span>
                        <span>{priceInfo?.currentPrice}</span>
                        <span className={`
                        ${priceInfo?.priceChange?.includes('-') ? 'orangered' : (priceInfo?.lastPrice === priceInfo?.currentPrice) ? '' : 'green'}`}
                        >{priceInfo?.priceChange}%</span>
                    </div>
                    <div className="table-small-inner">
                        <span >BUY PRICE</span>
                        <span>0.00</span>
                        <span className="green">0.00%</span>
                    </div>
                    <div className="table-small-inner">
                        <span >SELLING PRICE</span>
                        <span>0.00</span>
                        <span className="green">0.00%</span>
                    </div>
                    <div className="table-small-inner">
                        <span >POT. PROFIT</span>
                        <span>0.00</span>
                        <span className="green">0.00%</span>
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
                    <Button variant='contained' disabled={dataDisplayType === 'variants'} onClick={() => setDataDisplayType('variants')} className="box-navigation-btn" >
                        Variants
                    </Button>
                    <Button disabled={dataDisplayType === 'pool'} onClick={() => setDataDisplayType('pool')} className="box-navigation-btn" >
                        Pool
                    </Button>
                    <Button disabled={dataDisplayType === 'transactions'} onClick={() => setDataDisplayType('transactions')} className="box-navigation-btn"  >
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
                        <a target="_" className="green" href={`${chain?.blockExplorers?.default?.url}/address/${searchParams.get('pair')}`}>&nbsp;{cut(searchParams.get('pair'))}</a>
                        <ArrowRight />
                    </div>
                </h3>

                {dataDisplayType === 'variants' && Variants}
                {dataDisplayType === 'pool' && PoolInfo}
                {dataDisplayType === 'transactions' && Transactions}
            </Box>
        }
    </div>

    return <Grid className="dash" style={{ borderRadius: 20 }}>
        <Box className={`dash-lin-box relative-container expanable ${expandedContainer ? 'expanded' : ''}`}>
            <div className="contained">
                {/* <div className="expand-container" onClick={() => setExpandedContainer(e => !e)}>
                        <SwipeRightAlt />  
                    </div> */}
                <div className="space-between" style={{ width: '100%', }}>
                    <div className="space-between">
                        Auto <Switch />
                    </div>
                    {DexSelector}

                    {
                        expandedContainer ?
                            <FullscreenExit className="primary-button" onClick={() => setExpandedContainer(e => !e)} />
                            : <Fullscreen className="primary-button" onClick={() => setExpandedContainer(e => !e)} />
                    }

                </div>
                <Box className="box-input-area">
                    <Box className="input-area">
                        <div className="filter-input-wrapper space-between" style={{ width: '100%' }}>
                            <input className="input-reading"
                                onChange={(e: any) => handlePairChange(e.target.value)}
                                value={(searchParams.get('pair') as any) ?? ''}
                                placeholder='Pair Address... 0x0...' />
                            <Button className="primary-button" >  PASTE  </Button>
                        </div>


                        <div className="space-between" style={{ width: '100%', marginTop: '1rem', }}>
                            <Button
                                className="secondary-button"
                                variant="contained"
                                style={{ width: '100%' }}
                                onClick={() => setSelectedTrade((t: any) => t = { ...t, tradeType: 'buy', tokenInfo: token0 })}>
                                <Radio checked={selectedTrade.tradeType === 'buy'} />
                                {token0Balance?.symbol} {precise(token0Balance?.formatted ?? 0, 3)}
                            </Button>
                            <Button
                                className="secondary-button"
                                variant="contained"
                                style={{ width: '100%' }}
                                onClick={() => setSelectedTrade((t: any) => t = { ...t, tradeType: 'sell', tokenInfo: token1 })}>
                                <Radio checked={selectedTrade.tradeType === 'sell'} />
                                {token1Balance?.symbol} {precise(token1Balance?.formatted ?? 0, 3)}
                            </Button>
                        </div>
                        <Button className="" style={{ marginTop: '1rem' }}>
                            {chain?.nativeCurrency?.symbol}&bull;{baseTokenBalance}
                        </Button>
                        <Box className="alone-contianer " style={{ padding: '.4rem', marginTop: '.5rem' }}>
                            <div className="space-between" style={{ gap: 0, paddingInline: '.6rem' }}>
                                <Input
                                    disableUnderline
                                    type="number"
                                    value={selectedTrade.tradeAmount}
                                    maxRows={1}
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

                    <div className="table-small">
                        {
                            !expandedContainer && (
                                <div className="table-small-inner">
                                    <span >CURRENT PRICE</span>
                                    <span>{priceInfo?.currentPrice}</span>
                                    <span className={`${priceInfo?.priceChange?.includes('-') ? 'orangered' : (priceInfo?.lastPrice === priceInfo?.currentPrice) ? '' : 'green'}`} >{priceInfo?.priceChange}%</span>
                                </div>
                            )
                        }
                        <motion.div className="table-small-inner">
                            <span>FUTURE PRICE</span>
                            <span>
                                {selectedTrade.tradeType === 'sell' ? token1?.symbol : token0?.symbol}
                                /
                                {selectedTrade.tradeType === 'sell' ? token0?.symbol : token1?.symbol}
                            </span>
                            <span className='green'>
                                {isFetchingOutput ? <CircularProgress color="inherit" size={10} /> : fmtNumCompact(routeOutputs?.FuturePrice)}
                            </span>
                        </motion.div>

                    </div>

                    <Box className="input-area" >
                        {
                            isConnected ?
                                <Button variant="contained"
                                    onClick={handleSwap}
                                    className={`primary-button ${isTransacting && 'bg-red'}`} style={{ width: '100%' }}>
                                    Transact{isTransacting && "ing..."}
                                </Button>
                                : <div className="space-between">
                                    <Web3Button label="Connect wallet first." />
                                    <Button
                                        className={`  `}
                                        style={{ flexGrow: 1, borderRadius: 10, boxShadow: 'none' }} variant='contained' >
                                        <a href="">What is this?</a>
                                    </Button>
                                </div>
                        }
                    </Box>
                </Box>
            </div>

            {expandedContainer && ExTendedContainer}
        </Box>
    </Grid>
}