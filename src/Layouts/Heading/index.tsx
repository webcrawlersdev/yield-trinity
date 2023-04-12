import { Box, Button, ButtonGroup, Typography } from '@mui/material'
import DropDown from '../../Components/Dropdown'
import { Web3Button } from '@web3modal/react'
import { useNetwork } from 'wagmi'
import useWindowDimensions from '../../Hooks/useWindowDimensions'
import { MenuToggle } from '../Drawer/index'


export default function Heading({ handlemenuTooggle, isMenuOpen }: { handlemenuTooggle: Function, isMenuOpen:boolean }) {

    const network = useNetwork()
    const { innerWidth } = useWindowDimensions()

    return (
        <Box className='heading-main' style={{ position: 'sticky', top: 0 }}>
            <Box className="space-between">
                <Box className="space-between">
                    <Typography component={'h1'}>
                        <a href={window.location.href}>{window.location.pathname == '/' ? 'Yield Trinity' : window.location.pathname.replace('/', '')}</a>
                    </Typography>
                    {/* <MenuToggle isOpen={isMenuOpen} handlemenuTooggle={handlemenuTooggle} />  */}
                    {
                        innerWidth < 600 ? '' :
                            <DropDown title={network.chain?.name}>
                                {/* <div className="space-between">
                            {network?.chains?.map(chain => <Button variant='contained' className='drop-down-btn margin-bottom-sp'>{chain.nativeCurrency.symbol}</Button>)}
                        </div> */}
                            </DropDown>
                    }

                </Box>
                <Web3Button balance="show"  />
            </Box>
        </Box>
    )
}