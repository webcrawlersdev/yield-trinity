import { ArrowRight, SwapHorizRounded } from '@mui/icons-material'
import { Box, Button } from '@mui/material/'
import { useNetwork } from 'wagmi'
import useWindowDimensions from '../../Hooks/useWindowDimensions'

export default () => {

    const { chain } = useNetwork()
    const { innerWidth } = useWindowDimensions()

    return (
        <Box className="dash-main-box flexed-dash box-stats" >
            <div className="list-wrap">
                <ul className="ul list-ul">
                    <li className="list-li list-heading">
                        <p className='centered-text'>New listings on {chain?.name} exchanges</p>
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