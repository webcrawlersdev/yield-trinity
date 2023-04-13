import { Box, Typography } from '@mui/material'
import DropDown from '../../Components/Dropdown'
import { Web3Button, Web3NetworkSwitch } from '@web3modal/react'
import { useNetwork } from 'wagmi'
import useWindowDimensions from '../../Hooks/useWindowDimensions'


export default function Heading({ handlemenuTooggle, isMenuOpen }: { handlemenuTooggle: Function, isMenuOpen: boolean }) {

    const network = useNetwork()
    const { innerWidth } = useWindowDimensions()

    return (
        <Box className='heading-main' style={{ position: 'sticky', top: 0 }}>
            <Box className="space-between">
                <Box className="space-between">
                    <Typography component={'h1'}>
                        <a href={window.location.href}>{window.location.pathname == '/' ? 'Yield Trinity' : window.location.pathname.replace('/', '')}</a>
                    </Typography>
                    <Typography component={'h1'}>
                        <a href='#doc-coming-soon'>DOC</a>
                    </Typography>
                    {/* <MenuToggle isOpen={isMenuOpen} handlemenuTooggle={handlemenuTooggle} />  */}
                    {
                        innerWidth < 600 ? '' :
                            <DropDown title={network.chain?.name}>
                                {/* {network?.chain?.nativeCurrency?} */}
                                <Web3NetworkSwitch />
                            </DropDown>
                    }
                </Box>
                <Web3Button balance="show" />
            </Box>
        </Box>
    )
}