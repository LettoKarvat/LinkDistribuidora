import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

import AppBar from './AppBar';
import SideDrawer from './SideDrawer';

const drawerWidth = 240;

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar 
        drawerWidth={drawerWidth} 
        onMenuToggle={handleDrawerToggle} 
      />
      
      <SideDrawer 
        drawerWidth={drawerWidth} 
        mobileOpen={mobileOpen} 
        onDrawerToggle={handleDrawerToggle} 
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          overflow: 'hidden'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;