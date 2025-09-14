// Role-based routing configuration
export type UserRole = 'admin' | 'driver' | 'customer' | 'dispatcher' | 'public_service_manager' | 'staff';

// Define the routes available for each role
export const roleBasedRoutes: Record<UserRole, string[]> = {
  admin: [
    '/admin/overview',
    '/analytics',
    '/admin/reports',
    '/admin/system/health',
    '/admin/system/metrics',
    '/drivers/analytics',
    '/users/analytics',
    '/users',
    '/customers',
    '/drivers',
    '/transporters',
    '/public-managers',
    '/profile',
    '/profile/settings',
    '/maintenance/analytics',
    '/fleet-management/analytics',
    '/fleets',
    '/trucks',
    '/vehicles',
    '/fleet-drivers',
    '/maintenance',
    '/fleet-management/services',
    '/parts',
    '/orders/dashboard',
    '/orders',
    '/orders/create',
    '/orders/active',
    '/orders/completed',
    '/orders/pending',
    '/orders/cancelled',
    '/orders/analytics',
    '/orders/routes',
    '/orders/tracking',
    '/tracking/dashboard',
    '/tracking/location',
    '/tracking/eta',
    '/tracking/geofences',
    '/tracking/eta/test',
    '/fleet-tracking',
    '/bookings/dashboard',
    '/bookings/all',
    '/bookings',
    '/bookings/new',
    '/bookings/confirmed',
    '/bookings/cancelled',
    '/bookings/analytics',
    '/revenue',
    '/bookings/peak-hours',
    '/public-services',
    '/tickets',
    '/bookings/endpoints',
    '/payments/dashboard',
    '/bookings/payments',
    '/bookings/invoices',
    '/bookings/generate-invoice',
    '/bookings/generate-invoice-pdf',
    '/bookings/process-payment',
    '/bookings/statistics',
    '/bookings/payment-methods',
    '/bookings/payment-statuses',
    '/bookings/invoice-statuses',
    '/bookings/search',
    '/bookings/refunds',
    '/bookings/create-payment',
    '/bookings/bulk',
    '/bookings/export',
    '/bookings/payment-endpoint',
    '/bookings/payment-detail-endpoint',
    '/bookings/user-payments-endpoint',
    '/bookings/booking-payments-endpoint',
    '/bookings/webhook-test',
    '/dispatches/all',
    '/dispatches/new',
    '/dispatches/pending',
    '/dispatches/active',
    '/dispatches/completed',
    '/dispatches/drivers',
    '/dispatches/available-drivers',
    '/dispatches/booking',
    '/dispatches/enhanced',
    '/dispatches/analytics',
    '/dispatches/test',
    '/dispatches/debug',
    '/trips/dashboard',
    '/trips',
    '/trips/create',
    '/trips/scheduled',
    '/trips/active',
    '/trips/completed',
    '/trips/analytics',
    '/routes',
    '/routes/create',
    '/routes?status=active',
    '/routes/analytics',
    '/public-services/create',
    '/public-services?status=active',
    '/public-services/analytics',
    '/public-services/statistics',
    '/public-services/bulk-status',
    '/public-services/availability',
    '/public-services/tickets',
    '/public-services/admin/tickets',
    '/public-services/tickets/search',
    '/public-services/tickets/user',
    '/public-services/search'
  ],
  driver: [
    '/driver-home',
    '/driver-dashboard',
    '/driver-dashboard#orders',
    '/driver-dashboard#trips',
    '/driver-dashboard#history',
    '/driver-dashboard#vehicle',
    '/vehicle-directory',
    '/vehicle-status',
    '/maintenance',
    '/driver-profile',
    '/notifications',
    '/settings'
  ],
  customer: [
    '/dashboard',
    '/bookings',
    '/orders',
    '/book-cargo',
    '/public-transport',
    '/book-ticket',
    '/track',
    '/booking-details',
    '/profile',
    '/payments',
    '/invoices',
    '/notifications'
  ],
  dispatcher: [
    // Dispatcher has similar access to admin but focused on dispatch operations
    '/dispatches/all',
    '/dispatches/new',
    '/dispatches/pending',
    '/dispatches/active',
    '/dispatches/completed',
    '/dispatches/drivers',
    '/dispatches/available-drivers',
    '/dispatches/booking',
    '/dispatches/enhanced',
    '/dispatches/analytics',
    '/orders',
    '/orders/create',
    '/orders/active',
    '/orders/completed',
    '/trips',
    '/trips/create',
    '/trips/scheduled',
    '/trips/active',
    '/trips/completed',
    '/vehicles',
    '/drivers',
    '/profile',
    '/notifications'
  ],
  public_service_manager: [
    // Public service manager has access to public services management
    '/dashboard',
    '/public-services',
    '/public-services/create',
    '/public-services?status=active',
    '/public-services/analytics',
    '/public-services/statistics',
    '/public-services/bulk-status',
    '/public-services/availability',
    '/public-services/tickets',
    '/public-services/admin/tickets',
    '/public-services/tickets/search',
    '/public-services/tickets/user',
    '/public-services/search',
    '/profile',
    '/notifications'
  ],
  staff: [
    // Staff has limited access to specific areas
    '/dashboard',
    '/orders',
    '/orders/active',
    '/orders/completed',
    '/trips',
    '/trips/active',
    '/trips/completed',
    '/vehicles',
    '/profile',
    '/notifications'
  ]
};

// Get routes for a specific role
export const getRoutesForRole = (role: UserRole): string[] => {
  return roleBasedRoutes[role] || [];
};

// Check if a route is accessible for a specific role
export const isRouteAccessible = (role: UserRole, route: string): boolean => {
  const routes = getRoutesForRole(role);
  return routes.includes(route) || routes.some(r => route.startsWith(r));
};

// Get default dashboard route for a role
export const getDefaultDashboardRoute = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '/admin/overview';
    case 'driver':
      return '/driver-home';
    case 'customer':
    case 'public_service_manager':
      return '/dashboard';
    case 'dispatcher':
      return '/dispatches/all';
    case 'staff':
      return '/dashboard';
    default:
      return '/';
  }
};