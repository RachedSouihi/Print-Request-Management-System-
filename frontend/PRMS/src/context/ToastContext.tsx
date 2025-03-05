import { createContext, useContext, useState, ReactNode } from 'react';

export type ToastType = 'success' | 'danger' | 'warning';

interface ToastContextType {
  toast: {
    message: string;
    type: ToastType;
    show: boolean;
  };
  showToast: (message: string, type: ToastType) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType>({} as ToastContextType);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState({
    message: '',
    type: 'success' as ToastType,
    show: false
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, show: true });
    setTimeout(hideToast, 5000);
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);