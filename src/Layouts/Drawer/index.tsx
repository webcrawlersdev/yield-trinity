import { styled, Theme, CSSObject } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useWindowDimensions from '../../Hooks/useWindowDimensions';
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


    return (
        <div style={{
            width: innerWidth < 600 && open ? '70dvw' : 60,
            overflow: 'hidden',
            display: innerWidth < 600 && !open ? 'none' : 'flex',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 20,
            background: 'red',
        }}>
            {/* <CssBaseline /> */}
            <Drawer variant="permanent" open={open}  >
                <MenuToggle isOpen={open} handlemenuTooggle={() => setIsOpen(s => !s)} />
                <Divider />
                <List>
                    {['Dashboard'].map((text, index) => (
                        <ListItem key={text} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                }}
                            >
                                <Link to={`${window.location.protocol}/${text}`} style={{
                                    minWidth: 0,
                                    width: open ? 3 : 'auto',
                                    justifyContent: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '.6rem',
                                    paddingInline: '.6rem'
                                }} >
                                    {text === 'Dashboard' && <DashboardIcon />}
                                    {open && <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />}
                                </Link>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider />
            </Drawer>
        </div>
    );
}