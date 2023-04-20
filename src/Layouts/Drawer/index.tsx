import { styled, Theme, CSSObject } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpCenterOutlined from '@mui/icons-material/HelpCenterOutlined'
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import { Box } from '@mui/material'

import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useWindowDimensions from '../../Hooks/useWindowDimensions';
import { ExploreOutlined, Height } from '@mui/icons-material';
import { motion } from 'framer-motion'

const drawerWidth = 200;

export default function MiniDrawer() {

    const { innerWidth } = useWindowDimensions()
    const [open, setIsOpen] = useState(false)
    const styles = {
        lb: {
            minHeight: 48,
            justifyContent: open ? 'initial' : 'center',
            px: 2.5,
        }
    }

    if (innerWidth <= 600) {
        return <></>
    }
    return (
        <div className='drawer-menu' >
            <motion.nav onMouseOver={() => setIsOpen(true)}
                onMouseOut={() => setIsOpen(false)}
                className="nav-main">
                {
                    open ?
                        <Link className="path-name" style={{ justifyContent: open ? 'flex-start' : 'center', paddingInline: open ? '1rem' : '.6rem' }} to={'/'}>YieldTrinity</Link>
                        : <Link className="path-name" to={'/'}>YT</Link>

                }
                <div
                    style={{ flexWrap: 'wrap', display: 'flex', alignContent: 'space-between', height: '100%' }}>
                    <List className='nav-ul'>
                        <ListItem key={'dashboard'} disablePadding className="nav-li">
                            <ListItemButton sx={styles.lb}  >
                                <Link to={`../${'dashboard'}`} className='nav-link' >
                                    <DashboardIcon />
                                    <ListItemText primary={"Dashboard"} className="nav-name" />
                                </Link>
                            </ListItemButton>
                        </ListItem>

                        <ListItem key={'account'} className="nav-li">
                            <ListItemButton sx={styles.lb}  >
                                <Link to={`../${'shared-wallet'}`} className='nav-link' >
                                    <AccountBalanceIcon />
                                    <ListItemText primary={"Shared Wallet"} className="nav-name" />
                                </Link>
                            </ListItemButton>
                        </ListItem>
                        <ListItem key={'explorer'} className="nav-li">
                            <ListItemButton sx={styles.lb}  >
                                <Link to={`../${'explorer?page=pairs'}`} className='nav-link' >
                                    <ExploreOutlined />
                                    <ListItemText className="nav-name" primary={"Explorer New pairs"} />
                                </Link>
                            </ListItemButton>
                        </ListItem>
                    </List>

                    <List className='nav-ul'>
                        <ListItem key={'help'} className="nav-li">
                            <ListItemButton sx={styles.lb}  >
                                <Link target='_' to={`https:t.me/yieldTrinity`} className='nav-link' >
                                    <HelpCenterOutlined />
                                    <ListItemText primary={"Info"} className="nav-name" />
                                </Link>
                            </ListItemButton>
                        </ListItem>

                        <ListItem key={'info'} className="nav-li">
                            <ListItemButton sx={styles.lb}  >
                                <Link to={`../${'info'}`} className='nav-link' >
                                    <InfoOutlinedIcon />
                                    <ListItemText primary={"App info"} className="nav-name" />
                                </Link>
                            </ListItemButton>
                        </ListItem>
                    </List>
                </div>
            </motion.nav>
        </div>
    )
}