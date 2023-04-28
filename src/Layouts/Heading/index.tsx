import { Box, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import DropDown from '../../Components/Dropdown'
import { Web3Button, Web3NetworkSwitch } from '@web3modal/react'
import { useNetwork } from 'wagmi'
import useWindowDimensions from '../../Hooks/useWindowDimensions'


export default function Heading() {

    const network = useNetwork()
    const { innerWidth } = useWindowDimensions()

    return (
        <Box className='heading-main' style={{ position: 'sticky', top: 0 }}>
            <Box className="space-between">
                <div className="space-between">
                    <Typography component={'h1'}>
                        <a className='site-name' href={window.location.href}>{innerWidth < 700 ? "YT" : window.location.pathname.replace('/', '').replace('-', ' ')}</a>
                    </Typography>
                    {innerWidth > 600 && <Web3NetworkSwitch />}
                </div>
                <Web3Button
                    avatar={'show'}
                    balance={ 'show'}
                    icon='show' />
            </Box>
        </Box>
    )
}