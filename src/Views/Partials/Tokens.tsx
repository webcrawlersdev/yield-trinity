import { CancelPresentation } from "@mui/icons-material";
import ContentModal from "../../Components/Modal";
import { ISnipperParams } from "../Snipper";
import { useNetwork } from "wagmi";
import { useADDR } from "../../Ethereum/Addresses";
import { Button } from "@mui/material";

export interface ITokensList {
    shown: boolean,
    selected: any,
    toggle: ISnipperParams['settings'],
    onSelect(dexname: string): void
    pathId?: number
}

export function TokensList(props: ITokensList) {
    const { shown, onSelect, toggle, selected, pathId } = props
    const ADDR = useADDR();
    const tokensList = (
        <div className="flexed-tabs">
            {
                (ADDR?.TOKENS as any)?.map((token: any, index: any) => {
                    return <Button
                        key={index + '-' + token.name}
                        onClick={() => onSelect(token?.name)}
                        disabled={(token?.name?.includes(selected))}
                        style={{ padding: '.2rem', opacity: (token?.name?.includes(selected)) ? 0.2 : 1, color: 'white' }}
                        className={`flexed-tab capitalize ${!token?.name && 'error'}`}>
                        <img src={token?.logoURI} alt={token?.symbol} className="icon" />
                        <div className="flex-col" style={{ paddingLeft: '.5rem' }}>
                            <span>{token?.symbol}</span>
                            <span className="small-text">{token?.name}</span>
                        </div>
                    </Button>
                })
            }
        </div>
     )

    return <ContentModal
        position='center'
        shown={shown}
        onModalClose={() => toggle(s => false)}>
        <div className="modal-heading">
            <div className="space-between">
                <h3 className="modal-headline">Select Token</h3> <CancelPresentation onClick={() => toggle(s => false)} />
            </div>
            <p className="small-text white" style={{ padding: 0, margin: 0 }}>
                Select Path For {pathId}
            </p>
        </div>
        {tokensList}
    </ContentModal>
}