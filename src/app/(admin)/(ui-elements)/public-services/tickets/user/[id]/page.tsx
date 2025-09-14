"use client";

import React, { useState, useEffect, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter, useParams } from "next/navigation";
import { publicService, Ticket } from "@/services/publicService";
import toast from "react-hot-toast";
import { ChevronLeftIcon } from "@/icons";

export default function UserTicketsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.id as string);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  const fetchUserTickets = useCallback(async () => {
    try {
      setLoading(true);
      const ticketsData = await publicService.getTicketsByUserId(userId);
      setTickets(ticketsData);
      
      // Try to extract user name from tickets if available
      if (ticketsData.length > 0 && ticketsData[0].passenger_name) {
        setUserName(ticketsData[0].passenger_name);
      }
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      toast.error((error as Error).message || "Failed to fetch user tickets");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!isNaN(userId)) {
      fetchUserTickets();
    }
  }, [userId, fetchUserTickets]);

  if (isNaN(userId)) {
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
        
        <ComponentCard title="">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Invalid User ID
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              The provided user ID is not valid.
            </p>
            <Button 
              onClick={() => router.push("/public-services/tickets")}
              className="flex items-center gap-2 mx-auto"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Back to Tickets
            </Button>
          </div>
        </ComponentCard>
      </div>
    );
  }

  if (loading) {
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
        
        <ComponentCard title="">
          <div className="text-center py-12">
            <div className="flex justify-center">
              <span className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Loading tickets for user {userId}...
            </p>
          </div>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Tickets for User {userId}
          </h2>
          {userName && (
            <p className="text-gray-600 dark:text-gray-400">
              Passenger: {userName}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push("/public-services/tickets")} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Tickets
          </Button>
          <Button 
            onClick={fetchUserTickets}
            className="flex items-center gap-2"
          >
            Refresh
          </Button>
        </div>
      </div>

      {tickets.length === 0 ? (
        <ComponentCard title="">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              No Tickets Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              This user does not have any tickets yet.
            </p>
            <Button 
              onClick={() => router.push("/public-services/tickets/book")}
              className="flex items-center gap-2 mx-auto"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Book a Ticket
            </Button>
          </div>
        </ComponentCard>
      ) : (
        <ComponentCard title="">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-left dark:bg-gray-700">
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Ticket ID
                  </th>
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Service
                  </th>
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Passenger
                  </th>
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Travel Date
                  </th>
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
                    Seat Number
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
                        Service #{ticket.service_id}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-black dark:text-white">
                        {ticket.passenger_name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-black dark:text-white">
                        {ticket.travel_date ? new Date(ticket.travel_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-black dark:text-white">
                        {ticket.seat_number || 'N/A'}
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
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' 
                          : ticket.booking_status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : ticket.booking_status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                      }`}>
                        {ticket.booking_status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-black dark:text-white">
                        {ticket.booking_time ? new Date(ticket.booking_time).toLocaleString() : 'N/A'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {tickets.length} ticket(s)
            </p>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}