import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import AppSidebar from "@/layout/AppSidebar";
import AppHeader from "@/layout/AppHeader";
import { SidebarProvider } from "@/context/SidebarContext";

export const metadata: Metadata = {
  title: "Admin Dashboard | Transportation Management System",
  description: "Transportation Management System Admin Panel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          <div className="flex h-screen overflow-hidden">
            <AppSidebar />
            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
              <AppHeader />
              <main>
                <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}
