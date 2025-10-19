"use client";

import { useAuth } from "@/context/AuthContext";
import { UserRole, isRouteAccessible, getDefaultDashboardRoute } from "@/utils/roleBasedRouting";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect } from "react";

interface RoleBasedLayoutProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleBasedLayout({ children, allowedRoles }: RoleBasedLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Check authentication
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    // Check role authorization
    if (user?.role) {
      const userRole = user.role.toLowerCase() as UserRole;
      
      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(userRole)) {
        // Redirect to user's default dashboard
        const defaultRoute = getDefaultDashboardRoute(userRole);
        router.push(defaultRoute);
        return;
      }
      
      // Additional check for specific route access within the role
      let isAllowed = false;
      for (const role of allowedRoles) {
        if (isRouteAccessible(role, pathname)) {
          isAllowed = true;
          break;
        }
      }
      
      if (!isAllowed) {
        // Redirect to user's default dashboard
        const defaultRoute = getDefaultDashboardRoute(userRole);
        router.push(defaultRoute);
      }
    }
  }, [isAuthenticated, user, isLoading, router, pathname, allowedRoles]);

  // Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check if user's role is allowed
  const userRole = user.role?.toLowerCase() as UserRole;
  if (!allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}