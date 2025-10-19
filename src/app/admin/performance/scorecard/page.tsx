"use client";
import React, { useEffect, useState } from "react";
import { performanceService, DriverScorecard } from "@/services/performanceService";
import { driverService, Driver } from "@/services/driverService";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DriverScorecardComponent from "@/components/performance/DriverScorecard";

const DriverScorecardPage = () => {
  const [driverScorecard, setDriverScorecard] = useState<DriverScorecard | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch driver scorecard and driver info in parallel
        const [scorecard, driverData] = await Promise.all([
          performanceService.getDriverScorecard(3),
          driverService.getDriverById(3)
        ]);
        
        setDriverScorecard(scorecard);
        setDriver(driverData);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching driver scorecard:", err);
        setError("Failed to load driver scorecard. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading driver scorecard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <PageBreadcrumb pageTitle="Driver Scorecard" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Driver Scorecard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Detailed performance metrics for driver {driver?.user_id || 'N/A'}
        </p>
      </div>

      {driverScorecard ? (
        <DriverScorecardComponent scorecard={driverScorecard} />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-800 dark:text-white">No scorecard data available</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Driver scorecard data is not available at this time.
          </p>
        </div>
      )}
    </div>
  );
};

export default DriverScorecardPage;