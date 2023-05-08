import { ArrowForward, Close } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { motion } from 'framer-motion'
import { IArbitrade } from "../Arbitrage";
import { useLocalStorage } from "usehooks-ts";
import { Params, IParams } from "../../Defaulds";

export interface IArbitradeRouteBuilder {
    amount: number,
    dex: any
    dexId: number
    onRemove(dexId: number): void
    onShowTokens(old: (state: boolean) => boolean): void
    setParams: IArbitrade['setparams']
}


export default function ArbitradeRouteBuilder(props: IArbitradeRouteBuilder) {

    const { dex, amount, onRemove, dexId, onShowTokens, setParams } = props
    const [params, storeParams] = useLocalStorage<IParams>('@Params', Params)


    return (
        <motion.div
            animate={{ y: 0, opacity: 1 }}
            initial={{ y: -20, opacity: .3 }}
            exit={{ y: 30, opacity: 0 }}
            className="box-input-area bg-box arbitrage-route">
            <Box className="input-area">
                <Box className="space-between isolated-container" style={{ zIndex: 20 }}>
                    <Button
                        variant='contained'
                        style={{ padding: '.2rem' }}
                        className={`primary-button dark-button ${!dex?.NAME && 'error'}`}>
                        <img src={dex?.ICON} alt={dex?.SYMBOL} className="icon" />&nbsp;{dex?.NAME ?? `Invalid DEX`}
                    </Button>
                    <Close className="close-button" onClick={() => onRemove(dexId)} />
                </Box>
                <br />
                <Button
                    variant="contained"
                    onClick={() => {
                        onShowTokens(s => !s)
                        setParams('currentDexId', dexId)
                    }}
                    className=" primary-button dark-button padding-none arb-button-selector">
                    SELECT TRADE PATH&nbsp;

                    <div className="tokens-path-is">{
                        (params?.arbitrade?.dexes as any)?.map((dex: any, index: number) => {
                            if (index === dexId)
                                return dex?.paths?.map((path: any) => {
                                    return (
                                        <div className="token-icon-wrap">
                                            <img src={path?.logoURI} alt={path?.symbol} className="token-icon" />
                                        </div>
                                    )
                                })
                            return <></>
                        })
                    }</div>


                    <ArrowForward />
                </Button>
            </Box>
        </motion.div>
    )
}