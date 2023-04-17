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
import { ExploreOutlined } from '@mui/icons-material';
const drawerWidth = 200;

export const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

export const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});


export const MenuToggle = (props: { isOpen?: boolean, handlemenuTooggle: Function }) => {
    const isOpen = props.isOpen
    return (
        <IconButton onClick={() => props.handlemenuTooggle()}>
            {isOpen ? <ChevronLeftIcon color='info' /> : <ChevronRightIcon color='info' />}
        </IconButton>
    )
}

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);


export default function MiniDrawer({ open: isOpened }: { open: boolean }) {
    const { innerWidth } = useWindowDimensions()
    const [open, setIsOpen] = useState(false)

    useEffect(() => {
        setIsOpen(o => isOpened)
        return () => { }
    }, [isOpened])


    const styles = {
        lb: {
            minHeight: 48,
            justifyContent: open ? 'initial' : 'center',
            px: 2.5,
        },
        lbl: {
            minWidth: 0,
            width: open ? 3 : 'auto',
            justifyContent: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: '.6rem',
            paddingInline: '.6rem'
        }
    }


    return (
        <Drawer variant="permanent" open={open} className='drawer-main' >
            <MenuToggle isOpen={open} handlemenuTooggle={() => setIsOpen(s => !s)} />
            <Divider />
            {/* <div className="space-between" > */}
            <Box sx={{ flexWrap: 'wrap', display: 'flex', alignContent: 'space-between', height: '100%' }}>
                <List style={{ width: '100%' }}>
                    <ListItem key={'dashboard'} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton sx={styles.lb}  >
                            <Link to={`../${'dashboard'}`} style={styles.lbl}>
                                <DashboardIcon />
                                <ListItemText primary={"Dashboard"} sx={{ opacity: open ? 1 : 0 }} />
                            </Link>
                        </ListItemButton>
                    </ListItem>

                    <ListItem key={'account'} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton sx={styles.lb}  >
                            <Link to={`../${'account'}`} style={styles.lbl}>
                                <AccountBalanceIcon />
                                <ListItemText primary={"Account info"} sx={{ opacity: open ? 1 : 0 }} />
                            </Link>
                        </ListItemButton>
                    </ListItem>
                    <ListItem key={'explorer'} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton sx={styles.lb}  >
                            <Link to={`../${'recto?page=pairs'}`} style={styles.lbl}>
                                <ExploreOutlined />
                                <ListItemText primary={"Explorer | New pairs"} sx={{ opacity: open ? 1 : 0 }} />
                            </Link>
                        </ListItemButton>
                    </ListItem>
                </List>

                <List style={{ width: '100%' }}>
                    <ListItem key={'help'} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton sx={styles.lb}  >
                            <Link to={`../${'info'}`} style={styles.lbl}>
                                <HelpCenterOutlined />
                                <ListItemText primary={"Info"} sx={{ opacity: open ? 1 : 0 }} />
                            </Link>
                        </ListItemButton>
                    </ListItem>

                    <ListItem key={'info'} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton sx={styles.lb}  >
                            <Link to={`../${'info'}`} style={styles.lbl}>
                                <InfoOutlinedIcon />
                                <ListItemText primary={"App info"} sx={{ opacity: open ? 1 : 0 }} />
                            </Link>
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
            {/* </div> */}
            <Divider />
        </Drawer>
    );
}