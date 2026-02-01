import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
  showAccessDenied?: boolean;
}

/**
 * RoleGuard component to protect routes based on user roles.
 * 
 * Usage:
 * ```tsx
 * <RoleGuard allowedRoles={['powerhouse', 'super_admin']}>
 *   <ProtectedComponent />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({ 
  children, 
  allowedRoles, 
  redirectTo = '/login',
  showAccessDenied = true 
}: RoleGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.includes(user.role);

  if (!hasRequiredRole) {
    if (showAccessDenied) {
      return <AccessDenied userRole={user.role} requiredRoles={allowedRoles} />;
    }
    // Redirect to appropriate panel based on role
    const redirectPath = getDefaultPanelForRole(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

/**
 * Get the default panel path for a given role
 */
export function getDefaultPanelForRole(role: UserRole): string {
  switch (role) {
    case 'powerhouse':
      return '/powerhouse';
    case 'super_admin':
      return '/superadmin';
    case 'master':
      return '/master';
    case 'user':
    default:
      return '/dashboard';
  }
}

/**
 * Access Denied component shown when user doesn't have permission
 */
function AccessDenied({ 
  userRole, 
  requiredRoles 
}: { 
  userRole: UserRole; 
  requiredRoles: UserRole[]; 
}) {
  const defaultPath = getDefaultPanelForRole(userRole);
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          You don't have permission to access this page. 
          This area requires one of the following roles: {requiredRoles.join(', ')}.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Your current role: <span className="font-medium capitalize">{userRole.replace('_', ' ')}</span>
        </p>
        <a 
          href={defaultPath}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Go to Your Dashboard
        </a>
      </div>
    </div>
  );
}

/**
 * Higher-order component for role-based protection
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[]
) {
  return function GuardedComponent(props: P) {
    return (
      <RoleGuard allowedRoles={allowedRoles}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}

export default RoleGuard;
