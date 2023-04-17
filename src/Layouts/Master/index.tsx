import MiniDrawer from "../Drawer"
import { Box } from '@mui/material';
import Heading from "../Heading";
import { useState } from 'react'
import Footing from "../Footing";
import FixedNavBar from "../Drawer/FixedNavBar";

export default ({ children }: { children: React.ReactNode }) => {
    const [isMenuOpen, setisMenuOpen] = useState<boolean>(false)
    const toggleMenu = () => setisMenuOpen(o => !o)
    return (
        <Box sx={{ display: 'flex' }}>
            <MiniDrawer open={isMenuOpen} />
            <Box component="main" className="main-container"  >
                <Heading isMenuOpen={isMenuOpen} handlemenuTooggle={toggleMenu} />
                <h1 className="path-name">{window.location.pathname.replace('/', '')}</h1>
                <Box className='main-centered'>
                    {children}
                </Box>
                <Footing />
                <FixedNavBar />
            </Box>
        </Box>
    )
}