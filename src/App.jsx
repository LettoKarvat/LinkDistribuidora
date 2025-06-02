import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { useEffect } from 'react';

import AppRoutes from './routes';
import useThemeStore from './stores/useTheme';
import { SnackbarProvider } from './components/Snackbar/SnackbarProvider';
import { createTheme } from './theme';

function App() {
  const { mode } = useThemeStore();
  const theme = createTheme(mode);
  
  // Apply theme to body for consistent background colors
  useEffect(() => {
    document.body.style.backgroundColor = theme.palette.background.default;
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <SnackbarProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;