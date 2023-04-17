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

                    
                </ul>
            </div>
        </Box>
    )
}