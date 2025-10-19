"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { publicService, PublicService, BookTicketRequest, SeatAvailability } from "@/services/publicService";
import toast from "react-hot-toast";
import { ChevronLeftIcon, PlusIcon } from "@/icons";

export default function BookPublicServiceTicketPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  
  const [service, setService] = useState<PublicService | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [availability, setAvailability] = useState<SeatAvailability | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  // Form state
  const [passengerName, setPassengerName] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [preferredSeat, setPreferredSeat] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [useAutomaticAssignment, setUseAutomaticAssignment] = useState(false);

  useEffect(() => {
    if (serviceId) {
      fetchService();
    } else {
      router.push("/public-services");
    }
  }, [serviceId, router]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const serviceData = await publicService.getPublicServiceById(parseInt(serviceId!));
      setService(serviceData);
      
      // Set default travel date to today
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      setTravelDate(formattedDate);
      
      // Check availability for today by default
      checkAvailability(formattedDate);
    } catch (error) {
      console.error("Error fetching service:", error);
      toast.error((error as Error).message || "Failed to fetch service details");
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async (date: string) => {
    if (!serviceId) return;
    
    try {
      setCheckingAvailability(true);
      const availabilityData = await publicService.getSeatAvailability(parseInt(serviceId), date);
      setAvailability(availabilityData);
    } catch (error) {
      console.error("Error checking availability:", error);
      toast.error((error as Error).message || "Failed to check seat availability");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setTravelDate(newDate);
    checkAvailability(newDate);
  };

  const handleSeatSelect = (seatNumber: string) => {
    setSeatNumber(seatNumber);
    setPreferredSeat(seatNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service || !serviceId) return;
    
    try {
      setBooking(true);
      
      if (useAutomaticAssignment) {
        // Use automatic seat assignment
        const bookTicketData: BookTicketRequest = {
          service_id: parseInt(serviceId),
          passenger_name: passengerName,
          travel_date: new Date(travelDate).toISOString(),
          preferred_seat: preferredSeat || undefined,
          user_id: 1 // In a real app, this would come from the current user context
        };
        
        const result = await publicService.bookTicketWithAutomaticSeatAssignment(bookTicketData);
        toast.success(result.booking_confirmation);
        router.push(`/public-services/tickets/${result.ticket.ticket_id}`);
      } else {
        // Validate that the selected seat is available
        if (seatNumber && availability) {
          const selectedSeat = availability.seat_details.find(seat => seat.seat_number === seatNumber);
          if (selectedSeat && selectedSeat.status === 'booked') {
            toast.error("Selected seat is already booked. Please choose another seat.");
            setBooking(false);
            return;
          }
        }
        
        // Use manual seat selection
        const ticketData = {
          service_id: parseInt(serviceId),
          passenger_name: passengerName,
          seat_number: seatNumber || undefined,
          travel_date: new Date(travelDate).toISOString(),
          fare_paid: service.fare,
          user_id: 1 // In a real app, this would come from the current user context
        };
        
        const result = await publicService.createTicket(ticketData);
        toast.success("Ticket booked successfully!");
        router.push(`/public-services/tickets/${result.ticket_id}`);
      }
    } catch (error) {
      console.error("Error booking ticket:", error);
      toast.error((error as Error).message || "Failed to book ticket");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6">
          <Button 
            onClick={() => router.push("/public-services")} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Services
          </Button>
        </div>
        
        <ComponentCard title="">
          <div className="text-center py-12">
            <div className="flex justify-center">
              <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Loading service details...
            </p>
          </div>
        </ComponentCard>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6">
          <Button 
            onClick={() => router.push("/public-services")} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Services
          </Button>
        </div>
        
        <ComponentCard title="">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Service Not Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              The requested public service could not be found.
            </p>
            <Button 
              onClick={() => router.push("/public-services")}
              className="flex items-center gap-2 mx-auto"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Back to Services
            </Button>
          </div>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Book Ticket for {service.route_name}
          </h2>
          <Button 
            onClick={() => router.push(`/public-services/${service.service_id}`)} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Service
          </Button>
        </div>

        <ComponentCard title="">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Service Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                  Service Details
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Route Name
                    </h4>
                    <p className="text-lg font-medium text-black dark:text-white">
                      {service.route_name}
                    </p>
                  </div>
                  
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Capacity
                    </h4>
                    <p className="text-lg font-medium text-black dark:text-white">
                      {service.capacity} passengers
                    </p>
                  </div>
                  
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Fare
                    </h4>
                    <p className="text-lg font-medium text-black dark:text-white">
                      ${service.fare}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Mode Toggle */}
              <div className="md:col-span-2">
                <label className="mb-2.5 block text-black dark:text-white">
                  Booking Mode
                </label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setUseAutomaticAssignment(false)}
                    variant={!useAutomaticAssignment ? undefined : "outline"}
                    className="flex-1"
                  >
                    Manual Seat Selection
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setUseAutomaticAssignment(true)}
                    variant={useAutomaticAssignment ? undefined : "outline"}
                    className="flex-1"
                  >
                    Automatic Seat Assignment
                  </Button>
                </div>
              </div>

              {/* Passenger Name */}
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Passenger Name
                </label>
                <input
                  type="text"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="Enter passenger name"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              {/* Travel Date */}
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Travel Date
                </label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              {/* Manual Seat Selection */}
              {!useAutomaticAssignment && (
                <div className="md:col-span-2">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Select Seat
                  </label>
                  {checkingAvailability ? (
                    <div className="text-center py-4">
                      <span className="h-6 w-6 rounded-full border-4 border-primary border-t-transparent animate-spin inline-block"></span>
                      <p className="mt-2 text-gray-500 dark:text-gray-400">
                        Checking seat availability...
                      </p>
                    </div>
                  ) : availability ? (
                    <div>
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Booked</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Available: {availability.available_seats} / {availability.total_seats}
                        </div>
                      </div>
                      <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
                        {availability.seat_details.map((seat) => (
                          <button
                            key={seat.seat_number}
                            type="button"
                            onClick={() => handleSeatSelect(seat.seat_number)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border ${
                              seatNumber === seat.seat_number
                                ? 'ring-2 ring-blue-500'
                                : ''
                            } ${
                              seat.status === 'available'
                                ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-100'
                                : 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-100 cursor-not-allowed'
                            }`}
                            disabled={seat.status === 'booked'}
                          >
                            <span className="font-medium">{seat.seat_number}</span>
                          </button>
                        ))}
                      </div>
                      {seatNumber && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Selected seat: {seatNumber}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      Select a travel date to view seat availability
                    </div>
                  )}
                </div>
              )}

              {/* Automatic Assignment - Preferred Seat */}
              {useAutomaticAssignment && (
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Preferred Seat (Optional)
                  </label>
                  <input
                    type="text"
                    value={preferredSeat}
                    onChange={(e) => setPreferredSeat(e.target.value)}
                    placeholder="Enter preferred seat (e.g., Window - 12A)"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    System will assign the first available seat or your preferred seat if available
                  </p>
                </div>
              )}

              {/* Manual Seat Entry (fallback) - only shown in manual mode */}
              {!useAutomaticAssignment && (
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Or Enter Seat Number Manually
                  </label>
                  <input
                    type="text"
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value)}
                    placeholder="Enter seat number"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
              )}
            </div>

            {/* Stops Information */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Route Stops
              </h3>
              <div className="space-y-3">
                {service.stops.map((stop, index) => (
                  <div key={index} className="border-l-2 border-gray-200 dark:border-gray-700 pl-3 py-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-black dark:text-white">
                        {stop.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        #{stop.sequence}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {stop.location}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Est. {stop.estimated_time}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Information */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Schedule
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {service.schedule.map((entry, index) => (
                  <div key={index} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <div className="flex justify-between">
                      <span className="font-medium text-black dark:text-white">
                        {entry.day}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600 dark:text-gray-300">
                        Departure: {entry.departure_time}
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        Arrival: {entry.arrival_time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-6 flex justify-end gap-4">
              <Button 
                type="button" 
                onClick={() => router.push(`/public-services/${service.service_id}`)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={booking}
                className="flex items-center gap-2"
              >
                {booking ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    Booking...
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4" />
                    Book Ticket
                  </>
                )}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}