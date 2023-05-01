import { CloseRounded } from "@mui/icons-material";
import ContentModal from "../../Components/Modal";
import { ISnipperParams } from "../Snipper";
import { IParams, Params } from '../../Defaulds'
import { useNetwork } from "wagmi";
import { useADDR } from "../../Ethereum/Addresses";
import { Button } from "@mui/material";
import { useLocalStorage } from "usehooks-ts";

export interface ISwipperSettings {
    shown: boolean,
    toggle: ISnipperParams['settings'],
    onSelect(dexname: string): void
}

export default function DexChanges(props: ISwipperSettings) {
    const { shown, toggle, onSelect } = props
    const { chain } = useNetwork()
    const ADDR = useADDR(chain?.id);
    const [params, storeParams] = useLocalStorage<IParams>('@Params', Params)

    return (
        <ContentModal shown={shown} onModalClose={() => toggle(s => false)}>
            <div className="modal-heading space-between">
                <h3 className="modal-headline">select a dexchange</h3> <CloseRounded className="close-btn" onClick={() => toggle(s => !s)} />
            </div>
            <div className="flexed-tabs">
                {
                    (ADDR?.DEXS as any)?.map((dex: any, index: any) => {
                        if (!(dex?.NAME?.includes(params?.snipper?.dex))) {
                            return <Button
                                key={index + '-' + dex.NAME}
                                onClick={() => onSelect(dex?.NAME)}
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
    )
}