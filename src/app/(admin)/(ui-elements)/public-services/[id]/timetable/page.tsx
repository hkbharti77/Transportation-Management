"use client";

import React, { useState, useEffect, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter, useParams } from "next/navigation";
import { publicService, TimetableEntry } from "@/services/publicService";
import toast from "react-hot-toast";
import { ChevronLeftIcon } from "@/icons";

export default function ServiceTimetablePage() {
  const router = useRouter();
  const params = useParams();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimetable = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const timetableData = await publicService.getTimetable(parseInt(params.id as string));
      setTimetable(timetableData);
      
      // Show a message if no timetable data is available
      if (timetableData.length === 0) {
        toast("No timetable data available for this service", { 
          icon: 'ℹ️',
          duration: 5000
        });
      }
    } catch (error: unknown) {
      console.error("Error fetching timetable:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch timetable";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchTimetable();
    }
  }, [fetchTimetable]);

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6">
          <Button 
            onClick={() => router.back()} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <ComponentCard title="">
          <div className="text-center py-12">
            <div className="flex justify-center">
              <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Loading timetable...
            </p>
          </div>
        </ComponentCard>
      </div>
    );
  }

  // Group timetable entries by day of week
  const groupedTimetable: Record<string, TimetableEntry[]> = {};
  timetable.forEach(entry => {
    if (!groupedTimetable[entry.day_of_week]) {
      groupedTimetable[entry.day_of_week] = [];
    }
    groupedTimetable[entry.day_of_week].push(entry);
  });

  // Days of the week in order
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6">
        <Button 
          onClick={() => router.back()} 
          className="flex items-center gap-2"
          variant="outline"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Service
        </Button>
      </div>

      <div className="mb-6">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Service Timetable
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Weekly schedule for this service
        </p>
      </div>

      {error ? (
        <ComponentCard title="">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Error Loading Timetable
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button 
              onClick={fetchTimetable}
              className="flex items-center gap-2 mx-auto"
            >
              Retry
            </Button>
          </div>
        </ComponentCard>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {daysOfWeek.map(day => {
            const entries = groupedTimetable[day] || [];
            return (
              <ComponentCard key={day} title={day}>
                {entries.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400">No scheduled service</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entries.map((entry, index) => (
                      <div 
                        key={index} 
                        className={`rounded-lg p-4 ${
                          entry.is_active 
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                            : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-black dark:text-white">
                              {entry.departure_time} - {entry.arrival_time}
                            </p>
                          </div>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              entry.is_active 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                            }`}
                          >
                            {entry.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ComponentCard>
            );
          })}
        </div>
      )}
      
      {/* Show a message when no timetable data is available */}
      {!error && timetable.length === 0 && (
        <ComponentCard title="">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              No Timetable Data Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              This service may not have a timetable configured yet.
            </p>
            <Button 
              onClick={fetchTimetable}
              className="flex items-center gap-2 mx-auto"
            >
              Refresh
            </Button>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}