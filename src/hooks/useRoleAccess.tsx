import { useSession } from 'next-auth/react'
import { UserRole } from '@/types/api'
import { ReactNode } from 'react'

/**
 * Hook to check user permissions based on roles
 */
export function useRoleAccess() {
  const { data: session } = useSession()

  const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
    if (!session?.user?.role) return false
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    return roles.includes(session.user.role)
  }

  const isAdmin = (): boolean => hasRole(UserRole.ADMIN)
  const isCustomer = (): boolean => hasRole(UserRole.CUSTOMER)
  const isStaffOrAdmin = (): boolean => hasRole([UserRole.ADMIN])

  return {
    user: session?.user,
    hasRole,
    isAdmin,
    isCustomer,
    isStaffOrAdmin,
    isAuthenticated: !!session
  }
}

/**
 * Component to conditionally render content based on user roles
 */
interface RoleGuardProps {
  children: ReactNode
  roles?: UserRole | UserRole[]
  fallback?: ReactNode
  requireAll?: boolean // If true, user must have ALL roles, otherwise ANY role
}

export function RoleGuard({ 
  children, 
  roles, 
  fallback = null, 
  requireAll = false 
}: RoleGuardProps) {
  const { hasRole, isAuthenticated } = useRoleAccess()

  // If not authenticated, don't show anything
  if (!isAuthenticated) {
    return <>{fallback}</>
  }

  // If no roles specified, show content for authenticated users
  if (!roles) {
    return <>{children}</>
  }

  // Check role permissions
  const rolesArray = Array.isArray(roles) ? roles : [roles]
  const hasPermission = requireAll 
    ? rolesArray.every(role => hasRole(role))
    : rolesArray.some(role => hasRole(role))

  return hasPermission ? <>{children}</> : <>{fallback}</>
}

/**
 * Higher-order component for role-based access control
 */
export function withRoleAccess<T extends object>(
  Component: React.ComponentType<T>,
  requiredRoles: UserRole | UserRole[],
  fallbackComponent?: React.ComponentType
) {
  return function RoleProtectedComponent(props: T) {
    const { hasRole, isAuthenticated } = useRoleAccess()

    if (!isAuthenticated) {
      if (fallbackComponent) {
        const FallbackComponent = fallbackComponent
        return <FallbackComponent />
      }
      return <div>Please sign in to access this content.</div>
    }

    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    const hasPermission = rolesArray.some(role => hasRole(role))

    if (!hasPermission) {
      if (fallbackComponent) {
        const FallbackComponent = fallbackComponent
        return <FallbackComponent />
      }
      return <div>You don&apos;t have permission to access this content.</div>
    }

    return <Component {...props} />
  }
}

/**
 * Hook to check if user belongs to specific restaurant
 */
export function useRestaurantAccess() {
  const { user, isAdmin } = useRoleAccess()

  const canAccessRestaurant = (restaurantId: string): boolean => {
    if (!user) return false
    if (isAdmin()) return true // Admins can access any restaurant
    return user.restaurantId === restaurantId
  }

  const getUserRestaurantId = (): string | null => {
    return user?.restaurantId || null
  }

  return {
    canAccessRestaurant,
    getUserRestaurantId,
    userRestaurantId: user?.restaurantId
  }
}