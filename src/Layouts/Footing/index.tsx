import { Box, Button, Typography } from '@mui/material'
import { ProviderRpcError, useNetwork } from 'wagmi'
import useWindowDimensions from '../../Hooks/useWindowDimensions'


export default function Footing() {

    const network = useNetwork()
    const { innerWidth } = useWindowDimensions()

    return (
        <Box className='footing-main' style={{ position: 'sticky', top: 0 }}>
            <Box className="space-between">
                <div className="space-between">
                    <Button>support</Button>
                </div>
                <small className="orangered small-text">
                    &copy; YieldTrinity {String( new Date().getFullYear())}
                </small>
            </Box>
        </Box>
    )
}