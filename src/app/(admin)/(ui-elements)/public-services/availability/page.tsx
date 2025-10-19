"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { publicService, PublicService, SeatAvailability } from "@/services/publicService";
import toast from "react-hot-toast";
import { ChevronLeftIcon, SearchIcon } from "@/icons";

export default function PublicServiceAvailabilityPage() {
  const router = useRouter();
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [travelDate, setTravelDate] = useState("");
  const [availability, setAvailability] = useState<SeatAvailability | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    fetchPublicServices();
    
    // Set default date to today
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    setTravelDate(formattedToday);
  }, []);

  const fetchPublicServices = async () => {
    try {
      setLoading(true);
      const servicesData = await publicService.getPublicServices();
      setServices(servicesData);
    } catch (error: unknown) {
      console.error("Error fetching public services:", error);
      toast.error((error as Error).message || "Failed to fetch public services");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAvailability = async () => {
    if (!selectedService || !travelDate) {
      toast.error("Please select a service and date");
      return;
    }
    
    try {
      setCheckingAvailability(true);
      const availabilityData = await publicService.getSeatAvailability(selectedService, travelDate);
      setAvailability(availabilityData);
    } catch (error: unknown) {
      console.error("Error checking seat availability:", error);
      toast.error((error as Error).message || "Failed to check seat availability");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedService(parseInt(e.target.value));
    setAvailability(null); // Clear previous availability data
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTravelDate(e.target.value);
    setAvailability(null); // Clear previous availability data
  };

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Seat Availability
          </h2>
          <Button 
            onClick={() => router.push("/public-services")} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Services
          </Button>
        </div>

        {/* Filter Section */}
        <ComponentCard title="" className="mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Select Service
              </label>
              <select
                value={selectedService || ""}
                onChange={handleServiceChange}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="">Choose a service</option>
                {services.map((service) => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.route_name} (ID: {service.service_id})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Travel Date
              </label>
              <input
                type="date"
                value={travelDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleCheckAvailability}
                disabled={checkingAvailability || !selectedService || !travelDate}
                className="flex items-center gap-2 w-full"
              >
                {checkingAvailability ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    Checking...
                  </>
                ) : (
                  <>
                    <SearchIcon className="h-4 w-4" />
                    Check Availability
                  </>
                )}
              </Button>
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
                Loading public services...
              </p>
            </div>
          </ComponentCard>
        ) : services.length === 0 ? (
          <ComponentCard title="">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
                No Public Services Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Get started by creating a new public transportation service.
              </p>
              <Button 
                onClick={() => router.push("/public-services/create")}
                className="flex items-center gap-2 mx-auto"
              >
                Create Your First Service
              </Button>
            </div>
          </ComponentCard>
        ) : (
          <>
            {availability && (
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
                    Seat Map for {availability.route_name}
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
            )}
          </>
        )}
      </div>
    </div>
  );
}