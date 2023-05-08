import { CancelPresentation } from "@mui/icons-material";
import ContentModal from "../../Components/Modal";
import { ISnipperParams } from "../Snipper";
import { useADDR } from "../../Ethereum/Addresses";
import { Button, Checkbox } from "@mui/material";
import { useLocalStorage } from "usehooks-ts";
import { IParams, Params } from "../../Defaulds";

export interface ITokensList {
    shown: boolean,
    selected: any,
    toggle: ISnipperParams['settings'],
    onSelect(dexname: string, passed: any): void
    pathId?: 'from' | 'to'
}

export function TokensList(props: ITokensList) {
    const { shown, onSelect, toggle, selected, pathId } = props
    const [params, storeParams] = useLocalStorage<IParams>('@Params', Params)

    const ADDR = useADDR();
    const tokensList = (
        <div className="flexed-tabs">
            {
                (ADDR?.TOKENS as any)?.map((token: any, index: any) => {
                    return <Button
                        key={index + '-' + token.name}
                        onClick={() => onSelect(token, params?.arbitrade?.currentDexId)}
                        disabled={(token?.name?.includes(selected))}
                        style={{ padding: '.2rem', width: '100%', opacity: (token?.name?.includes(selected)) ? 0.2 : 1, color: 'white' }}
                        className={`flexed-tab capitalize ${!token?.name && 'error'}`}>
                        <div className="space-between" style={{ width: '100%' }}>
                            <div className="space-between" >
                                <img src={token?.logoURI} alt={token?.symbol} className="icon" />
                                <div className="flex-col" style={{ paddingLeft: '.5rem' }}>
                                    <span>{token?.symbol}</span>
                                    <span className="small-text">{token?.name}</span>
                                </div>
                            </div>
                            {
                                <Checkbox />
                            }
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
                Select Path For
                {params?.arbitrade?.currentDexId}
            </p>
        </div>
        {tokensList}
    </ContentModal>
}