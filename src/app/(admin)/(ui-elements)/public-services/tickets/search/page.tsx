"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { publicService, Ticket } from "@/services/publicService";
import toast from "react-hot-toast";
import { ChevronLeftIcon, SearchIcon } from "@/icons";
import { format } from "date-fns";

export default function SearchTicketsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a passenger name to search");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const ticketsData = await publicService.searchTickets(searchTerm.trim());
      setTickets(ticketsData);
      
      if (ticketsData.length === 0) {
        toast("No tickets found for this passenger", { icon: 'ℹ️' });
      } else {
        toast.success(`Found ${ticketsData.length} ticket(s)`);
      }
    } catch (error) {
      console.error("Error searching tickets:", error);
      setError((error as Error).message || "Failed to search tickets");
      toast.error((error as Error).message || "Failed to search tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6">
        <Button 
          onClick={() => router.push("/public-services/tickets")} 
          className="flex items-center gap-2"
          variant="outline"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Tickets
        </Button>
      </div>

      <div className="mb-6">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Search Tickets
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Find tickets by passenger name
        </p>
      </div>

      {/* Search Section */}
      <ComponentCard title="" className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Passenger Name
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter passenger name to search tickets"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  Searching...
                </>
              ) : (
                <>
                  <SearchIcon className="h-4 w-4" />
                  Search Tickets
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => setSearchTerm("")}
              variant="outline"
              className="flex items-center gap-2"
            >
              Clear
            </Button>
          </div>
        </div>
      </ComponentCard>

      {error && (
        <ComponentCard title="">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Error Searching Tickets
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button 
              onClick={handleSearch}
              className="flex items-center gap-2 mx-auto"
            >
              Retry
            </Button>
          </div>
        </ComponentCard>
      )}

      {tickets.length > 0 && (
        <ComponentCard title={`Search Results (${tickets.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-left dark:bg-gray-700">
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Ticket ID
                  </th>
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Service ID
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
                        #{ticket.service_id}
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
        </ComponentCard>
      )}
    </div>
  );
}