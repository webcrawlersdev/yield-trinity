import Master from "../Layouts/Master";
import ManualSnipper from "./Partials/ManualSnipper";
import { useState } from 'react'
import { useLocalStorage } from "usehooks-ts";
import { Params, IParams } from "../Defaulds";
import SnipperSettings from "./Partials/SnipperSettings";
import DexChanges from "./Partials/DexChanges";

export interface ISnipperParams {
    setparams(key: IParams['snipper']['keys'], val: any): void
    settings(old: (state: boolean) => boolean): void
    dexes(old: (state: boolean) => boolean): void,
}

export default function Snipper() {
    const [showSnipperSettings, setShowSnipperSettings] = useState<boolean>(false)
    const [showDexes, setShowDexes] = useState(false)
    const [params, storeParams] = useLocalStorage<IParams>('@Params', Params)

    const setsnipperconfigs = (key: IParams['snipper']['keys'], val: any) =>
        storeParams(o => o = { ...o, snipper: { ...o.snipper, [key]: val } })

    const handleNewDexSelected = (dex: string) => {
        setShowDexes(false)
        setsnipperconfigs('dex', dex)
    }

    return <Master>
        <ManualSnipper
            settings={setShowSnipperSettings}
            setparams={setsnipperconfigs}
            dexes={setShowDexes}
        />

        {/* MODALS */}
        <SnipperSettings
            shown={showSnipperSettings}
            toggle={setShowSnipperSettings}
            setparams={setsnipperconfigs}
        />
        <DexChanges
            shown={showDexes}
            selected={params?.snipper?.dex}
            onSelect={handleNewDexSelected}
            toggle={setShowDexes}
        />
    </Master>
}