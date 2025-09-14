"use client";

import React, { useState, useEffect, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { publicService, Ticket, TicketFilterOptions } from "@/services/publicService";
import toast from "react-hot-toast";
import { ChevronLeftIcon, SearchIcon } from "@/icons";

export default function AdminPublicServiceTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    service_id: '',
    booking_status: '' as '' | 'booked' | 'cancelled' | 'completed',
    user_id: '',
    travel_date: ''
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      // Create properly typed filter options
      const filterOptions: TicketFilterOptions = {
        skip: 0,
        limit: 100
      };
      
      if (filters.service_id) {
        filterOptions.service_id = parseInt(filters.service_id);
      }
      
      if (filters.booking_status) {
        filterOptions.booking_status = filters.booking_status as 'booked' | 'cancelled' | 'completed';
      }
      
      if (filters.user_id) {
        filterOptions.user_id = parseInt(filters.user_id);
      }
      
      if (filters.travel_date) {
        filterOptions.travel_date = filters.travel_date;
      }
      
      const ticketsData = await publicService.getTickets(filterOptions);
      setTickets(ticketsData);
    } catch (error: unknown) {
      console.error("Error fetching tickets:", error);
      toast.error((error as Error).message || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets();
  };

  const clearFilters = () => {
    setFilters({
      service_id: '',
      booking_status: '',
      user_id: '',
      travel_date: ''
    });
  };

  // const _handleCancelTicket = async (ticketId: number) => {
  //   try {
  //     await publicService.cancelTicket(ticketId);
  //     toast.success("Ticket cancelled successfully!");
  //     fetchTickets(); // Refresh the list
  //   } catch (error: unknown) {
  //     console.error("Error cancelling ticket:", error);
  //     toast.error((error as Error).message || "Failed to cancel ticket");
  //   }
  // };

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            All Tickets (Admin)
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
          <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Service ID
              </label>
              <input
                type="number"
                value={filters.service_id}
                onChange={(e) => handleFilterChange('service_id', e.target.value)}
                placeholder="Filter by service ID"
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Status
              </label>
              <select
                value={filters.booking_status}
                onChange={(e) => handleFilterChange('booking_status', e.target.value)}
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
                User ID
              </label>
              <input
                type="number"
                value={filters.user_id}
                onChange={(e) => handleFilterChange('user_id', e.target.value)}
                placeholder="Filter by user ID"
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Travel Date
              </label>
              <input
                type="date"
                value={filters.travel_date}
                onChange={(e) => handleFilterChange('travel_date', e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
            
            <div className="flex items-end gap-2">
              <Button type="submit" className="flex items-center gap-2">
                <SearchIcon className="h-4 w-4" />
                Search
              </Button>
              <Button 
                type="button" 
                onClick={clearFilters}
                variant="outline"
                className="flex items-center gap-2"
              >
                Clear
              </Button>
            </div>
          </form>
        </ComponentCard>

        {loading ? (
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
        ) : tickets.length === 0 ? (
          <ComponentCard title="">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
                No Tickets Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                No tickets match your search criteria.
              </p>
              <Button 
                onClick={clearFilters}
                variant="outline"
                className="flex items-center gap-2 mx-auto"
              >
                Clear Filters
              </Button>
            </div>
          </ComponentCard>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket) => (
              <ComponentCard key={ticket.ticket_id} title="">
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                    Ticket #{ticket.ticket_id}
                  </h3>
                  <div className="flex-grow">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <span className="font-medium">Service ID:</span> {ticket.service_id}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <span className="font-medium">Passenger:</span> {ticket.passenger_name}
                    </p>
                    {ticket.seat_number && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <span className="font-medium">Seat:</span> {ticket.seat_number}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <span className="font-medium">Travel Date:</span> 
                      {ticket.travel_date ? new Date(ticket.travel_date).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <span className="font-medium">Fare Paid:</span> ${ticket.fare_paid}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <span className="font-medium">User ID:</span> {ticket.user_id}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        ticket.booking_status === 'booked' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                          : ticket.booking_status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                      }`}>
                        {ticket.booking_status}
                      </span>
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Booked: {ticket.booking_time ? new Date(ticket.booking_time).toLocaleString() : 'N/A'}
                    </p>
                    <Button 
                      onClick={() => router.push(`/public-services/tickets/${ticket.ticket_id}`)}
                      variant="outline"
                      className="mt-2 w-full"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </ComponentCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}