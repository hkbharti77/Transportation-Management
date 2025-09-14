"use client";

import React, { useState, useEffect, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter, useParams } from "next/navigation";
import { publicService, Ticket } from "@/services/publicService";
import toast from "react-hot-toast";
import { ChevronLeftIcon, SearchIcon } from "@/icons";
import { format } from "date-fns";

export default function AllServiceTicketsPage() {
  const router = useRouter();
  const params = useParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    booking_status: '',
    travel_date: '',
    passenger_name: ''
  });

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch tickets for this service with filters
      let ticketsData: Ticket[] = [];
      
      if (filter.passenger_name.trim()) {
        // If searching by passenger name, get all tickets and filter by passenger name and service_id
        const allTickets = await publicService.searchTickets(filter.passenger_name.trim());
        ticketsData = allTickets.filter(ticket => ticket.service_id === parseInt(params.id as string));
      } else {
        // Otherwise, filter by service_id and other filters
        ticketsData = await publicService.getTickets({
          service_id: parseInt(params.id as string),
          booking_status: filter.booking_status as 'booked' | 'cancelled' | 'completed' | undefined,
          travel_date: filter.travel_date || undefined
        });
      }
      
      // Apply additional filters if needed
      if (filter.booking_status) {
        ticketsData = ticketsData.filter(ticket => ticket.booking_status === filter.booking_status);
      }
      
      if (filter.travel_date) {
        ticketsData = ticketsData.filter(ticket => ticket.travel_date === filter.travel_date);
      }
      
      setTickets(ticketsData);
    } catch (error: unknown) {
      console.error("Error fetching tickets:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch tickets";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [params.id, filter]);

  useEffect(() => {
    if (params.id) {
      fetchTickets();
    }
  }, [fetchTickets]); // Fixed: Added fetchTickets to dependency array

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilter({
      booking_status: '',
      travel_date: '',
      passenger_name: ''
    });
  };

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
              Loading tickets...
            </p>
          </div>
        </ComponentCard>
      </div>
    );
  }

  if (error) {
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
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Error Loading Tickets
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button 
              onClick={fetchTickets}
              className="flex items-center gap-2 mx-auto"
            >
              Retry
            </Button>
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
          Back to Service Tickets
        </Button>
      </div>

      <div className="mb-6">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          All Tickets for Service #{params.id}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Filter and manage all tickets for this service
        </p>
      </div>

      {/* Filter Section */}
      <ComponentCard title="" className="mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Booking Status
            </label>
            <select
              name="booking_status"
              value={filter.booking_status}
              onChange={handleFilterChange}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="booked">Booked</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Travel Date
            </label>
            <input
              type="date"
              name="travel_date"
              value={filter.travel_date}
              onChange={handleFilterChange}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Passenger Name
            </label>
            <input
              type="text"
              name="passenger_name"
              value={filter.passenger_name}
              onChange={handleFilterChange}
              placeholder="Search by passenger name"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={clearFilters}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title={`Tickets (${tickets.length})`}>
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              No Tickets Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              No tickets match the current filters.
            </p>
            <Button 
              onClick={clearFilters}
              className="flex items-center gap-2 mx-auto"
            >
              <SearchIcon className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-left dark:bg-gray-700">
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Ticket ID
                  </th>
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Passenger
                  </th>
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Seat Number
                  </th>
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Travel Date
                  </th>
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Fare Paid
                  </th>
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Booking Time
                  </th>
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.ticket_id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3">
                      <p className="font-medium text-black dark:text-white">
                        #{ticket.ticket_id}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-black dark:text-white">
                        {ticket.passenger_name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-black dark:text-white">
                        {ticket.seat_number || 'N/A'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-black dark:text-white">
                        {format(new Date(ticket.travel_date), 'MMM dd, yyyy')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-black dark:text-white">
                        ${ticket.fare_paid}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        ticket.booking_status === 'booked' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                          : ticket.booking_status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                      }`}>
                        {ticket.booking_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-black dark:text-white">
                        {format(new Date(ticket.booking_time!), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Button 
                        onClick={() => router.push(`/public-services/tickets/${ticket.ticket_id}`)}
                        size="sm"
                        variant="outline"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ComponentCard>
    </div>
  );
}