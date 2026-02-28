import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface RoleRouteProps {
  children: React.ReactNode;
  roles: UserRole[];
  fallback?: string;
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

/**
 * ProtectedRoute - Requires authentication
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * RoleRoute - Requires specific role(s)
 * Must be used inside ProtectedRoute or assumes user is authenticated
 */
export function RoleRoute({ children, roles, fallback = '/dashboard' }: RoleRouteProps) {
  const { user, isLoading, hasRole } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(roles)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

/**
 * GuestRoute - For pages that should only be accessible to non-authenticated users
 * Redirects to dashboard if user is already logged in
 */
export function GuestRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    // Redirect to the page they came from, or dashboard
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

/**
 * SellerRoute - Shorthand for seller-only routes
 */
export function SellerRoute({ children }: ProtectedRouteProps) {
  return (
    <RoleRoute roles={['seller', 'admin', 'super_admin']}>
      {children}
    </RoleRoute>
  );
}

/**
 * AdminRoute - Shorthand for admin-only routes
 */
export function AdminRoute({ children }: ProtectedRouteProps) {
  return (
    <RoleRoute roles={['admin', 'super_admin']} fallback="/dashboard">
      {children}
    </RoleRoute>
  );
}

/**
 * FreelancerRoute - Shorthand for freelancer-only routes
 */
export function FreelancerRoute({ children }: ProtectedRouteProps) {
  return (
    <RoleRoute roles={['freelancer', 'admin', 'super_admin']}>
      {children}
    </RoleRoute>
  );
}
