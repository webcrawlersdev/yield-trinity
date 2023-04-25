import Master from "../Layouts/Master";
import ManualSnipper from "./Partials/ManualSnipper";
import { useState } from 'react'


export default function Snipper() {
    const [autoMode, setOutoMode] = useState(true)

    return <Master>
        <ManualSnipper />
    </Master>
}