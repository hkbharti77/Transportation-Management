"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
  UserIcon,
  BoxIcon,
  TaskIcon,
  BellIcon,
  TimeIcon,
  DollarLineIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  AlertIcon,
  FileIcon,
  GroupIcon,
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
      { name: "Analytics", path: "/admin/analytics", pro: false },
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
      { name: "Parts Inventory", path: "/parts", pro: false },
    ],
  },
  {
    icon: <TaskIcon />,
    name: "Orders & Bookings",
    subItems: [
      { name: "Active Orders", path: "/orders/active", pro: false },
      { name: "Completed Orders", path: "/orders/completed", pro: false },
      { name: "Pending Requests", path: "/orders/pending", pro: false },
      { name: "All Bookings", path: "/bookings", pro: false },
      { name: "Public Services", path: "/public-services", pro: false },
      { name: "Tickets", path: "/tickets", pro: false },
    ],
  },
];

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
    icon: <TaskIcon />,
    name: "Work",
    subItems: [
      { name: "Assigned Orders", path: "/orders", pro: false },
      { name: "Active Trips", path: "/trips", pro: false },
      { name: "Trip History", path: "/trip-history", pro: false },
    ],
  },
  {
    icon: <BoxIcon />,
    name: "Vehicle",
    subItems: [
      { name: "My Vehicle", path: "/vehicle", pro: false },
      { name: "Vehicle Status", path: "/vehicle-status", pro: false },
      { name: "Maintenance", path: "/maintenance", pro: false },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Account",
    subItems: [
      { name: "My Profile", path: "/profile", pro: false },
      { name: "Notifications", path: "/notifications", pro: false },
      { name: "Settings", path: "/settings", pro: false },
    ],
  },
];



// Helper function to determine user role based on pathname
const getUserRole = (pathname: string): "admin" | "customer" | "driver" => {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/driver")) return "driver";
  if (pathname.startsWith("/customer") || pathname.startsWith("/dashboard")) return "customer";
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
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
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
