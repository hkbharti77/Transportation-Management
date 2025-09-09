'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { bookingService, BookingPeakHours } from '@/services/bookingService';

export default function BookingPeakHoursPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [peakHoursData, setPeakHoursData] = useState<BookingPeakHours | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30'); // Last 30 days

  const loadPeakHoursData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading booking peak hours data...');
      
      // Calculate date range based on selection
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));
      
      const data = await bookingService.getBookingPeakHours(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      setPeakHoursData(data);
    } catch (error) {
      console.error('Error loading booking peak hours data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load peak hours data');
      setPeakHoursData(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadPeakHoursData();
    }
  }, [isAuthenticated, user, dateRange, loadPeakHoursData]);

  const handleRefresh = () => {
    loadPeakHoursData();
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    if (hour < 12) return `${hour}:00 AM`;
    return `${hour - 12}:00 PM`;
  };

  const getHourCategory = (hour: number) => {
    if (hour >= 6 && hour < 12) return { category: 'Morning', color: 'bg-yellow-500', textColor: 'text-yellow-900' };
    if (hour >= 12 && hour < 17) return { category: 'Afternoon', color: 'bg-orange-500', textColor: 'text-orange-900' };
    if (hour >= 17 && hour < 22) return { category: 'Evening', color: 'bg-purple-500', textColor: 'text-purple-900' };
    return { category: 'Night', color: 'bg-blue-900', textColor: 'text-blue-100' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Peak Hours Analytics" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading peak hours data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Peak Hours Analytics" />
        <ComponentCard title="Error Loading Peak Hours Data">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Failed to Load Peak Hours Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <Button
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </Button>
          </div>
        </ComponentCard>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  // Show empty state when no real data is available
  if (!peakHoursData) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Peak Hours Analytics" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ⏰ Peak Hours Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Analyze booking patterns by hour and day of the week
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
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-200 dark:hover:bg-indigo-800/40 hover:border-indigo-500 dark:hover:border-indigo-500 hover:scale-105 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </Button>
          </div>
        </div>

        {/* No Data State */}
        <ComponentCard title="No Peak Hours Data Available">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Peak Hours Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Peak hours data will appear here once bookings are made throughout different times of the day.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <Button
                onClick={() => window.location.href = '/bookings'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
              >
                View Bookings
              </Button>
              <Button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                Retry Loading
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    );
  }

  // Display peak hours data when available
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Peak Hours Analytics" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ⏰ Peak Hours Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Booking patterns from {new Date(peakHoursData.period.start_date).toLocaleDateString()} to {new Date(peakHoursData.period.end_date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-200 dark:hover:bg-indigo-800/40 hover:border-indigo-500 dark:hover:border-indigo-500 hover:scale-105 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Peak Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hour */}
        <ComponentCard title="Peak Booking Hour">
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">🕐</div>
            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              {formatHour(peakHoursData.peak_hour.hour)}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Peak booking hour
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge size="md" color="primary">
                {peakHoursData.peak_hour.booking_count} bookings
              </Badge>
              <Badge size="md" color="light">
                {getHourCategory(peakHoursData.peak_hour.hour).category}
              </Badge>
            </div>
          </div>
        </ComponentCard>

        {/* Peak Day */}
        <ComponentCard title="Peak Booking Day">
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {peakHoursData.peak_day.day}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Most popular day of the week
            </p>
            <Badge size="md" color="success">
              {peakHoursData.peak_day.booking_count} bookings
            </Badge>
          </div>
        </ComponentCard>
      </div>

      {/* Hourly Distribution */}
      <ComponentCard title="Hourly Booking Distribution">
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              24-Hour Booking Pattern
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Distribution of bookings throughout the day (showing hours with activity)
            </p>
          </div>
          
          <div className="space-y-3">
            {peakHoursData.hourly_distribution.map((item, index) => {
              const maxBookings = Math.max(...peakHoursData.hourly_distribution.map(h => h.booking_count));
              const percentage = Math.round((item.booking_count / maxBookings) * 100);
              const hourInfo = getHourCategory(item.hour);
              
              return (
                <div key={item.hour} className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-3 h-3 rounded-full ${hourInfo.color}`}></div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatHour(item.hour)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {hourInfo.category}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className={`${hourInfo.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {item.booking_count}
                      </div>
                      <div className="text-xs text-gray-500">
                        booking{item.booking_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ComponentCard>

      {/* Daily Distribution */}
      <ComponentCard title="Weekly Booking Distribution">
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Day of Week Pattern
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Distribution of bookings throughout the week
            </p>
          </div>
          
          <div className="space-y-3">
            {peakHoursData.daily_distribution.map((item, index) => {
              const maxBookings = Math.max(...peakHoursData.daily_distribution.map(d => d.booking_count));
              const percentage = Math.round((item.booking_count / maxBookings) * 100);
              
              const dayColors = {
                'Monday': 'bg-blue-500',
                'Tuesday': 'bg-green-500',
                'Wednesday': 'bg-yellow-500',
                'Thursday': 'bg-orange-500',
                'Friday': 'bg-purple-500',
                'Saturday': 'bg-pink-500',
                'Sunday': 'bg-red-500'
              };
              
              const dayEmojis = {
                'Monday': '💼',
                'Tuesday': '⚡',
                'Wednesday': '📊',
                'Thursday': '🚀',
                'Friday': '🎉',
                'Saturday': '🌞',
                'Sunday': '☕'
              };
              
              const color = dayColors[item.day as keyof typeof dayColors] || 'bg-gray-500';
              const emoji = dayEmojis[item.day as keyof typeof dayEmojis] || '📅';
              
              return (
                <div key={item.day} className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{emoji}</div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {item.day}
                      </div>
                      {item.day === peakHoursData.peak_day.day && (
                        <div className="text-xs text-green-600 font-medium">Peak Day</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className={`${color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {item.booking_count}
                      </div>
                      <div className="text-xs text-gray-500">
                        booking{item.booking_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ComponentCard>

      {/* Peak Hours Insights */}
      <ComponentCard title="Peak Hours Insights">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="text-2xl mb-2">⏰</div>
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">Peak Hour</h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                Most bookings at {formatHour(peakHoursData.peak_hour.hour)} with {peakHoursData.peak_hour.booking_count} booking{peakHoursData.peak_hour.booking_count !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl mb-2">📅</div>
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Peak Day</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                {peakHoursData.peak_day.day} is the busiest day with {peakHoursData.peak_day.booking_count} booking{peakHoursData.peak_day.booking_count !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Activity Pattern</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {peakHoursData.hourly_distribution.length} active hour{peakHoursData.hourly_distribution.length !== 1 ? 's' : ''} and {peakHoursData.daily_distribution.length} active day{peakHoursData.daily_distribution.length !== 1 ? 's' : ''} tracked
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}