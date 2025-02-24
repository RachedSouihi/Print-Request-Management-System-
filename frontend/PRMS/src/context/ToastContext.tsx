// src/context/ToastContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

type ToastType = "success" | "danger" | "warning";

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  toast: ToastState;
  showToast: (message: string, type: ToastType) => void;
  hideToast: () => void;
}

// Valeur par défaut du Toast
const defaultToast: ToastState = {
  show: false,
  message: "",
  type: "success",
};

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toast, setToast] = useState<ToastState>(defaultToast);

  // Affiche le Toast avec un message et un type
  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
  };

  // Cache le Toast
  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};

// Hook personnalisé pour utiliser le ToastContext
export const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
