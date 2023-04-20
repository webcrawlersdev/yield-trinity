import MiniDrawer from "../Drawer"
import { Box } from '@mui/material';
import Heading from "../Heading";
import { useState } from 'react'
import Footing from "../Footing";
import FixedNavBar from "../Drawer/FixedNavBar";

export default ({ children }: { children: React.ReactNode }) => {
    return (
        <div style={{ display: 'flex', height: '100vh',overflow:'hidden' }}>
            <MiniDrawer />
            <Box component="main" className="main-container"  >
                <Heading />
                <p className="path-description">New pairs listed on Ethereum exchanges with pool variation in real time</p>
                <Box className='main-centered'>
                    {children}
                </Box>
                <Footing />
                <FixedNavBar />
            </Box>
        </div>
    )
}