import { useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import useSnackStore from '../../stores/useSnack';

export function SnackbarProvider({ children }) {
  const { open, message, severity, autoHideDuration, hideSnackbar } = useSnackStore();

  useEffect(() => {
    // Set up an auto-hide timer if open
    if (open && autoHideDuration) {
      const timer = setTimeout(() => {
        hideSnackbar();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, hideSnackbar]);

  return (
    <>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={hideSnackbar} 
          severity={severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}