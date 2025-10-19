import React from "react";
import { RouteOptimizationHistory } from "@/services/routeOptimizationService";

interface OptimizationHistoryCardProps {
  optimizations: RouteOptimizationHistory[];
  routeName?: string;
}

const OptimizationHistoryCard: React.FC<OptimizationHistoryCardProps> = ({ optimizations, routeName }) => {
  // Function to determine optimization status color
  const getOptimizationStatusColor = (original: number, optimized: number) => {
    const diff = original - optimized;
    if (diff > 0) return "text-green-600 dark:text-green-400";
    if (diff < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  // Function to format factors considered
  const formatFactorsConsidered = (factors: unknown) => {
    if (!factors) return "N/A";
    
    if (typeof factors === 'object' && factors !== null) {
      const factorsObj = factors as Record<string, unknown>;
      if ('factors_used' in factorsObj && Array.isArray(factorsObj.factors_used)) {
        return factorsObj.factors_used.join(", ");
      }
      return Object.entries(factorsObj)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    }
    
    return String(factors);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {routeName ? `Optimization History - ${routeName}` : "Optimization History"}
        </h2>
      </div>
      
      {optimizations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Distance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Factors
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {optimizations.map((optimization, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {optimization.optimization_type}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <span>{optimization.optimized_time} min</span>
                      <span className={`ml-2 ${getOptimizationStatusColor(optimization.original_time, optimization.optimized_time)}`}>
                        ({optimization.original_time - optimization.optimized_time > 0 ? '-' : '+'}
                        {Math.abs(optimization.original_time - optimization.optimized_time)} min)
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <span>{optimization.optimized_distance} km</span>
                      <span className={`ml-2 ${getOptimizationStatusColor(optimization.original_distance, optimization.optimized_distance)}`}>
                        ({optimization.original_distance - optimization.optimized_distance > 0 ? '-' : '+'}
                        {Math.abs(optimization.original_distance - optimization.optimized_distance)} km)
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <span>₹{optimization.optimized_cost}</span>
                      <span className={`ml-2 ${getOptimizationStatusColor(optimization.original_cost, optimization.optimized_cost)}`}>
                        ({optimization.original_cost - optimization.optimized_cost > 0 ? '-' : '+'}
                        ₹{Math.abs(optimization.original_cost - optimization.optimized_cost)})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${optimization.confidence_score * 100}%` }}
                        ></div>
                      </div>
                      <span>{(optimization.confidence_score * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs">
                    <div className="truncate" title={formatFactorsConsidered(optimization.factors_considered)}>
                      {formatFactorsConsidered(optimization.factors_considered)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(optimization.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No optimization history available
          </p>
        </div>
      )}
      
      {optimizations.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">Alternative Routes</h3>
          {optimizations.some(opt => opt.alternative_routes && opt.alternative_routes.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {optimizations.map((optimization, index) => (
                optimization.alternative_routes && optimization.alternative_routes.length > 0 ? (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                      {optimization.optimization_type} Optimization
                    </h4>
                    <div className="space-y-2">
                      {optimization.alternative_routes.map((altRoute, altIndex) => (
                        <div key={altIndex} className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                          <div className="flex justify-between">
                            <span className="font-medium">Route #{altRoute.route_id}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {altRoute.time} min
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{altRoute.distance} km</span>
                            <span className="font-medium">₹{altRoute.cost}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No alternative routes available
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default OptimizationHistoryCard;