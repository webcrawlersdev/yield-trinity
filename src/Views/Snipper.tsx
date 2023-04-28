import { useSearchParams } from "react-router-dom";
import ContentModal from "../Components/Modal";
import Master from "../Layouts/Master";
import ManualSnipper from "./Partials/ManualSnipper";
import { useState } from 'react'
import { Button } from "@mui/material";
import { useNetwork } from "wagmi";
import { useADDR } from "../Ethereum/Addresses";
import { CancelPresentation, CloseRounded } from "@mui/icons-material";

export interface ISnipperParams {
    setparams(key: 'auto' | 'dex' | 'pair', val: any): void
    settings(old: (state: boolean) => boolean): void
    dexes(old: (state: boolean) => boolean): void
}

export default function Snipper() {
    const [autoMode, setOutoMode] = useState(true)
    const [showSnipperSettings, setShowSnipperSettings] = useState<boolean>(false)
    const [showDexes, setShowDexes] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams({ dex: 'uniswap', pair: '', auto: 'false' });
    const { chain } = useNetwork()
    const ADDR = useADDR(chain?.id);

    const setParams = (key: 'auto' | 'dex' | 'pair', val: any) => setSearchParams(p => {
        let params = {} as any
        p.forEach((p, k) => (params[k] = p))
        return { ...params, [key]: val }
    })

    const handleNewDexSelected = (dex: string) => {
        setShowDexes(false)
        setParams('dex', dex)
    }


    return <Master>
        <ManualSnipper
            settings={setShowSnipperSettings}
            setparams={setParams}
            dexes={setShowDexes}
        />

        {/* MODALS */}
        <ContentModal shown={showSnipperSettings} onModalClose={() => setShowSnipperSettings(false)}>
            <div className="modal-heading space-between">
                <h3 className="modal-headline">Configurations</h3> <CancelPresentation onClick={() => setShowDexes(false)} />
            </div>
        </ContentModal>
        <ContentModal shown={showDexes} onModalClose={() => setShowDexes(false)}>
            <div className="modal-heading space-between">
                <h3 className="modal-headline">select a dexchange</h3> <CloseRounded className="close-btn" onClick={()=>setShowDexes(false)} />
            </div>
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
    </Master>
}