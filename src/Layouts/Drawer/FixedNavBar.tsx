import List from '@mui/material/List';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpCenterOutlined from '@mui/icons-material/HelpCenterOutlined'
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'

import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import useWindowDimensions from '../../Hooks/useWindowDimensions';
import { ExploreOutlined, MenuOpenRounded } from '@mui/icons-material';

export default function FixedNavBar() {
    const { innerWidth } = useWindowDimensions()
    const [open, setIsOpen] = useState(false)
    const mmenu = useRef<any>(<div></div>)

    useEffect(() => {
        if (!(innerWidth > 600)) {
            window.document.addEventListener('mouseup', (e: any) => {
                const menu = e.target
                if (menu !== mmenu?.current && !(mmenu?.current?.contains(menu).lenght)) {
                    setIsOpen(o => false)
                }
            })
            return () => window.document.removeEventListener('mouseup', (e: any) => { })
        }
    }, [])


    const styles = {
        lb: {
            minHeight: 48,
            justifyContent: open ? 'initial' : 'center',
            px: 2.5,
            width: open ? '100%' : 'auto',
            backgroud: 'red'
        },
        lbl: {
            minWidth: 0,
            width: open ? '100%' : 'auto',
            justifyContent: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: '.6rem',
            paddingInline: '.6rem'
        }
    }

    if (innerWidth > 600) return <></>

    return (
        <div style={{ maxHeight: '90dvh' }} className={`drawer-main-mobile ${open ? 'mobile-menu-toggled' : ''}`} >
            <List ref={mmenu} className='drawer-main-mobile-lists'  >
                <ListItemButton sx={styles.lb}    >
                    <Link to={`../${'dashboard'}`} style={styles.lbl}>
                        <DashboardIcon />
                        <ListItemText primary={"Dashboard"} sx={{ opacity: open ? 1 : 0 }} />
                    </Link>
                </ListItemButton>

                <ListItemButton sx={styles.lb}  >
                    <Link to={`../${'account'}`} style={styles.lbl}>
                        <AccountBalanceIcon />
                        <ListItemText primary={"Account info"} sx={{ opacity: open ? 1 : 0 }} />
                    </Link>
                </ListItemButton>
                <ListItemButton sx={styles.lb}  >
                    <Link to={`../${'recto?page=pairs'}`} style={styles.lbl}>
                        <ExploreOutlined />
                        <ListItemText primary={"Explore"} sx={{ opacity: open ? 1 : 0 }} />
                    </Link>
                </ListItemButton>

                <ListItemButton sx={styles.lb}  >
                    <Link to={`../${'info'}`} style={styles.lbl}>
                        <HelpCenterOutlined />
                        <ListItemText primary={"Info"} sx={{ opacity: open ? 1 : 0 }} />
                    </Link>
                </ListItemButton>

                <ListItemButton sx={styles.lb}  >
                    <Link to={`../${'info'}`} style={styles.lbl}>
                        <InfoOutlinedIcon />
                        <ListItemText primary={"App info"} sx={{ opacity: open ? 1 : 0 }} />
                    </Link>
                </ListItemButton>
            </List>
            <MenuOpenRounded onClick={() => setIsOpen(o => !o)} className='menu-toggle' />
        </div>
    );
}