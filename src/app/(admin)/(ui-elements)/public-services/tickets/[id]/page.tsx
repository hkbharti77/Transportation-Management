"use client";

import React, { useState, useEffect, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter, useParams } from "next/navigation";
import { publicService, Ticket } from "@/services/publicService";
import toast from "react-hot-toast";
import { ChevronLeftIcon, PencilIcon, TrashBinIcon } from "@/icons";

export default function PublicServiceTicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state for editing
  const [passengerName, setPassengerName] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [farePaid, setFarePaid] = useState(0);
  const [bookingStatus, setBookingStatus] = useState<"booked" | "cancelled" | "completed">("booked");
  const [updating, setUpdating] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      const ticketData = await publicService.getTicketById(parseInt(params.id as string));
      setTicket(ticketData);
      
      // Initialize form state for editing
      setPassengerName(ticketData.passenger_name);
      setSeatNumber(ticketData.seat_number || "");
      setTravelDate(ticketData.travel_date ? new Date(ticketData.travel_date).toISOString().split('T')[0] : "");
      setFarePaid(ticketData.fare_paid);
      setBookingStatus(ticketData.booking_status as "booked" | "cancelled" | "completed" || "booked");
    } catch (error) {
      console.error("Error fetching ticket:", error);
      toast.error((error as Error).message || "Failed to fetch ticket");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchTicket();
    }
  }, [params.id, fetchTicket]);

  const handleCancelTicket = async () => {
    if (!ticket) return;
    
    const confirmed = window.confirm("Are you sure you want to cancel this ticket?");
    if (!confirmed) return;
    
    try {
      setCancelling(true);
      const updatedTicket = await publicService.cancelTicket(ticket.ticket_id!);
      setTicket(updatedTicket);
      toast.success("Ticket cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling ticket:", error);
      toast.error((error as Error).message || "Failed to cancel ticket");
    } finally {
      setCancelling(false);
    }
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    
    try {
      setUpdating(true);
      
      const updatedData = {
        passenger_name: passengerName,
        seat_number: seatNumber,
        travel_date: new Date(travelDate).toISOString(),
        fare_paid: farePaid,
        booking_status: bookingStatus
      };
      
      const updatedTicket = await publicService.updateTicket(ticket.ticket_id!, updatedData);
      setTicket(updatedTicket);
      setIsEditing(false);
      toast.success("Ticket updated successfully!");
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error((error as Error).message || "Failed to update ticket");
    } finally {
      setUpdating(false);
    }
  };

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
              Loading ticket details...
            </p>
          </div>
        </ComponentCard>
      </div>
    );
  }

  if (!ticket) {
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
              Ticket Not Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              The requested ticket could not be found.
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

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button 
          onClick={() => router.push("/public-services/tickets")} 
          className="flex items-center gap-2"
          variant="outline"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Tickets
        </Button>
        
        <div className="flex gap-2">
          {ticket.booking_status === 'booked' && (
            <Button 
              onClick={handleCancelTicket}
              disabled={cancelling}
              variant="outline"
              className="flex items-center gap-2"
            >
              {cancelling ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  Cancelling...
                </>
              ) : (
                <>
                  <TrashBinIcon className="h-4 w-4" />
                  Cancel Ticket
                </>
              )}
            </Button>
          )}
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            {isEditing ? 'Cancel Edit' : 'Edit Ticket'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ComponentCard title="" className="lg:col-span-2">
          <h2 className="text-title-md2 font-bold text-black dark:text-white mb-6">
            Ticket Details
          </h2>
          
          {isEditing ? (
            <form onSubmit={handleUpdateTicket}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Passenger Name
                  </label>
                  <input
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Seat Number
                  </label>
                  <input
                    type="text"
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Travel Date
                  </label>
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Fare Paid
                  </label>
                  <input
                    type="number"
                    value={farePaid}
                    onChange={(e) => setFarePaid(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Booking Status
                  </label>
                  <select
                    value={bookingStatus}
                    onChange={(e) => setBookingStatus(e.target.value as "booked" | "cancelled" | "completed")}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="booked">Booked</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-4">
                <Button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updating}
                  className="flex items-center gap-2"
                >
                  {updating ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      Updating...
                    </>
                  ) : (
                    'Update Ticket'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Ticket ID
                </h3>
                <p className="text-lg font-medium text-black dark:text-white">
                  #{ticket.ticket_id}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Status
                </h3>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  ticket.booking_status === 'booked' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                    : ticket.booking_status === 'cancelled'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                }`}>
                  {ticket.booking_status}
                </span>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Service ID
                </h3>
                <p className="text-lg font-medium text-black dark:text-white">
                  {ticket.service_id}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  User ID
                </h3>
                <p className="text-lg font-medium text-black dark:text-white">
                  {ticket.user_id}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Passenger Name
                </h3>
                <p className="text-lg font-medium text-black dark:text-white">
                  {ticket.passenger_name}
                </p>
              </div>
              
              {ticket.seat_number && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Seat Number
                  </h3>
                  <p className="text-lg font-medium text-black dark:text-white">
                    {ticket.seat_number}
                  </p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Travel Date
                </h3>
                <p className="text-lg font-medium text-black dark:text-white">
                  {ticket.travel_date ? new Date(ticket.travel_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Fare Paid
                </h3>
                <p className="text-lg font-medium text-black dark:text-white">
                  ${ticket.fare_paid}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Booking Time
                </h3>
                <p className="text-lg font-medium text-black dark:text-white">
                  {ticket.booking_time ? new Date(ticket.booking_time).toLocaleString() : 'N/A'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Created At
                </h3>
                <p className="text-lg font-medium text-black dark:text-white">
                  {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : 'N/A'}
                </p>
              </div>
              
              {ticket.updated_at && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Last Updated
                  </h3>
                  <p className="text-lg font-medium text-black dark:text-white">
                    {new Date(ticket.updated_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </ComponentCard>

        <div className="space-y-6">
          <ComponentCard title="">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              Actions
            </h3>
            
            <div className="flex flex-col gap-3">
              {ticket.booking_status === 'booked' && (
                <Button 
                  onClick={handleCancelTicket}
                  disabled={cancelling}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <TrashBinIcon className="h-4 w-4" />
                      Cancel Ticket
                    </>
                  )}
                </Button>
              )}
              
              <Button 
                onClick={() => setIsEditing(!isEditing)}
                className="w-full flex items-center justify-center gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                {isEditing ? 'Cancel Edit' : 'Edit Ticket'}
              </Button>
              
              <Button 
                onClick={() => router.push(`/public-services/${ticket.service_id}`)}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                View Service
              </Button>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}