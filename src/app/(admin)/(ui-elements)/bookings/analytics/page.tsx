'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';

interface BookingAnalytics {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  confirmationRate: number;
  cancellationRate: number;
  topRoutes: { route: string; bookingCount: number; revenue: number }[];
  paymentAnalysis: { method: string; count: number; revenue: number }[];
  monthlyTrends: { month: string; bookings: number; revenue: number }[];
  customerSatisfaction: {
    averageRating: number;
    totalReviews: number;
    repeatCustomers: number;
  };
  peakHours: { hour: string; bookings: number }[];
}

export default function BookingAnalyticsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<BookingAnalytics | null>(null);
  const [dateRange, setDateRange] = useState('30'); // Last 30 days

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Mock analytics data
      setTimeout(() => {
        const mockData: BookingAnalytics = {
          totalBookings: 234,
          confirmedBookings: 187,
          cancelledBookings: 28,
          completedBookings: 165,
          totalRevenue: 89750.00,
          averageBookingValue: 383.33,
          confirmationRate: 79.91,
          cancellationRate: 11.97,
          topRoutes: [
            { route: "Mumbai → Pune", bookingCount: 42, revenue: 18900.00 },
            { route: "Delhi → Jaipur", bookingCount: 38, revenue: 15960.00 },
            { route: "Chennai → Bangalore", bookingCount: 35, revenue: 22750.00 },
            { route: "Kolkata → Bhubaneswar", bookingCount: 28, revenue: 14560.00 },
            { route: "Hyderabad → Vijayawada", bookingCount: 24, revenue: 9840.00 }
          ],
          paymentAnalysis: [
            { method: "Credit Card", count: 156, revenue: 59820.00 },
            { method: "Debit Card", count: 78, revenue: 29930.00 },
            { method: "UPI/Digital Wallet", count: 45, revenue: 17200.00 },
            { method: "Net Banking", count: 23, revenue: 8800.00 }
          ],
          monthlyTrends: [
            { month: "Jan", bookings: 58, revenue: 22340.00 },
            { month: "Feb", bookings: 52, revenue: 19850.00 },
            { month: "Mar", bookings: 67, revenue: 25670.00 },
            { month: "Apr", bookings: 57, revenue: 21890.00 }
          ],
          customerSatisfaction: {
            averageRating: 4.4,
            totalReviews: 178,
            repeatCustomers: 89
          },
          peakHours: [
            { hour: "06:00", bookings: 28 },
            { hour: "08:00", bookings: 45 },
            { hour: "10:00", bookings: 32 },
            { hour: "14:00", bookings: 38 },
            { hour: "18:00", bookings: 52 },
            { hour: "20:00", bookings: 39 }
          ]
        };

        setAnalyticsData(mockData);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadAnalyticsData();
    }
  }, [isAuthenticated, user, dateRange]);

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  if (isLoading || !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Booking Analytics" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Booking Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive analytics and insights for booking management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          <Button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-6 py-3 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/40 hover:border-green-500 dark:hover:border-green-500 hover:scale-105 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">🎫</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.totalBookings}</p>
            <p className="text-xs text-green-600 mt-1">+15% from last period</p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">${analyticsData.totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-green-600 mt-1">+12% from last period</p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">📈</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Booking Value</p>
            <p className="text-2xl font-bold text-blue-600">${analyticsData.averageBookingValue.toFixed(2)}</p>
            <p className="text-xs text-green-600 mt-1">+7% from last period</p>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Confirmation Rate</p>
            <p className="text-2xl font-bold text-purple-600">{analyticsData.confirmationRate.toFixed(1)}%</p>
            <p className="text-xs text-green-600 mt-1">+3% from last period</p>
          </div>
        </ComponentCard>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Booking Status Distribution">
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-gray-900 dark:text-white">Confirmed</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-600">{analyticsData.confirmedBookings}</span>
                  <span className="text-sm text-gray-500 ml-2">({analyticsData.confirmationRate.toFixed(1)}%)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-900 dark:text-white">Completed</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-600">{analyticsData.completedBookings}</span>
                  <span className="text-sm text-gray-500 ml-2">({(analyticsData.completedBookings/analyticsData.totalBookings*100).toFixed(1)}%)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-gray-900 dark:text-white">Cancelled</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-red-600">{analyticsData.cancelledBookings}</span>
                  <span className="text-sm text-gray-500 ml-2">({analyticsData.cancellationRate.toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Customer Insights">
          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">{analyticsData.customerSatisfaction.averageRating}</div>
              <p className="text-gray-600 dark:text-gray-400">Average Rating</p>
              <p className="text-sm text-gray-500">Based on {analyticsData.customerSatisfaction.totalReviews} reviews</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analyticsData.customerSatisfaction.repeatCustomers}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Repeat Customers</p>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {((analyticsData.customerSatisfaction.repeatCustomers / analyticsData.totalBookings) * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loyalty Rate</p>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Top Performing Routes */}
      <ComponentCard title="Top Performing Routes">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Route</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Bookings</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Revenue</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Avg Revenue/Booking</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topRoutes.map((route, index) => (
                  <tr key={route.route} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">#{index + 1}</Badge>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{route.route}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{route.bookingCount}</td>
                    <td className="py-3 px-4 text-green-600 font-semibold">${route.revenue.toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      ${(route.revenue / route.bookingCount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ComponentCard>

      {/* Payment Methods Analysis */}
      <ComponentCard title="Payment Methods Performance">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analyticsData.paymentAnalysis.map((method, index) => {
              const colors = ['blue', 'green', 'purple', 'orange'];
              const color = colors[index] || 'gray';
              return (
                <div key={method.method} className={`bg-${color}-50 dark:bg-${color}-900/20 p-4 rounded-lg border-2 border-${color}-200 dark:border-${color}-800`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{method.method}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Bookings:</span>
                      <span className={`font-bold text-${color}-600`}>{method.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Revenue:</span>
                      <span className={`font-bold text-${color}-600`}>${method.revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Share:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {((method.count / analyticsData.totalBookings) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ComponentCard>

      {/* Peak Booking Hours */}
      <ComponentCard title="Peak Booking Hours">
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {analyticsData.peakHours.map((hour) => (
              <div key={hour.hour} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">{hour.hour}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{hour.bookings}</p>
                <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(hour.bookings / Math.max(...analyticsData.peakHours.map(h => h.bookings))) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ComponentCard>

      {/* Monthly Trends */}
      <ComponentCard title="Monthly Performance Trends">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {analyticsData.monthlyTrends.map((month) => (
              <div key={month.month} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">{month.month} 2024</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{month.bookings}</p>
                <p className="text-xs text-green-600">${month.revenue.toFixed(0)}k</p>
                <p className="text-xs text-gray-500 mt-1">
                  ${(month.revenue / month.bookings).toFixed(0)} avg
                </p>
              </div>
            ))}
          </div>
        </div>
      </ComponentCard>

      {/* Insights and Recommendations */}
      <ComponentCard title="Key Insights & Recommendations">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📈 Key Insights
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                Chennai → Bangalore route has highest revenue per booking at ${analyticsData.topRoutes.find(r => r.route.includes('Chennai'))?.revenue! / analyticsData.topRoutes.find(r => r.route.includes('Chennai'))?.bookingCount!}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Credit cards account for {((analyticsData.paymentAnalysis.find(p => p.method === 'Credit Card')?.count || 0) / analyticsData.totalBookings * 100).toFixed(1)}% of bookings
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                Peak booking time is 18:00 with {Math.max(...analyticsData.peakHours.map(h => h.bookings))} bookings
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                {analyticsData.customerSatisfaction.repeatCustomers} repeat customers show strong loyalty
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              💡 Recommendations
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                Expand premium routes like Chennai → Bangalore for higher margins
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                Offer UPI/Digital wallet incentives to reduce payment processing costs
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">✓</span>
                Optimize booking system capacity during 18:00 peak hours
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                Implement loyalty program to increase repeat customer percentage
              </li>
            </ul>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}