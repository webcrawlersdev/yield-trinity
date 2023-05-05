import { Box, Button, Grid, Input } from "@mui/material";
import Master from "../Layouts/Master";
import { useNetwork } from "wagmi";
import { useState } from "react";
import DexChanges from "./Partials/DexChanges";
import useDecentralizedExchange from "../Hooks/useDecentralizedExchamge";
import { ArrowDropDown } from "@mui/icons-material";
import { useLocalStorage } from "usehooks-ts";
import { IParams, Params } from "../Defaulds";
import ArbitradeRouteBuilder from "./Partials/ArbitradeRouteBuilder";
import { TokensList } from "./Partials/Tokens";

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

    const RouteBuilder = (
        <Box className="box-input-area">
            <Box className="input-area">
                <Box className="bg-box arbitrage-route" style={{ padding: '.4rem', marginTop: '.5rem' }}>
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
                        <Button style={{ paddingRight: 0 }}>
                            BNB&nbsp;<ArrowDropDown />
                        </Button>
                    </div>
                </Box>
                <div className="space-between isolated-container" style={{ zIndex: 20 }}>
                    <Button
                        onClick={() => setShowDexes(o => !0)}
                        style={{ padding: '.2rem' }}
                        className={` transparent`}>
                        Select Dexchange
                    </Button>
                </div>
            </Box>
        </Box>
    )

    return <Master>
        <Grid className="dash" style={{ borderRadius: 20, maxHeight: '100%' }}>
            <Box className="dash-lin-box sticky-top transparent padding-none">
                {RouteBuilder}
                {
                    (params?.arbitrade?.dexes as any)?.map((a: any, index: any) => {
                        return <ArbitradeRouteBuilder
                            amount={100}
                            dex={a}
                            dexId={index}
                            onRemove={handleRemoveDex}
                            onShowTokens={setShowTokens}
                        />
                    })
                }
            </Box>

            <Box className="dash-main-box box-stats sticky-top">
                - - -
            </Box>
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
            onSelect={(token: any) => console.log(token)}
        />
    </Master>
}