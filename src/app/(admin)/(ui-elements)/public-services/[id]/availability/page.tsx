"use client";

import React, { useState, useEffect, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter, useParams } from "next/navigation";
import { publicService, SeatAvailability } from "@/services/publicService";
import toast from "react-hot-toast";
import { ChevronLeftIcon } from "@/icons";

export default function SeatAvailabilityPage() {
  const router = useRouter();
  const params = useParams();
  // const searchParams = useSearchParams(); // Removed unused hook
  const [availability, setAvailability] = useState<SeatAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [travelDate, setTravelDate] = useState("");

  useEffect(() => {
    // Get today's date as default
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    setTravelDate(formattedToday);
  }, []);

  const fetchSeatAvailability = useCallback(async () => {
    try {
      setLoading(true);
      const availabilityData = await publicService.getSeatAvailability(
        parseInt(params.id as string),
        travelDate
      );
      setAvailability(availabilityData);
    } catch (error) {
      console.error("Error fetching seat availability:", error);
      toast.error((error as Error).message || "Failed to fetch seat availability");
    } finally {
      setLoading(false);
    }
  }, [params.id, travelDate]);

  useEffect(() => {
    if (travelDate) {
      fetchSeatAvailability();
    }
  }, [travelDate, fetchSeatAvailability]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTravelDate(e.target.value);
  };

  if (loading && !availability) {
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
              Loading seat availability...
            </p>
          </div>
        </ComponentCard>
      </div>
    );
  }

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
          Seat Availability
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Check seat availability for this service
        </p>
      </div>

      <ComponentCard title="" className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Select Travel Date
            </label>
            <input
              type="date"
              value={travelDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Booked</span>
            </div>
          </div>
        </div>
      </ComponentCard>

      {loading ? (
        <ComponentCard title="">
          <div className="text-center py-12">
            <div className="flex justify-center">
              <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Loading seat availability...
            </p>
          </div>
        </ComponentCard>
      ) : availability ? (
        <div>
          <ComponentCard title="" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Seats
                </h3>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {availability.total_seats}
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Available Seats
                </h3>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {availability.available_seats}
                </p>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Booked Seats
                </h3>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {availability.booked_seats}
                </p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Travel Date
                </h3>
                <p className="text-lg font-bold text-black dark:text-white">
                  {new Date(availability.travel_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              Seat Map
            </h3>
            
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-3">
              {availability.seat_details.map((seat) => (
                <div
                  key={seat.seat_number}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                    seat.status === 'available'
                      ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-100'
                      : 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-100'
                  }`}
                >
                  <span className="font-medium">{seat.seat_number}</span>
                  {seat.status === 'booked' && (
                    <span className="text-xs mt-1 truncate max-w-full">
                      {seat.passenger_name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </ComponentCard>
        </div>
      ) : null}
    </div>
  );
}