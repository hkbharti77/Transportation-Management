"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PlugInIcon,
  UserCircleIcon,
  BoxIcon,
  TaskIcon,
  ArrowRightIcon,
  DollarLineIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// ======================= Admin Sidebar =======================
const adminSidebar: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [
      { name: "Overview", path: "/admin/overview", pro: false },
      { name: "Analytics", path: "/analytics", pro: false },
      { name: "System Health", path: "/admin/health", pro: false },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "User Management",
    subItems: [
      { name: "All Users", path: "/users", pro: false },
      { name: "Customers", path: "/customers", pro: false },
      { name: "Drivers", path: "/drivers", pro: false },
      { name: "Transporters", path: "/transporters", pro: false },
      { name: "Public Service Managers", path: "/public-managers", pro: false },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Profile",
    subItems: [
      { name: "My Profile", path: "/profile", pro: false },
      { name: "Settings", path: "/profile/settings", pro: false },
    ],
  },
  {
    icon: <BoxIcon />,
    name: "Fleet Management",
    subItems: [
      { name: "Fleets", path: "/fleets", pro: false },
      { name: "Trucks", path: "/trucks", pro: false },
      { name: "Vehicles", path: "/vehicles", pro: false },
      { name: "Fleet Drivers", path: "/fleet-drivers", pro: false },
      { name: "Maintenance", path: "/maintenance", pro: false },
      { name: "Service Management", path: "/fleet-management/services", pro: false },
      { name: "Parts Inventory", path: "/parts", pro: false },
    ],
  },
  {
    icon: <TaskIcon />,
    name: "Order Management",
    subItems: [
      { name: "Order Dashboard", path: "/orders/dashboard", pro: false },
      { name: "All Orders", path: "/orders", pro: false },
      { name: "Create Order", path: "/orders/create", pro: false },
      { name: "Active Orders", path: "/orders/active", pro: false },
      { name: "Completed Orders", path: "/orders/completed", pro: false },
      { name: "Pending Orders", path: "/orders/pending", pro: false },
      { name: "Cancelled Orders", path: "/orders/cancelled", pro: false },
      { name: "Order Analytics", path: "/orders/analytics", pro: false },
      { name: "Popular Routes", path: "/orders/routes", pro: false },
      { name: "Order Tracking", path: "/orders/tracking", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Booking Management",
    subItems: [
      { name: "Booking Dashboard", path: "/bookings/dashboard", pro: false },
      { name: "All Bookings (Admin)", path: "/bookings/all", pro: false },
      { name: "My Bookings", path: "/bookings", pro: false },
      { name: "New Booking", path: "/bookings/new", pro: false },
      { name: "Confirmed Bookings", path: "/bookings/confirmed", pro: false },
      { name: "Cancelled Bookings", path: "/bookings/cancelled", pro: false },
      { name: "Booking Analytics", path: "/bookings/analytics", pro: false },
      { name: "Revenue Analytics", path: "/bookings/revenue", pro: false, new: true },
      { name: "Peak Hours Analytics", path: "/bookings/peak-hours", pro: false, new: true },
      { name: "Public Services", path: "/public-services", pro: false },
      { name: "Tickets", path: "/tickets", pro: false },
      { name: "API Endpoints Test", path: "/bookings/endpoints", pro: false, new: true },
    ],
  },
  {
    icon: <DollarLineIcon />,
    name: "Payment Management",
    subItems: [
      { name: "Payment Dashboard", path: "/payments/dashboard", pro: false },
      { name: "Payment Management", path: "/bookings/payments", pro: false },
      { name: "Invoice Management", path: "/bookings/invoices", pro: false },
      { name: "Generate Invoice", path: "/bookings/generate-invoice", pro: false },
      { name: "Generate Invoice PDF", path: "/bookings/generate-invoice-pdf", pro: false },
      { name: "Process Payment", path: "/bookings/process-payment", pro: false },
      { name: "Payment Statistics", path: "/bookings/statistics", pro: false },
      { name: "Payment Methods", path: "/bookings/payment-methods", pro: false },
      { name: "Payment Statuses", path: "/bookings/payment-statuses", pro: false },
      { name: "Invoice Statuses", path: "/bookings/invoice-statuses", pro: false },
      { name: "Search Payments/Invoices", path: "/bookings/search", pro: false },
      { name: "Refund Processing", path: "/bookings/refunds", pro: false },
      { name: "Create Payment", path: "/bookings/create-payment", pro: false },
      { name: "Bulk Operations", path: "/bookings/bulk", pro: false },
      { name: "Export Payments/Invoices", path: "/bookings/export", pro: false },
      { name: "Payment API Test", path: "/bookings/payment-endpoint", pro: false },
      { name: "Payment Detail API Test", path: "/bookings/payment-detail-endpoint", pro: false },
      { name: "User Payments API Test", path: "/bookings/user-payments-endpoint", pro: false },
      { name: "Booking Payments API Test", path: "/bookings/booking-payments-endpoint", pro: false },
      { name: "Webhook Test", path: "/bookings/webhook-test", pro: false },
    ],
  },
  {
    icon: <TaskIcon />,
    name: "Dispatch Management",
    subItems: [
      { name: "All Dispatches", path: "/dispatches/all", pro: false },
      { name: "Create Dispatch", path: "/dispatches/new", pro: false },
      { name: "Pending Dispatches", path: "/dispatches/pending", pro: false },
      { name: "Active Dispatches", path: "/dispatches/active", pro: false },
      { name: "Completed Dispatches", path: "/dispatches/completed", pro: false },
      { name: "Driver Dispatches", path: "/dispatches/drivers", pro: false },
      { name: "Available Drivers", path: "/dispatches/available-drivers", pro: false, new: true },
      { name: "Booking Dispatch Lookup", path: "/dispatches/booking", pro: false },
      { name: "Enhanced Dispatch Details", path: "/dispatches/enhanced", pro: false, new: true },
      { name: "Dispatch Analytics", path: "/dispatches/analytics", pro: false },
      { name: "API Endpoints Test", path: "/dispatches/test", pro: false, new: true },
      { name: "System Diagnostics", path: "/dispatches/debug", pro: false, new: true },
    ],
  },
  {
    icon: <ArrowRightIcon />,
    name: "Trip Management",
    subItems: [
      { name: "Trip Dashboard", path: "/trips/dashboard", pro: false },
      { name: "All Trips", path: "/trips", pro: false },
      { name: "Create Trip", path: "/trips/create", pro: false },
      { name: "Scheduled Trips", path: "/trips/scheduled", pro: false },
      { name: "Active Trips", path: "/trips/active", pro: false },
      { name: "Completed Trips", path: "/trips/completed", pro: false },
      { name: "Trip Analytics", path: "/trips/analytics", pro: false },
      { name: "Passenger Bookings", path: "/bookings", pro: false },
    ],
  },
  {
    icon: <ListIcon />,
    name: "Route Management",
    subItems: [
      { name: "All Routes", path: "/routes", pro: false },
      { name: "Create Route", path: "/routes/create", pro: false },
      { name: "Active Routes", path: "/routes?status=active", pro: false },
      { name: "Route Analytics", path: "/routes/analytics", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Public Services",
    subItems: [
      { name: "All Services", path: "/public-services", pro: false },
      { name: "Create Service", path: "/public-services/create", pro: false },
      { name: "Active Services", path: "/public-services?status=active", pro: false },
      { name: "Service Analytics", path: "/public-services/analytics", pro: false },
      { name: "Service Statistics", path: "/public-services/statistics", pro: false },
      { name: "Bulk Status Update", path: "/public-services/bulk-status", pro: false },
      { name: "Seat Availability", path: "/public-services/availability", pro: false },
      { name: "My Tickets", path: "/public-services/tickets", pro: false },
      { name: "All Tickets (Admin)", path: "/public-services/admin/tickets", pro: false },
      { name: "Search Tickets", path: "/public-services/tickets/search", pro: false },
      { name: "User Tickets", path: "/public-services/tickets/user", pro: false },
      { name: "Search Routes", path: "/public-services/search", pro: false }
    ]
  }
]

// ======================= Customer Sidebar =======================
const customerSidebar: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [
      { name: "My Dashboard", path: "/dashboard", pro: false },
      { name: "Recent Bookings", path: "/bookings", pro: false },
      { name: "My Orders", path: "/orders", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Book Services",
    subItems: [
      { name: "Book Cargo Transport", path: "/book-cargo", pro: false },
      { name: "Public Transport", path: "/public-transport", pro: false },
      { name: "Book Ticket", path: "/book-ticket", pro: false },
    ],
  },
  {
    icon: <ArrowRightIcon />,
    name: "Tracking",
    subItems: [
      { name: "Track Shipment", path: "/track", pro: false },
      { name: "Booking Details", path: "/booking-details", pro: false },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Account",
    subItems: [
      { name: "My Profile", path: "/profile", pro: false },
      { name: "Payment History", path: "/payments", pro: false },
      { name: "Invoices", path: "/invoices", pro: false },
      { name: "Notifications", path: "/notifications", pro: false },
    ],
  },
];

// ======================= Driver Sidebar =======================
const driverSidebar: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/driver-home",
  },
  {
    icon: <TaskIcon />,
    name: "Work",
    subItems: [
      { name: "My Dashboard", path: "/driver-dashboard", pro: false },
      { name: "Assigned Orders", path: "/driver-dashboard#orders", pro: false },
      { name: "Active Trips", path: "/driver-dashboard#trips", pro: false },
      { name: "Trip History", path: "/driver-dashboard#history", pro: false },
    ],
  },
  {
    icon: <BoxIcon />,
    name: "Fleet",
    subItems: [
      { name: "My Vehicle", path: "/driver-dashboard#vehicle", pro: false },
      { name: "Vehicle Directory", path: "/vehicle-directory", pro: false },
      { name: "Vehicle Status", path: "/vehicle-status", pro: false },
      { name: "Maintenance", path: "/maintenance", pro: false },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Account",
    subItems: [
      { name: "My Profile", path: "/driver-profile", pro: false },
      { name: "Notifications", path: "/notifications", pro: false },
      { name: "Settings", path: "/settings", pro: false },
    ],
  },
];



// Helper function to determine user role based on pathname
const getUserRole = (pathname: string): "admin" | "customer" | "driver" => {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/driver") || pathname === "/driver-dashboard" || pathname === "/driver-home") return "driver";
  if (pathname.startsWith("/customer") || pathname === "/dashboard") return "customer";
  return "admin"; // Default to admin instead of "default"
};

// Helper function to get sidebar items based on role
const getSidebarItems = (role: "admin" | "customer" | "driver"): NavItem[] => {
  switch (role) {
    case "admin":
      return adminSidebar;
    case "customer":
      return customerSidebar;
    case "driver":
      return driverSidebar;
  }
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  
  // Determine user role and get appropriate sidebar items
  const userRole = getUserRole(pathname);
  const navItems = getSidebarItems(userRole);

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
   const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({
              type: "main",
              index,
            });
            submenuMatched = true;
          }
        });
      }
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive, navItems]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
                style={{ width: 'auto', height: 'auto' }}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
                style={{ width: 'auto', height: 'auto' }}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
              style={{ width: 'auto', height: 'auto' }}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Menu`
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>


          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
