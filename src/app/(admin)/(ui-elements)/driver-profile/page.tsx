"use client";

import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import ChangePasswordForm from "@/components/ui-elements/user-management/ChangePasswordForm";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DriverProfile() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    // Only allow drivers to access this page
    if (currentUser?.role !== 'driver') {
      // Redirect non-drivers to appropriate dashboard based on role
      if (currentUser?.role === 'admin') {
        router.push('/profile'); // Admin profile page
      } else if (currentUser?.role === 'customer') {
        router.push('/dashboard');
      } else {
        router.push('/signin');
      }
      return;
    }
  }, [isAuthenticated, currentUser, isLoading, router]);

  // Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated || currentUser?.role !== 'driver') {
    return null;
  }

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <UserAddressCard />
          
          {/* Password Change Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              Security Settings
            </h4>
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}