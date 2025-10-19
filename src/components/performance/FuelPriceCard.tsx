import React from "react";
import { FuelPrice } from "@/services/routeOptimizationService";

interface FuelPriceCardProps {
  fuelPrices: FuelPrice[];
  routeName?: string;
}

const FuelPriceCard: React.FC<FuelPriceCardProps> = ({ fuelPrices, routeName }) => {
  // Group fuel prices by fuel type
  const groupedFuelPrices = fuelPrices.reduce((acc, fuelPrice) => {
    if (!acc[fuelPrice.fuel_type]) {
      acc[fuelPrice.fuel_type] = [];
    }
    acc[fuelPrice.fuel_type].push(fuelPrice);
    return acc;
  }, {} as Record<string, FuelPrice[]>);

  // Get latest fuel price for each fuel type
  const latestFuelPrices = Object.keys(groupedFuelPrices).map(fuelType => {
    const prices = groupedFuelPrices[fuelType];
    // Sort by timestamp descending to get the latest
    prices.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return prices[0];
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {routeName ? `Fuel Prices - ${routeName}` : "Fuel Prices"}
        </h2>
      </div>
      
      {latestFuelPrices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {latestFuelPrices.map((fuelPrice, index) => (
            <div 
              key={index} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-800 dark:text-white capitalize">
                  {fuelPrice.fuel_type}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(fuelPrice.timestamp).toLocaleDateString()}
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                ₹{fuelPrice.price_per_liter.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {fuelPrice.location}
              </p>
              {fuelPrice.raw_data && typeof fuelPrice.raw_data === 'object' && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Source: {String((fuelPrice.raw_data as Record<string, unknown>).source || 'N/A')}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No fuel price data available
          </p>
        </div>
      )}
      
      {fuelPrices.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">Historical Data</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fuel Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price (₹/L)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {fuelPrices.map((fuelPrice, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {fuelPrice.fuel_type}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ₹{fuelPrice.price_per_liter.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {fuelPrice.location}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(fuelPrice.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelPriceCard;