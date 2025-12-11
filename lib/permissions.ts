/**
 * Permission checking utilities
 */

export const DEPARTMENTS = {
  CLIENT_INFO: "client_info",
  SAMPLE_DEPARTMENT: "sample_department",
  ORDERS: "orders",
  INVENTORY: "inventory",
  PRODUCTION: "production",
  REPORTS: "reports",
} as const;

export type DepartmentId = typeof DEPARTMENTS[keyof typeof DEPARTMENTS];

export interface User {
  id: number;
  username: string;
  email: string;
  is_superuser: boolean;
  department_access?: string[];
}

/**
 * Check if user has access to a department
 */
export function hasDepartmentAccess(
  user: User | null,
  departmentId: DepartmentId | string
): boolean {
  if (!user) return false;
  
  // Superusers have access to everything
  if (user.is_superuser) return true;
  
  // Check if user has this department in their access list
  return user.department_access?.includes(departmentId) || false;
}

/**
 * Check if user can access a route
 */
export function canAccessRoute(
  user: User | null,
  path: string
): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;

  // Map routes to department IDs
  const routeToDepartment: Record<string, DepartmentId> = {
    "/dashboard/erp/clients": DEPARTMENTS.CLIENT_INFO,
    "/dashboard/erp/samples": DEPARTMENTS.SAMPLE_DEPARTMENT,
    "/dashboard/erp/orders": DEPARTMENTS.ORDERS,
    "/dashboard/erp/inventory": DEPARTMENTS.INVENTORY,
    "/dashboard/erp/production": DEPARTMENTS.PRODUCTION,
    "/dashboard/erp/reports": DEPARTMENTS.REPORTS,
  };

  // Check if path starts with any protected route
  for (const [route, deptId] of Object.entries(routeToDepartment)) {
    if (path.startsWith(route)) {
      return hasDepartmentAccess(user, deptId);
    }
  }

  // User management is admin only
  if (path.startsWith("/dashboard/erp/users")) {
    return user.is_superuser;
  }

  // Default: allow access (for non-protected routes)
  return true;
}

