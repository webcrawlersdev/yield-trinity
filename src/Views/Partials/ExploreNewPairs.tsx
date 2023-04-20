import { ArrowDownward, ArrowDropDown, ArrowRight, SwapHorizRounded } from '@mui/icons-material'
import { Box, Button, Divider } from '@mui/material/'
import { useNetwork } from 'wagmi'
import useWindowDimensions from '../../Hooks/useWindowDimensions'
import { Link, useSearchParams } from 'react-router-dom'
import { useADDR } from '../../Ethereum/Addresses'

export default () => {

    const { chain } = useNetwork()
    const { innerWidth } = useWindowDimensions()
    const [q, setSearchParams] = useSearchParams({ dex: 'uniswap' });
    const ADDR = useADDR(chain?.id)
    const dex = (ADDR?.DEXS as any)?.[(q.get('dex') as any).toUpperCase().replace(/[^a-zA-Z]+/g, '')]
    console.log(dex, (q.get('dex') as any).toUpperCase().replace(/[^a-zA-Z]+/g, ''))
    return (
        <Box sx={{ width: '100%' }} >
            <div className="page-navigator">
                <div className="space-between">
                    <Button variant='contained' style={{ padding: '.2rem' }} className={`primary-button dark-button ${!dex?.NAME && 'error'}`}>
                        <img src={dex?.ICON} alt={dex?.SYMBOL} className="icon" />&nbsp;{dex?.NAME ?? `Invalid DEX`}&nbsp;<ArrowDropDown />
                    </Button>
                </div>
                <div className="filter-input-wrapper">
                    <input className="input-reading"
                        onChange={() => { }}
                        placeholder='Filter by symbol, name, pair address...' />
                </div>
            </div>

            <div className="list-wrap">
                <ul className="ul list-ul">
                    <li className="list-li list-heading">

                    </li>

                    {
                        innerWidth <= 700 ? <h2 style={{ paddingInline: '1rem' }}>COMING SOON ON MOBILE</h2> : (
                            <>
                                <li className="list-li list-heading">
                                    <span className="heading-title">name</span>
                                    <span className="heading-title">liting date</span>
                                    <span className="heading-title">price {chain?.nativeCurrency?.symbol} &bull; USD</span>
                                    <span className="heading-title">LQ {chain?.nativeCurrency?.symbol}  &bull; token</span>
                                    <span className="heading-title">action</span>
                                </li>
                                <li className="list-li">
                                    <span className="list-li-title">- - -</span>
                                    <span className="list-li-title">- - -</span>
                                    <span className="list-li-title">- - -  &bull; - - -</span>
                                    <span className="list-li-title">- - -  &bull; - - -</span>
                                    <span className="list-li-title">
                                        <div className="space-between">
                                            <span></span>
                                            <div className="space-between">
                                                <a target="_balnk" href={''} >
                                                    <Button className=" primary-button">
                                                        0x0***0000<ArrowRight />
                                                    </Button>
                                                </a>
                                                <SwapHorizRounded />
                                            </div>
                                        </div>
                                    </span>
                                </li>
                            </>
                        )
                    }
                </ul>
            </div>
        </Box>
    )
}