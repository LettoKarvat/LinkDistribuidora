import useSnackStore from '../stores/useSnack';

export function useSnackbar() {
  const { 
    showSnackbar, 
    hideSnackbar, 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo 
  } = useSnackStore();

  return {
    showSnackbar,
    hideSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}