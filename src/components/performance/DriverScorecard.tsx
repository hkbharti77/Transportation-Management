import React from "react";
import { DriverScorecard } from "@/services/performanceService";

interface DriverScorecardProps {
  scorecard: DriverScorecard;
}

const DriverScorecardComponent: React.FC<DriverScorecardProps> = ({ scorecard }) => {
  // Function to determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  // Function to determine progress bar color
  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Driver Performance Scorecard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Score */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Overall Performance</h3>
            <span className={`text-3xl font-bold ${getScoreColor(scorecard.overall_score)}`}>
              {scorecard.overall_score}<span className="text-lg">/100</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
            <div 
              className={`h-4 rounded-full ${getProgressColor(scorecard.overall_score)}`} 
              style={{ width: `${scorecard.overall_score}%` }}
            ></div>
          </div>
        </div>
        
        {/* Individual Scores */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-800 dark:text-white">Safety Score</h3>
            <span className={`font-bold ${getScoreColor(scorecard.safety_score)}`}>
              {scorecard.safety_score}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className={`h-2 rounded-full ${getProgressColor(scorecard.safety_score)}`} 
              style={{ width: `${scorecard.safety_score}%` }}
            ></div>
          </div>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-800 dark:text-white">Punctuality</h3>
            <span className={`font-bold ${getScoreColor(scorecard.punctuality_score)}`}>
              {scorecard.punctuality_score}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className={`h-2 rounded-full ${getProgressColor(scorecard.punctuality_score)}`} 
              style={{ width: `${scorecard.punctuality_score}%` }}
            ></div>
          </div>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-800 dark:text-white">Fuel Efficiency</h3>
            <span className={`font-bold ${getScoreColor(scorecard.fuel_efficiency_score)}`}>
              {scorecard.fuel_efficiency_score}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className={`h-2 rounded-full ${getProgressColor(scorecard.fuel_efficiency_score)}`} 
              style={{ width: `${scorecard.fuel_efficiency_score}%` }}
            ></div>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Driving Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Trips</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{scorecard.total_trips}</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Distance</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{scorecard.total_distance.toFixed(1)} km</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Speed</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{scorecard.average_speed.toFixed(1)} km/h</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Time</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {Math.floor(scorecard.total_time / 3600)}h {Math.floor((scorecard.total_time % 3600) / 60)}m
              </p>
            </div>
          </div>
        </div>
        
        {/* Behavior Events */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Behavior Events</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Harsh Braking</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{scorecard.harsh_braking_count}</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Speeding</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{scorecard.speeding_count}</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone Usage</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{scorecard.phone_usage_count}</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Hard Accel</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{scorecard.hard_acceleration_count}</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Hard Turns</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{scorecard.hard_turn_count}</p>
            </div>
          </div>
        </div>
        
        {/* Idling Time */}
        <div className="md:col-span-2 mt-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-800 dark:text-white">Idling Time</h3>
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                {Math.floor(scorecard.idling_time / 60)}m {scorecard.idling_time % 60}s
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total time spent idling
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverScorecardComponent;