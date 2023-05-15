import { Box, Button, Divider, Grid, Input } from "@mui/material";
import Master from "../Layouts/Master";
import { useNetwork } from "wagmi";
import { useState } from "react";
import DexChanges from "./Partials/DexChanges";
import useDecentralizedExchange from "../Hooks/useDecentralizedExchamge";
import { Route } from "@mui/icons-material";
import { useLocalStorage } from "usehooks-ts";
import { IDex, IParams, ITokenInfo, Params } from "../Defaulds";
import ArbitradeRouteBuilder from "./Partials/Arbitrade/RouteBuilder";
import { TokensList } from "./Partials/Tokens";
import ArbitrageRoutePath from "./Partials/Arbitrade/RoutePath";
import Summary from "./Partials/Arbitrade/Summary";
import { motion } from 'framer-motion'
import { Link } from "react-router-dom";


export default function Arbitrage() {
    const { chain } = useNetwork()
    const [showDexes, setShowDexes] = useState(false)
    const [showTokens, setShowTokens] = useState(false)
    const { dexs } = useDecentralizedExchange()
    const [params, storeParams] = useLocalStorage<IParams>('@Params', Params)

    const setParams = (key: IParams['arbitrade']['keys'], val: any) =>
        storeParams(o => o = { ...o, arbitrade: { ...o.arbitrade, [key]: val } })

    const handleNewDexSelected = (dexname: string) => {
        setShowDexes(false)
        const selected = params?.arbitrade?.dexes || []
        const dex = dexs?.filter((d: any) => d?.NAME === dexname)[0]
        if (Number(params?.arbitrade?.dexes?.length) >= 3)
            selected[Number(params?.arbitrade?.dexes?.length) - 1] = dex as IDex
        else
            selected[Number(params?.arbitrade?.dexes?.length)] = dex
        setParams('dexes', selected)
    }

    const handleRemoveDex = async (dexId: any) => {
        const selected = params?.arbitrade?.dexes
        const dex = selected?.filter((dexIt, index: any) => {
            let paths = dexIt['paths'] || []
            if (index === dexId) { return }
            if (index > 0 && Boolean(selected?.[index - 1]?.paths?.length)) {
                const firtSibling0 = selected?.[index - 1]?.paths?.[selected?.[index - 1]?.paths?.length - 1]
                const pathLine = paths?.filter((tInPath: ITokenInfo) => firtSibling0?.symbol !== tInPath?.symbol);
                pathLine.unshift(firtSibling0);
                dexIt['paths'] = pathLine as [ITokenInfo]
            }
            return dexIt
        })
        setParams('dexes', dex)
    }

    const appendTokenForPath = (token: ITokenInfo, dexId: number, isChecked: boolean) => {
        const selected = (params?.arbitrade?.dexes as any)
        const modifiedDex = selected?.map((dex: IDex, index: number) => {

            let paths = dex['paths'] || []

            if ((index === dexId)) {
                paths = paths?.filter((tInPath: ITokenInfo) => tInPath?.symbol !== token?.symbol) as [ITokenInfo];
                isChecked || paths?.push(token)
                if (paths?.length <= 4)
                    dex['paths'] = paths
            }

            if (index > 0 && Boolean(selected?.[index - 1]?.paths?.length)) {
                const firtSibling0 = selected?.[index - 1]?.paths?.[selected?.[index - 1]?.paths?.length - 1]
                const pathLine = paths?.filter((tInPath: ITokenInfo) => firtSibling0?.symbol !== tInPath?.symbol);
                pathLine.unshift(firtSibling0);
                dex['paths'] = pathLine as [ITokenInfo]
            }

            return dex
        })
        setParams('dexes', modifiedDex)
    }

    const RouteBuilder = (
        <Box className="input-area">
            <Box className="bg-box arbitrage-route" style={{ padding: '.4rem', marginTop: 0 }}>
                <div className="space-between" style={{ gap: 0, paddingInline: '.6rem' }}>
                    <Input
                        disableUnderline
                        type="number"
                        value={params?.arbitrade?.amountIn}
                        maxRows={1}
                        autoFocus
                        error={String(params?.arbitrade?.amountIn).length > 15 ? true : false}
                        className="input-reading transparent-input"
                        onChange={({ target: { value } }) => setParams('amountIn', Number(value))}
                        placeholder={'Amount In 0.001'}
                    />
                    <Button
                        onClick={() => {
                            setParams('currentDexId', 0)
                            setShowTokens(s => !s)
                        }}
                        style={{ paddingRight: 0 }}>
                        {params?.arbitrade?.dexes?.[0]?.paths?.[0]?.symbol}
                    </Button>
                </div>
            </Box>

        </Box>
    )

    const TradeRoute = (
        <Box className="dash-main-box box-stats sticky-top" style={{ background: 'transparent', padding: 0, paddingTop: '1rem' }}>
            <div className="space-between">
                <h3 className="headline-3 space-between" style={{ gap: '.3rem' }}>
                    <Route />Your Trade Route 🤚
                </h3>
                <span></span>
            </div>
            <hr />
            <div className="trade-routes">
                {
                    params?.arbitrade?.dexes?.map((dex, index: number) => {
                        if (dex?.paths?.length > 1)
                            return <ArbitrageRoutePath dexId={index} dex={dex} />
                        return <span key={Math.random()}></span>
                    })
                }
            </div>
            <Summary />
        </Box>
    )

    return <Master>
        <Grid className="dash relative" style={{ borderRadius: 5, maxHeight: '100%' }}>
            <Box className="dash-lin-box sticky-top transparent padding-none">
                {RouteBuilder}
                {
                    params?.arbitrade?.dexes?.map((a: any, index: any) => {
                        return <ArbitradeRouteBuilder
                            key={"ROUTE_BUILDER-" + Math.random()}
                            setParams={(key: any, val: any) => setParams(key, val)}
                            amount={100}
                            dex={a}
                            dexId={index}
                            onShowDexes={setShowDexes}
                            onRemove={handleRemoveDex}
                            onShowTokens={setShowTokens}
                        />
                    })

                }
                <br />
                <div className="space-between">
                    <Button
                        variant="contained"
                        onClick={() => setShowDexes(o => !o)}
                        style={{ width: '100%' }}
                        disabled={params?.arbitrade?.dexes?.length as any >= 3}
                        className={`dark-button primary-button`}>
                        {params?.arbitrade?.dexes?.length as any >= 3 ? 'Limited For Account' : 'Select  Dexchange'}
                    </Button>
                    {
                        params?.arbitrade?.dexes?.length as any >= 3 &&
                        <Link
                            target="_blank"
                            to={'/increase-limits'}
                            children='Increase'
                        />
                    }
                </div>
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

    </Master >
}