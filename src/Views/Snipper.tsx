import { Box, Button, CircularProgress, Divider, Grid, Input, Radio, Switch } from "@mui/material";
import Master from "../Layouts/Master";
import { Web3Button } from "@web3modal/react";
import { AccountBalance, ArrowDropDown, ArrowRight, Balance, DoubleArrow, Fullscreen, FullscreenExit, WalletOutlined } from "@mui/icons-material";
import {
    useAccount, useContractRead,
    useContractReads,
    useContractWrite,
    useNetwork,
    useProvider,
    useToken,
    usePrepareContractWrite,
    useSendTransaction,
    usePrepareSendTransaction,
    useBalance
} from "wagmi";
import ContentModal from "../Components/Modal";
import { useADDR } from "../Ethereum/Addresses";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from 'react'
import { cut, fmWei, precise, toBN, toWei } from "../Helpers";
import { motion } from 'framer-motion'
import { PRICE_ORACLE } from '../Ethereum/ABIs/index.ts'
import { fmtNumCompact } from "../Helpers";
import { toast } from 'react-toastify'

export default function Snipper() {
    const { isConnected, address, } = useAccount()
    const Provider = useProvider()
    const [sDxs, setSDxs] = useState(false)
    const { chain } = useNetwork()
    const ADDR = useADDR(chain?.id);
    const [q, setSearchParams] = useSearchParams({ dex: 'uniswap', });
    const [baseBalance, setBasebalance] = useState<string | number>(0)
    const [expandContainer, setExpnadContainer] = useState(true)
    const [routeOutput, setRouteOutputs] = useState<any>()
    const [tradeSide, setTradeSide] = useState({
        side: 'buy',
        amount: precise(Math.random() * 2)
    })
    const [pairInfo, setPairInfo] = useState({
        tnxCount: 0
    })

    const [priceData, setPriceData] = useState({
        last: '0', current: '0', change: '0'
    })

    const [dataDisplayType, setDataDisplayType] = useState<'variants' | 'transactions' | 'pool'>('variants')
    const dex = (ADDR?.DEXS as any)?.filter((d: any) => d?.NAME?.includes((q.get('dex') as any)?.toLowerCase()?.replace(/[^a-zA-Z]+/g, '')))[0]
    const handleNewDexSelected = (dexname: string) => {
        setSDxs(false)
        setSearchParams({ dex: dexname, pair: q.get('pair') as any })
    }
    const { data: Pairs } = useContractRead({
        abi: PRICE_ORACLE,
        address: ADDR['PRICE_ORACLEA'],
        args: [q.get('pair')],
        functionName: 'getTokensFromPair',
        watch: true
    })

    const { data: token0 } = useToken({ address: (Pairs as any)?.[0] })
    const { data: token1 } = useToken({ address: (Pairs as any)?.[1] })
    const { data: token0Balance } = useBalance({ address, token: token0?.address, watch: true })
    const { data: token1Balance } = useBalance({ address, token: token1?.address, watch: true })
    const { data: token0InPool } = useBalance({ address: q.get('pair') as any, token: token0?.address, watch: true })
    const { data: token1InPool } = useBalance({ address: q.get('pair') as any, token: token1?.address, watch: true })
    const { data: currentPrice } = useContractRead({
        abi: PRICE_ORACLE, address: ADDR['PRICE_ORACLEA'], functionName: "priceInToken",
        args: [token0?.address, token1?.address, dex.ROUTER, dex.FACTORY],
        watch: true,
        enabled: Boolean(token0?.address && token1?.address)
    })
    const { data: outputs, isLoading: isFetchingOutput } = useContractReads({
        contracts: [{
            abi: PRICE_ORACLE, address: ADDR['PRICE_ORACLEA'], functionName: "getRouteOutputs",
            args: [
                [dex.ROUTER],
                (tradeSide.side === 'sell') ? [token1?.address, token0?.address] : [token0?.address, token1?.address],
                toWei(Number(Number.isNaN(tradeSide.amount) ? 0 : tradeSide.amount), (tradeSide.side === 'sell') ? token1?.decimals : token0?.decimals)
            ]
        }, {
            abi: PRICE_ORACLE, address: ADDR['PRICE_ORACLEA'], functionName: "predictFuturePrices",
            args: [
                [dex.ROUTER],
                (tradeSide.side === 'sell') ? [token1?.address, token0?.address] : [token0?.address, token1?.address],
                toWei(Number(Number.isNaN(tradeSide.amount) ? 0 : tradeSide.amount), (tradeSide.side === 'sell') ? token1?.decimals : token0?.decimals)
            ]
        }, {
            abi: PRICE_ORACLE, address: ADDR['PRICE_ORACLEA'], functionName: "priceImpacts",
            args: [
                token1?.address, token0?.address,
                [dex.FACTORY],
                toWei(Number(Number.isNaN(tradeSide.amount) ? 0 : tradeSide.amount), (tradeSide.side === 'sell') ? token1?.decimals : token0?.decimals)
            ]
        }
        ], watch: true, enabled: Boolean(!Number.isNaN(tradeSide.amount))
    })

    const { config, error } = usePrepareContractWrite({
        address: ADDR['PRICE_ORACLEA'], abi: PRICE_ORACLE, functionName: 'swap',
        overrides: {
            // customData: [token0?.address],
            value: toWei(tradeSide.amount, (tradeSide.side === 'sell') ? token1?.decimals : token0?.decimals),
        },
        args: [
            (tradeSide.side === 'sell') ? [token1?.address, token0?.address] : [token0?.address, token1?.address],
            toWei(tradeSide?.amount, (tradeSide.side === 'sell') ? token1?.decimals : token0?.decimals),
            toWei(routeOutput?.RoutOutputs, (tradeSide.side === 'sell') ? token1?.decimals : token0?.decimals),
            dex.ROUTER,
            120
        ],
    })

    const { data: hasSwapData, isLoading: isTransacting, write: transact, isError: swapHasE, error: swapE, reset: resetSwap } =
        useContractWrite(config)

    console.log(error, "PREPARE HAD ERROR")

    useEffect(() => {
        const outPuts = fmWei((outputs as any)?.[0], tradeSide.side === 'sell' ? token0?.decimals : token1?.decimals)
        const future = fmWei((outputs as any)?.[1], tradeSide.side === 'sell' ? token0?.decimals : token1?.decimals)
        setRouteOutputs((o: any) => o = {
            ...o,
            RoutOutputs: outPuts,
            FuturePrice: future
        })

    }, [outputs,])


    useEffect(() => {
        const toastId = 'TRANSACTING'
        if (hasSwapData) {
            toast.promise(hasSwapData.wait,
                { 'error': 'error', 'success': 'Swap Succcessful', 'pending': `Wait, Swapping...` },
                { toastId })
            resetSwap()
        }

        if (swapHasE) {
            toast.error('Something went wrong\n\ncheck if: INSUFFICIENT_BALANCE\nREFLECTIONAL_TOKEN', { toastId })
            resetSwap()
        }

        (async () => {
            const base = await Provider.getBalance(String(address))
            setBasebalance(o => o = precise(fmWei(String(base))))
        })();

        if (true) {
            (async () => {
                const poolTnxCount = await Provider.getTransactionCount(q.get('pair') as any)
                setPairInfo(p => p = {
                    ...p,
                    tnxCount: Number(poolTnxCount)
                })
            })()
        }

        setPriceData((p) => {
            const _cp = Number(fmWei(currentPrice as any ?? 0, token1?.decimals))
            const _op = Number(p.current)
            const __pd = _op - _cp
            const _pd = (__pd / _cp) * 100
            return {
                ...p,
                change: precise(_pd),
                last: precise(_op, 16),
                current: precise(_cp, 16)
            }
        })

    }, [currentPrice, dataDisplayType, q, token1, hasSwapData, swapHasE, swapE])

    const handleSwap = () => {
        transact?.()
    }

    const DexSelector = <div className="space-between relative-container " style={{ zIndex: 20 }}>
        <Button
            onClick={() => setSDxs(o => !o)}
            variant='contained'
            style={{ padding: '.2rem' }}
            className={`primary-button dark-button ${!dex?.NAME && 'error'}`}>
            <img src={dex?.ICON} alt={dex?.SYMBOL} className="icon" />&nbsp;{dex?.NAME ?? `Invalid DEX`}&nbsp;<ArrowDropDown />
        </Button>
        <ContentModal shown={sDxs}>
            <div className="flexed-tabs">
                {
                    (ADDR?.DEXS as any)?.map((dex: any) => {
                        if (!(dex?.NAME?.includes((q.get('dex') as any)?.toLowerCase()?.replace(/[^a-zA-Z]+/g, '')))) {
                            return <Button
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
        </ContentModal>
    </div>

    const Variants = <motion.div initial={{ x: -100 }} animate={{ x: 0 }} className="info-container">
        <div className="only-two-flexed">
            <div className="two-flexed-inner">

                <div className="table-small">
                    <div className="table-small-inner">
                        <span > LAST PRICE </span>
                        <span>{priceData?.last}</span>
                        <span className="green">---</span>
                    </div>
                    <div className="table-small-inner">
                        <span >CURRENT PRICE</span>
                        <span>{priceData?.current}</span>
                        <span className={`
                        ${priceData?.change?.includes('-') ? 'orangered' : (priceData?.last === priceData?.current) ? '' : 'green'}`}
                        >{priceData?.change}%</span>
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
                        <span className="orangered"> TOTAL VALUATION </span>
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
                        <span>{pairInfo?.tnxCount}</span>
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
                        Pool Info
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
                        <a target="_" className="green" href={`${chain?.blockExplorers?.default?.url}/address/${q.get('pair')}`}>&nbsp;{cut(q.get('pair'))}</a>
                        <ArrowRight />
                    </div>
                </h3>

                {dataDisplayType === 'variants' && Variants}
                {dataDisplayType === 'pool' && PoolInfo}
                {dataDisplayType === 'transactions' && Transactions}
            </Box>
        }
    </div>


    return <Master>
        <Grid className="dash" style={{ borderRadius: 20 }}>
            <Box className={`dash-lin-box relative-container expanable ${expandContainer ? 'expanded' : ''}`}>
                <div className="contained">
                    {/* <div className="expand-container" onClick={() => setExpnadContainer(e => !e)}>
                        <SwipeRightAlt />  
                    </div> */}
                    <div className="space-between" style={{ width: '100%', }}>
                        <div className="space-between">
                            Auto <Switch />
                        </div>
                        {DexSelector}

                        {
                            expandContainer ?
                                <FullscreenExit className="primary-button" onClick={() => setExpnadContainer(e => !e)} />
                                : <Fullscreen className="primary-button" onClick={() => setExpnadContainer(e => !e)} />
                        }

                    </div>
                    <Box className="box-input-area">
                        <Box className="input-area">
                            <div className="filter-input-wrapper space-between" style={{ width: '100%' }}>
                                <input className="input-reading"
                                    onChange={(e: any) => {
                                        setSearchParams({ dex: q.get('dex') as any, pair: e.target.value })
                                    }}
                                    value={(q.get('pair') as any) ?? ''}
                                    placeholder='Pair Address... 0x0...' />
                                <Button className="primary-button" >  PASTE  </Button>
                            </div>


                            <div className="space-between" style={{ width: '100%', marginTop: '1rem', }}>
                                <Button
                                    className="secondary-button"
                                    variant="contained"
                                    style={{ width: '100%' }}
                                    onClick={() => setTradeSide(t => t = { ...t, side: 'buy' })}>
                                    <Radio checked={tradeSide.side === 'buy'} />
                                    {token0Balance?.symbol} {precise(token0Balance?.formatted ?? 0, 3)}
                                </Button>
                                <Button
                                    className="secondary-button"
                                    variant="contained"
                                    style={{ width: '100%' }}
                                    onClick={() => setTradeSide(t => t = { ...t, side: 'sell' })}>
                                    <Radio checked={tradeSide.side === 'sell'} />
                                    {token1Balance?.symbol} {precise(token1Balance?.formatted ?? 0, 3)}
                                </Button>
                            </div>
                            <Button className="" style={{ marginTop: '1rem' }}>
                                {chain?.nativeCurrency?.symbol}&bull;{baseBalance}
                            </Button>
                            <Box className="alone-contianer " style={{ padding: '.4rem', marginTop: '.5rem' }}>
                                <Divider />
                                <div className="space-between" style={{ gap: 0 }}>
                                    <Input
                                        type="number"
                                        value={tradeSide.amount}
                                        maxRows={1}
                                        autoFocus
                                        error={String(tradeSide.amount).length > 15 ? true : false}
                                        className="input-reading transparent-input"
                                        onChange={(i: any) => setTradeSide(a => a = { ...a, amount: String(tradeSide.amount).length <= 15 && i.target.valueAsNumber })}
                                        placeholder={`${tradeSide.side === 'sell' ? token1?.symbol : token0?.symbol} 0.00`}
                                    />
                                    <div className="space-between" style={{ gap: 0 }}>
                                        <Button>100%</Button>
                                        <Button>50%</Button>
                                    </div>
                                    <label className="input-label">
                                        {tradeSide.side === 'sell' ? token1?.symbol : token0?.symbol}</label>
                                </div>
                            </Box>
                        </Box>

                        <div className="trade-route ">
                            {tradeSide.side === 'sell' ? token1?.symbol : token0?.symbol}
                            <span className="green">{fmtNumCompact(tradeSide?.amount)}</span>
                            <DoubleArrow />
                            {tradeSide.side === 'sell' ? token0?.symbol : token1?.symbol}
                            {isFetchingOutput ? <CircularProgress color="inherit" size={10} /> : <span className="green">{fmtNumCompact(routeOutput?.RoutOutputs)}</span>}
                        </div>

                        <div className="table-small">
                            <div className="table-small-inner">
                                <span>FUTURE PRICE</span>
                                <span>
                                    {tradeSide.side === 'sell' ? token1?.symbol : token0?.symbol}
                                    /
                                    {tradeSide.side === 'sell' ? token0?.symbol : token1?.symbol}
                                </span>
                                <span className='green'>
                                    {isFetchingOutput ? <CircularProgress color="inherit" size={10} /> : fmtNumCompact(routeOutput?.FuturePrice)}
                                </span>
                            </div>
                            <div className="table-small-inner">
                                <span className="orangered"> </span>
                                <span> </span>
                                <span >
                                    {/* {precise((outputs as any)?.[2] ?? 0)}%  */}
                                    {/* ---  */}
                                </span>
                            </div>
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

                {expandContainer && ExTendedContainer}
            </Box>
        </Grid>
    </Master>
}