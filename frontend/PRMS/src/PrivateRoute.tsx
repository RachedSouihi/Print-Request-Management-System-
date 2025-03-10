import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallbackComponent?: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole, fallbackComponent }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return fallbackComponent || <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return fallbackComponent || <div>Access restricted to {requiredRole} role.</div>;
  }

  return <>{children}</>;
};

export default PrivateRoute;