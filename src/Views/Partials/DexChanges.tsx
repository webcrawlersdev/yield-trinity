import { CloseRounded } from "@mui/icons-material";
import ContentModal from "../../Components/Modal";
import { ISnipperParams } from "../Snipper";
import { IParams, Params } from '../../Defaulds'
import { useNetwork } from "wagmi";
import { useADDR } from "../../Ethereum/Addresses";
import { Button } from "@mui/material";

export interface ISwipperSettings {
    shown: boolean,
    selected: any,
    toggle: ISnipperParams['settings'],
    onSelect(dexname: string): void
}

export default function DexChanges(props: ISwipperSettings) {
    const { shown, toggle, onSelect, selected } = props
    const { chain } = useNetwork()
    const ADDR = useADDR(chain?.id);

    return (
        <ContentModal shown={shown} onModalClose={() => toggle(s => false)}>
            <div className="modal-heading space-between">
                <h3 className="modal-headline">select a dexchange</h3> <CloseRounded className="close-btn" onClick={() => toggle(s => !s)} />
            </div>
            <div className="flexed-tabs">
                {
                    (ADDR?.DEXS as any)?.map((dex: any, index: any) => {
                        return <Button
                            key={index + '-' + dex.NAME}
                            onClick={() => onSelect(dex?.NAME)}
                            disabled={(dex?.NAME?.includes(selected))}
                            style={{ padding: '.2rem', opacity: (dex?.NAME?.includes(selected)) ? 0.2 : 1, color: 'white' }}
                            className={`flexed-tab capitalize ${!dex?.NAME && 'error'}`}>
                            <img src={dex?.ICON} alt={dex?.SYMBOL} className="icon" />
                            <div className="flex-col" style={{ paddingLeft: '.5rem' }}>
                                <span>{dex?.SYMBOL}</span>
                                <span className="small-text">{dex?.NAME ?? `Invalid DEX`}</span>
                            </div>
                        </Button>
                    })
                }
            </div>
        </ContentModal>
    )
}