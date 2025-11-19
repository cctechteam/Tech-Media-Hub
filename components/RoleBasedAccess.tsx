"use client";

import { ReactNode } from "react";

interface RoleBasedAccessProps {
  children: ReactNode;
  userRoles: string[];
  requiredRoles?: string[];
  requiredAnyRole?: string[];
  minPermissionLevel?: number;
  userPermissionLevel?: number;
  fallback?: ReactNode;
}

export function RoleBasedAccess({
  children,
  userRoles,
  requiredRoles,
  requiredAnyRole,
  minPermissionLevel,
  userPermissionLevel,
  fallback = null
}: RoleBasedAccessProps) {
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAllRoles = requiredRoles.every(role => userRoles.includes(role));
    if (!hasAllRoles) {
      return <>{fallback}</>;
    }
  }
  
  if (requiredAnyRole && requiredAnyRole.length > 0) {
    const hasAnyRole = requiredAnyRole.some(role => userRoles.includes(role));
    if (!hasAnyRole) {
      return <>{fallback}</>;
    }
  }
  
  if (minPermissionLevel !== undefined && userPermissionLevel !== undefined) {
    if (userPermissionLevel < minPermissionLevel) {
      return <>{fallback}</>;
    }
  }
  
  return <>{children}</>;
}

export function useRoleCheck(userRoles: string[]) {
  return {
    hasRole: (role: string) => userRoles.includes(role),
    hasAnyRole: (roles: string[]) => roles.some(role => userRoles.includes(role)),
    hasAllRoles: (roles: string[]) => roles.every(role => userRoles.includes(role)),
    isAdmin: () => userRoles.includes("admin"),
    isTechTeam: () => userRoles.includes("tech_team"),
    isSupervisor: () => userRoles.includes("supervisor"),
    isStaff: () => userRoles.includes("staff"),
    isBeadle: () => userRoles.includes("beadle"),
    isStudent: () => userRoles.includes("student")
  };
}
