import { Box, Button, CircularProgress, Divider, Grid, Input, Radio, Switch } from "@mui/material";
import Master from "../Layouts/Master";
import { Web3Button } from "@web3modal/react";
import { ArrowDropDown, ArrowRight, Balance, DoubleArrow, Fullscreen, FullscreenExit, SwapHoriz } from "@mui/icons-material";
import { useAccount, useContractRead, useContractReads, useContractWrite, useNetwork, useProvider } from "wagmi";
import ContentModal from "../Components/Modal";
import { useADDR } from "../Ethereum/Addresses";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from 'react'
import { cut, fmWei, precise, toWei } from "../Helpers";
import { motion } from 'framer-motion'
import { PRICE_ORACLE } from '../Ethereum/ABIs/index.ts'
import { fmtNumCompact } from "../Helpers";

export default function Snipper() {
    const { isConnected, address, } = useAccount()
    const Provider = useProvider()
    const [sDxs, setSDxs] = useState(false)
    const { chain } = useNetwork()
    const ADDR = useADDR(chain?.id);
    const [q, setSearchParams] = useSearchParams({ dex: 'uniswap', });
    const [baseBalance, setBasebalance] = useState<string | number>(0)
    const [expandContainer, setExpnadContainer] = useState(true)
    const [tradeSide, setTradeSide] = useState({
        side: 'buy',
        amount: 0
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

    const { data: token0 } = useContractReads({
        contracts: [
            { abi: PRICE_ORACLE, address: (Pairs as any)?.[0], functionName: "name" },
            { abi: PRICE_ORACLE, address: (Pairs as any)?.[0], functionName: "symbol" },
            { abi: PRICE_ORACLE, address: (Pairs as any)?.[0], functionName: "decimals" },
            { abi: PRICE_ORACLE, address: (Pairs as any)?.[0], functionName: "balanceOf", args: [q.get('pair')] },
        ],
    })
    const { data: token1 } = useContractReads({
        contracts: [
            { abi: PRICE_ORACLE, address: (Pairs as any)?.[1], functionName: "name" },
            { abi: PRICE_ORACLE, address: (Pairs as any)?.[1], functionName: "symbol" },
            { abi: PRICE_ORACLE, address: (Pairs as any)?.[1], functionName: "decimals" },
            { abi: PRICE_ORACLE, address: (Pairs as any)?.[1], functionName: "balanceOf", args: [q.get('pair')] },
        ],
    })

    const { data: currentPrice } = useContractRead({
        abi: PRICE_ORACLE, address: ADDR['PRICE_ORACLEA'], functionName: "priceInToken",
        args: [(Pairs as any)?.[0], (Pairs as any)?.[1], dex.ROUTER, dex.FACTORY],
        watch: true,
        enabled: Boolean(Pairs)
    })

    const { data: outputs, isLoading: isFetchingOutput } = useContractReads({
        contracts: [{
            abi: PRICE_ORACLE, address: ADDR['PRICE_ORACLEA'], functionName: "getRouteOutputs",
            args: [
                [dex.ROUTER],
                (tradeSide.side === 'sell') ? [(Pairs as any)?.[1], (Pairs as any)?.[0]] : [(Pairs as any)?.[0], (Pairs as any)?.[1]],
                toWei(Number(Number.isNaN(tradeSide.amount) ? 0 : tradeSide.amount), (tradeSide.side === 'sell') ? (token1 as any)?.[2] : (token0 as any)?.[2])
            ]
        },
        {
            abi: PRICE_ORACLE, address: ADDR['PRICE_ORACLEA'], functionName: "predictFuturePrices",
            args: [
                [dex.ROUTER],
                (tradeSide.side === 'sell') ? [(Pairs as any)?.[1], (Pairs as any)?.[0]] : [(Pairs as any)?.[0], (Pairs as any)?.[1]],
                toWei(Number(Number.isNaN(tradeSide.amount) ? 0 : tradeSide.amount), (tradeSide.side === 'sell') ? (token1 as any)?.[2] : (token0 as any)?.[2])
            ]
        },
        {
            abi: PRICE_ORACLE, address: ADDR['PRICE_ORACLEA'], functionName: "priceImpacts",
            args: [
                (Pairs as any)?.[1], (Pairs as any)?.[0],
                [dex.FACTORY],
                toWei(Number(Number.isNaN(tradeSide.amount) ? 0 : tradeSide.amount), (tradeSide.side === 'sell') ? (token1 as any)?.[2] : (token0 as any)?.[2])
            ]
        }
        ], watch: true, enabled: Boolean(!Number.isNaN(tradeSide.amount))
    })

    const { data, isLoading: isTransacting, isSuccess, error, isError, write: transact } = useContractWrite({
        mode: 'recklesslyUnprepared',
        address: ADDR['PRICE_ORACLEA'], abi: PRICE_ORACLE, functionName: 'swap',
        // overrides: tnxMode === 'deposit' ? { value: toWei(amount) } : {},
        args: [
            (tradeSide.side === 'sell') ? [(Pairs as any)?.[1], (Pairs as any)?.[0]] : [(Pairs as any)?.[0], (Pairs as any)?.[1]],
            toWei(Number(Number.isNaN(tradeSide.amount) ? 0 : tradeSide.amount), (tradeSide.side === 'sell') ? (token1 as any)?.[2] : (token0 as any)?.[2]),
            toWei((outputs as any)?.[1], tradeSide.side === 'sell' ? (token0 as any)?.[2] : (token1 as any)?.[2]),
            [dex.ROUTER],
        ]
    })



    useEffect(() => {
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
            const _cp = Number(fmWei(currentPrice as any ?? 0, Number(token1?.[2])))
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

    }, [currentPrice, dataDisplayType, Provider, address, q, token1])

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
                        <span className="green">12%</span>
                    </div>
                    <div className="table-small-inner">
                        <span >SELLING PRICE</span>
                        <span>0.00</span>
                        <span className="green">12%</span>
                    </div>
                    <div className="table-small-inner">
                        <span >POT. PROFIT</span>
                        <span>0.00</span>
                        <span className="green">12%</span>
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
                        <span > {(token0 as any)?.[1]} IN POOL </span>
                        <span></span>
                        <span>{precise(fmWei((token0 as any)?.[3], (token0 as any)?.[2]), 5)}</span>
                    </div>
                    <div className="table-small-inner">
                        <span > {(token1 as any)?.[1]} IN POOL </span>
                        <span></span>
                        <span>{precise(fmWei((token1 as any)?.[3], (token1 as any)?.[2]), 5)}</span>
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
                    {(token0 as any)?.[1]}/{(token1 as any)?.[1]}
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
                                    className="secondary-button primary-button"
                                    variant="contained"
                                    style={{ width: '100%' }}
                                    onClick={() => setTradeSide(t => t = { ...t, side: 'buy' })}>
                                    {(token0 as any)?.[1]}
                                    <Radio checked={tradeSide.side === 'buy'} />
                                </Button>
                                <Button
                                    className="secondary-button primary-button"
                                    variant="contained"
                                    style={{ width: '100%' }}
                                    onClick={() => setTradeSide(t => t = { ...t, side: 'sell' })}>
                                    {(token1 as any)?.[1]}
                                    <Radio checked={tradeSide.side === 'sell'} />
                                </Button>
                            </div>

                            <Box className="alone-contianer " style={{ padding: '.4rem', marginTop: '1rem' }}>
                                <label className="absolute-label space-between">
                                    Amount
                                    <span className="small-text flex-left"><Balance /> {chain?.nativeCurrency?.symbol} ~{baseBalance}</span>
                                </label>
                                <Divider />
                                <div className="space-between" style={{ gap: 0 }}>
                                    <Input
                                        type="number"
                                        value={tradeSide.amount}
                                        maxRows={1}
                                        error={String(tradeSide.amount).length > 15 ? true : false}
                                        className="input-reading transparent-input"
                                        onChange={(i: any) => setTradeSide(a => a = { ...a, amount: String(tradeSide.amount).length <= 15 && i.target.valueAsNumber })}
                                        placeholder={`${tradeSide.side === 'sell' ? (token1 as any)?.[1] : (token0 as any)?.[1]} 0.00`}
                                    />
                                    <div className="space-between" style={{ gap: 0 }}>
                                        <Button>100%</Button>
                                        <Button>50%</Button>
                                    </div>
                                    <label className="input-label">
                                        {tradeSide.side === 'sell' ? (token1 as any)?.[1] : (token0 as any)?.[1]}</label>
                                </div>
                            </Box>
                        </Box>

                        <div className="trade-route ">
                            {tradeSide.side === 'sell' ? (token1 as any)?.[1] : (token0 as any)?.[1]}
                            <span className="green">{fmtNumCompact(tradeSide?.amount)}</span>
                            <DoubleArrow />
                            {tradeSide.side === 'sell' ? (token0 as any)?.[1] : (token1 as any)?.[1]}
                            {isFetchingOutput ? <CircularProgress color="inherit" size={10} /> : <span className="green">{fmtNumCompact(fmWei((outputs as any)?.[0], tradeSide.side === 'sell' ? (token0 as any)?.[2] : (token1 as any)?.[2]))}</span>}
                        </div>

                        <div className="table-small">
                            <div className="table-small-inner">
                                <span>FUTURE PRICE</span>
                                <span>
                                    {tradeSide.side === 'sell' ? (token1 as any)?.[1] : (token0 as any)?.[1]}
                                    /
                                    {tradeSide.side === 'sell' ? (token0 as any)?.[1] : (token1 as any)?.[1]}
                                </span>
                                <span className='green'>
                                    {isFetchingOutput ? <CircularProgress color="inherit" size={10} /> : fmtNumCompact(fmWei((outputs as any)?.[1], tradeSide.side === 'sell' ? (token0 as any)?.[2] : (token1 as any)?.[2]))}
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