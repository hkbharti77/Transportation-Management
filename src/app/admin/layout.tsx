"use client";

import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserRole, getDefaultDashboardRoute } from "@/utils/roleBasedRouting";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
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

    // Role-based access control and redirection
    if (user?.role) {
      const role = user.role.toLowerCase() as UserRole;
      
      // If user is not admin, redirect to their appropriate dashboard
      if (role !== 'admin') {
        const defaultRoute = getDefaultDashboardRoute(role);
        // Only redirect if not already on the default route
        if (pathname !== defaultRoute) {
          router.push(defaultRoute);
          return;
        }
      }
      
      // Admin users can access everything (no restrictions)
    }
  }, [isAuthenticated, user, isLoading, router, pathname]);

  // Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-screen-2xl md:p-6 2xl:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}