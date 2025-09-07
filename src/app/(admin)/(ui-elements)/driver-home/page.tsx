"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import DriverStatsSummary from "@/components/ecommerce/DriverStatsSummary";
import { 
  BoxIcon,
  TaskIcon, 
  UserIcon,
  CalenderIcon,
  TimeIcon,
  LocationIcon,
  TruckIcon,
  AlertIcon,
  CheckCircleIcon
} from "@/icons";

// Mock data interfaces for driver home dashboard
interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  color: string;
}

interface RecentActivity {
  id: number;
  type: 'order' | 'trip' | 'maintenance' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

interface UpcomingTask {
  id: number;
  type: 'delivery' | 'pickup' | 'maintenance' | 'inspection';
  title: string;
  location: string;
  scheduledTime: string;
  priority: 'high' | 'medium' | 'low';
}

export default function DriverHomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // States
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication and authorization check
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    // Only allow drivers to access this dashboard
    if (user?.role !== 'driver') {
      // Redirect non-drivers to appropriate dashboard
      if (user?.role === 'admin') {
        router.push('/');
      } else if (user?.role === 'customer') {
        router.push('/dashboard');
      } else {
        router.push('/signin');
      }
      return;
    }

    // Load driver dashboard data
    loadDashboardData();
  }, [isAuthenticated, user, isLoading, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data - replace with actual API calls
      const mockActivities: RecentActivity[] = [
        {
          id: 1,
          type: 'order',
          title: 'Order #ORD-2024-123 Completed',
          description: 'Successfully delivered to Mumbai Central',
          timestamp: '2024-09-05T14:30:00Z',
          status: 'completed'
        },
        {
          id: 2,
          type: 'trip',
          title: 'Trip Started',
          description: 'Route: Delhi → Gurgaon (45 km)',
          timestamp: '2024-09-05T12:00:00Z',
          status: 'in_progress'
        },
        {
          id: 3,
          type: 'notification',
          title: 'Vehicle Maintenance Due',
          description: 'TRK-001 requires scheduled maintenance',
          timestamp: '2024-09-05T09:15:00Z',
          status: 'pending'
        },
        {
          id: 4,
          type: 'order',
          title: 'New Order Assigned',
          description: 'Order #ORD-2024-124 - Pickup from Factory',
          timestamp: '2024-09-05T08:00:00Z',
          status: 'assigned'
        }
      ];

      const mockTasks: UpcomingTask[] = [
        {
          id: 1,
          type: 'pickup',
          title: 'Cargo Pickup - ABC Industries',
          location: 'Sector 18, Gurgaon',
          scheduledTime: '2024-09-06T09:00:00Z',
          priority: 'high'
        },
        {
          id: 2,
          type: 'delivery',
          title: 'Delivery - XYZ Corporation',
          location: 'Connaught Place, Delhi',
          scheduledTime: '2024-09-06T14:00:00Z',
          priority: 'medium'
        },
        {
          id: 3,
          type: 'maintenance',
          title: 'Vehicle Inspection',
          location: 'Main Depot',
          scheduledTime: '2024-09-07T11:00:00Z',
          priority: 'low'
        }
      ];

      setRecentActivities(mockActivities);
      setUpcomingTasks(mockTasks);

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'orders',
      title: 'View My Orders',
      description: 'Check assigned orders and deliveries',
      icon: <TaskIcon className="h-6 w-6" />,
      action: '/driver-dashboard',
      color: 'blue'
    },
    {
      id: 'vehicle',
      title: 'Vehicle Status',
      description: 'Check vehicle information and status',
      icon: <TruckIcon className="h-6 w-6" />,
      action: '/vehicle-directory',
      color: 'green'
    },
    {
      id: 'profile',
      title: 'My Profile',
      description: 'Update personal information',
      icon: <UserIcon className="h-6 w-6" />,
      action: '/driver-profile',
      color: 'purple'
    },
    {
      id: 'schedule',
      title: 'Today\'s Schedule',
      description: 'View today\'s trips and tasks',
      icon: <CalenderIcon className="h-6 w-6" />,
      action: '/driver-dashboard#trips',
      color: 'orange'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <TaskIcon className="h-4 w-4" />;
      case 'trip':
        return <LocationIcon className="h-4 w-4" />;
      case 'maintenance':
        return <TruckIcon className="h-4 w-4" />;
      case 'notification':
        return <AlertIcon className="h-4 w-4" />;
      default:
        return <AlertIcon className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'trip':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'maintenance':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'notification':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center">
            <AlertIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
          </div>
          <Button className="mt-4" onClick={loadDashboardData}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name || 'Driver'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's your dashboard overview for today
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CalenderIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Driver Statistics */}
      <DriverStatsSummary userRole={user?.role} />

      {/* Quick Actions */}
      <ComponentCard title="Quick Actions" className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              onClick={() => router.push(action.action)}
              className="h-auto p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
            >
              <div className={`p-3 rounded-lg mb-3 ${
                action.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                action.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                action.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
              }`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {action.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {action.description}
              </p>
            </Button>
          ))}
        </div>
      </ComponentCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <ComponentCard title="Recent Activities" className="p-6">
          <div className="space-y-4">
            {recentActivities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {formatDate(activity.timestamp)}
                  </p>
                </div>
                {activity.status && (
                  <Badge size="sm" color={
                    activity.status === 'completed' ? 'success' :
                    activity.status === 'in_progress' ? 'info' :
                    activity.status === 'pending' ? 'warning' : 'light'
                  }>
                    {activity.status}
                  </Badge>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/driver-dashboard')}
              className="w-full"
            >
              View All Activities
            </Button>
          </div>
        </ComponentCard>

        {/* Upcoming Tasks */}
        <ComponentCard title="Upcoming Tasks" className="p-6">
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    📍 {task.location}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    ⏰ {formatDate(task.scheduledTime)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/driver-dashboard#trips')}
              className="w-full"
            >
              View Full Schedule
            </Button>
          </div>
        </ComponentCard>
      </div>

      {/* Fleet Information - Show vehicle directory access */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fleet Information</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TruckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Vehicle Directory Access
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Browse and view fleet vehicle information
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/vehicle-directory')}
              className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
            >
              View Vehicles
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}