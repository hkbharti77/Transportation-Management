"use client";

import React, { useState, useEffect, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter, useParams } from "next/navigation";
import { publicService, Ticket, PublicService } from "@/services/publicService";
import toast from "react-hot-toast";
import { ChevronLeftIcon, PlusIcon } from "@/icons";
import { format } from "date-fns";

export default function ServiceTicketsPage() {
  const router = useRouter();
  const params = useParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [service, setService] = useState<PublicService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceAndTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch service details
      const serviceData = await publicService.getPublicServiceById(parseInt(params.id as string));
      setService(serviceData);
      
      // Fetch tickets for this service
      const ticketsData = await publicService.getServiceTickets(parseInt(params.id as string));
      setTickets(ticketsData);
    } catch (error: unknown) {
      console.error("Error fetching service and tickets:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch service and tickets";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchServiceAndTickets();
    }
  }, [fetchServiceAndTickets]);

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
              Loading service tickets...
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
              onClick={fetchServiceAndTickets}
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 mb-2"
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Service
          </Button>
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            {service?.route_name} - Tickets
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage tickets for this service
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push(`/public-services/${params.id}/tickets/all`)}
            variant="outline"
            className="flex items-center gap-2"
          >
            Filter Tickets
          </Button>
          <Button 
            onClick={() => router.push(`/public-services/tickets/book?serviceId=${params.id}`)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Book New Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        <ComponentCard title="">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Total Tickets
              </h3>
              <p className="text-2xl font-bold text-black dark:text-white">
                {tickets.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <span className="text-blue-600 dark:text-blue-300 text-xl font-bold">
                {tickets.length}
              </span>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Service ID
              </h3>
              <p className="text-2xl font-bold text-black dark:text-white">
                #{service?.service_id}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <span className="text-green-600 dark:text-green-300 text-xl font-bold">
                {service?.service_id}
              </span>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Route Name
              </h3>
              <p className="text-lg font-bold text-black dark:text-white truncate">
                {service?.route_name}
              </p>
            </div>
          </div>
        </ComponentCard>
      </div>

      <ComponentCard title="Service Tickets">
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              No Tickets Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              No tickets have been booked for this service yet.
            </p>
            <Button 
              onClick={() => router.push(`/public-services/tickets/book?serviceId=${params.id}`)}
              className="flex items-center gap-2 mx-auto"
            >
              <PlusIcon className="h-4 w-4" />
              Book First Ticket
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