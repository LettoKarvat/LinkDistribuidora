import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import useThemeStore from '../../stores/useTheme';
import useAuthStore from '../../stores/useAuth';
import { useNavigate } from 'react-router-dom';

// Styled AppBar component that has space for the drawer
const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'drawerWidth',
})(({ theme, drawerWidth }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  [theme.breakpoints.up('sm')]: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
}));

function AppBar({ drawerWidth, onMenuToggle }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const { mode, toggleTheme } = useThemeStore();
  const { logout, getFullName } = useAuthStore();
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  return (
    <StyledAppBar position="fixed" drawerWidth={drawerWidth} elevation={1}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            fontWeight: 600
          }}
        >
          Inova
        </Typography>

        {/* Theme Toggle */}
        <Tooltip title={mode === 'light' ? 'Modo escuro' : 'Modo claro'}>
          <IconButton color="inherit" onClick={toggleTheme} sx={{ ml: 1 }}>
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>

        {/* User Menu */}
        <Box sx={{ ml: 2 }}>
          <Tooltip title="Configurações da conta">
            <IconButton
              onClick={handleMenu}
              size="small"
              sx={{ padding: 0 }}
              aria-controls="menu-appbar"
              aria-haspopup="true"
            >
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                {getFullName().charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose} dense sx={{ minWidth: 170 }}>
              <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">Meu perfil</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} dense>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">Sair</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
}

export default AppBar;