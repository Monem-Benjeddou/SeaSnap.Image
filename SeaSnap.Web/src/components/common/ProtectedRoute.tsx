import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { hasPermission } from '../../utils/permissions';
import { Result, Button, Spin } from 'antd';
import { authService } from '../../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof typeof import('../../utils/permissions').PERMISSIONS;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  fallback,
}) => {
  const { isAuthenticated, user, isLoading, setLoading } = useAuthStore();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated && !user && !hasChecked) {
        setLoading(true);
        try {
          const userData = await authService.getCurrentUser();
          useAuthStore.getState().updateUser(userData);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          useAuthStore.getState().logout();
        } finally {
          setLoading(false);
          setIsChecking(false);
          setHasChecked(true);
        }
      } else {
        setIsChecking(false);
        setHasChecked(true);
      }
    };

    checkAuth();
  }, [isAuthenticated, hasChecked, setLoading]);

  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(user.roles, requiredPermission)) {
    return (
      fallback || (
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Go Back
            </Button>
          }
        />
      )
    );
  }

  return <>{children}</>;
};