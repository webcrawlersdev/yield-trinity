import { Box, Button, Grid, Input } from "@mui/material";
import Master from "../Layouts/Master";
import { useNetwork } from "wagmi";
import { useState } from "react";
import DexChanges from "./Partials/DexChanges";
import useDecentralizedExchange from "../Hooks/useDecentralizedExchamge";
import { ArrowDropDown, Route } from "@mui/icons-material";
import { useLocalStorage } from "usehooks-ts";
import { IParams, Params } from "../Defaulds";
import ArbitradeRouteBuilder from "./Partials/ArbitradeRouteBuilder";
import { TokensList } from "./Partials/Tokens";

export interface IArbitrade {
    setparams(key: IParams['arbitrade']['keys'], val: any): void
}

export default function Arbitrage() {
    const { chain } = useNetwork()
    const [amount, setamount] = useState()
    const [showDexes, setShowDexes] = useState(false)
    const [showTokens, setShowTokens] = useState(false)
    const { dexs } = useDecentralizedExchange()
    const [params, storeParams] = useLocalStorage<IParams>('@Params', Params)

    const setParams = (key: IParams['arbitrade']['keys'], val: any) =>
        storeParams(o => o = { ...o, arbitrade: { ...o.arbitrade, [key]: val } })

    const handleNewDexSelected = (dexname: string) => {
        setShowDexes(false)
        const dex = dexs?.filter((d: any) => d?.NAME === dexname)[0]
        setParams('dexes', [...(params?.arbitrade?.dexes as any), dex])
    }

    const handleRemoveDex = (dexId: any) => {
        const selected = (params?.arbitrade?.dexes as any)
        const dex = selected?.filter((i: any, index: any) => index !== dexId)
        setParams('dexes', dex)
    }

    const appendTokenForPath = (token: any, dexId: number) => {
        const selected = (params?.arbitrade?.dexes as any)
        const dex = selected?.filter((i: any, index: any) => index === dexId)
        const avpaths = [...(dex?.paths ?? [] as any)]?.filter(t => t?.symbol !== token?.symbol);
        avpaths.push(token)
        const modified = selected.map((dex: any, i: number) => {
            (dex as any)['paths'] = (i === dexId) ? avpaths : (dex as any)['paths']
            return dex
        })
        console.log(selected, modified)
        setParams('dexes', modified)
    }

    const RouteBuilder = (
        <Box className="input-area">
            <Box className="bg-box arbitrage-route" style={{ padding: '.4rem', marginTop: 0 }}>
                <div className="space-between" style={{ gap: 0, paddingInline: '.6rem' }}>
                    <Input
                        disableUnderline
                        type="number"
                        value={amount}
                        maxRows={1}
                        autoFocus
                        error={String(amount).length > 15 ? true : false}
                        className="input-reading transparent-input"
                        onChange={(i: any) => setamount(o => (i.target.valueAsNumber >= 0) ? i.target.value : o)}
                        placeholder={'Amount In 0.001'}
                    />
                    <Button
                        onClick={() => {
                            setParams('currentDexId', 0)
                            setShowTokens(s => !s)
                        }}
                        style={{ paddingRight: 0 }}>
                        BNB&nbsp;<ArrowDropDown />
                    </Button>
                </div>
            </Box>
            <div className="space-between isolated-container" style={{ zIndex: 20 }}>
                <Button
                    onClick={() => setShowDexes(o => !o)}
                    style={{ padding: '.2rem' }}
                    className={` transparent`}>
                    Select Dexchange
                </Button>
            </div>
        </Box>
    )

    const TradeRoute = (
        <Box className="dash-main-box box-stats sticky-top" style={{ background: 'transparent' }}>
            <div className="space-between">
                <h3 className="headline-3 space-between" style={{ gap: '.3rem' }}>
                    <Route />Your Trade Route 🤚
                </h3>
                <span></span>
            </div>


            <div className="trade-routes">
                {
                    (params?.arbitrade?.dexes as any)?.map((dex: any) => {
                        return <div className="trade-path">
                            <div className="dex-name">{dex?.NAME}</div>
                            <div className="trade-paths space-between">
                                {
                                    (dex?.paths as any)?.map((path: any) => {
                                        return (
                                            <div className="trade-path-ind">
                                                <span className="trade-amount">356</span>
                                                <hr />
                                                <span className="token-info">{path?.symbol}</span>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    })
                }
            </div>
        </Box>
    )

    return <Master>
        <Grid className="dash " style={{ borderRadius: 20, maxHeight: '100%' }}>
            <Box className="dash-lin-box sticky-top transparent padding-none">
                {RouteBuilder}
                {
                    (params?.arbitrade?.dexes as any)?.map((a: any, index: any) => {
                        return <ArbitradeRouteBuilder
                            setParams={(key: any, val: any) => setParams(key, val)}
                            amount={100}
                            dex={a}
                            dexId={index}
                            onRemove={handleRemoveDex}
                            onShowTokens={setShowTokens}
                        />
                    })
                }
            </Box>
            {TradeRoute}
        </Grid>


        {/* MODALS */}
        <DexChanges
            selected={null}
            shown={showDexes}
            onSelect={handleNewDexSelected}
            toggle={setShowDexes}
        />
        <TokensList
            shown={showTokens}
            toggle={setShowTokens}
            selected={'NODE'}
            onSelect={appendTokenForPath}
        />
    </Master>
}