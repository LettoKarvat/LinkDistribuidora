import { createTheme as createMuiTheme } from '@mui/material/styles';

export const createTheme = (mode) => {
  return createMuiTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
      },
      secondary: {
        main: '#00796b',
        light: '#26a69a',
        dark: '#004d40',
      },
      success: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20',
      },
      error: {
        main: '#d32f2f',
        light: '#ef5350',
        dark: '#c62828',
      },
      warning: {
        main: '#ed6c02',
        light: '#ff9800',
        dark: '#e65100',
      },
      info: {
        main: '#0288d1',
        light: '#03a9f4',
        dark: '#01579b',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: [
        'Roboto',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
        lineHeight: 1.2,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
        lineHeight: 1.2,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
        lineHeight: 1.2,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.2,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.2,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: mode === 'dark' 
              ? '0 4px 6px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px rgba(0, 0, 0, 0.05)',
            transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
            '&:hover': {
              boxShadow: mode === 'dark' 
                ? '0 6px 12px rgba(0, 0, 0, 0.3)'
                : '0 6px 12px rgba(0, 0, 0, 0.1)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '16px',
          },
          head: {
            fontWeight: 600,
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeader:focus': {
              outline: 'none',
            },
          },
        },
      },
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
  });
};