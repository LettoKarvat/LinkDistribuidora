import { create } from 'zustand';

const useSnackStore = create((set) => ({
  open: false,
  message: '',
  severity: 'info', // 'error', 'warning', 'info', 'success'
  autoHideDuration: 6000,
  
  showSnackbar: (message, severity = 'info', autoHideDuration = 6000) => 
    set({ open: true, message, severity, autoHideDuration }),
  
  hideSnackbar: () => set({ open: false }),
  
  showSuccess: (message, autoHideDuration) => 
    set({ open: true, message, severity: 'success', autoHideDuration: autoHideDuration || 6000 }),
  
  showError: (message, autoHideDuration) => 
    set({ open: true, message, severity: 'error', autoHideDuration: autoHideDuration || 8000 }),
  
  showWarning: (message, autoHideDuration) => 
    set({ open: true, message, severity: 'warning', autoHideDuration: autoHideDuration || 6000 }),
  
  showInfo: (message, autoHideDuration) => 
    set({ open: true, message, severity: 'info', autoHideDuration: autoHideDuration || 6000 }),
}));

export default useSnackStore;