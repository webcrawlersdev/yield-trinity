import MiniDrawer from "../Drawer"
import Box from '@mui/material/Box';
import Heading from "../Heading";
import { useState } from 'react'
export default ({ children }: { children: React.ReactNode }) => {
    const [isMenuOpen, setisMenuOpen] = useState<boolean>(false)
    const toggleMenu = () => setisMenuOpen(o => !o)
    return (
        <Box sx={{ display: 'flex' }}>
            {/* <MiniDrawer open={isMenuOpen} /> */}
            <Box component="main" className="main-container" sx={{  }}>
                <Heading isMenuOpen={isMenuOpen} handlemenuTooggle={toggleMenu} />
                {children}
            </Box>
        </Box>
    )
}