"use client";

import React, { useState, useEffect, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter, useParams } from "next/navigation";
import { publicService, PublicService, Stop, Schedule } from "@/services/publicService";
import toast from "react-hot-toast";
import { ChevronLeftIcon, PlusIcon } from "@/icons";

export default function EditPublicServicePage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [service, setService] = useState<PublicService | null>(null);
  
  // Form state
  const [routeName, setRouteName] = useState("");
  const [capacity, setCapacity] = useState(45);
  const [fare, setFare] = useState(10);
  const [vehicleId, setVehicleId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<'active' | 'inactive' | 'maintenance' | 'cancelled'>('active');
  const [stops, setStops] = useState<Stop[]>([]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);

  const fetchService = useCallback(async () => {
    try {
      setIsLoading(true);
      const serviceData = await publicService.getPublicServiceById(parseInt(params.id as string));
      setService(serviceData);
      
      // Initialize form state with service data
      setRouteName(serviceData.route_name);
      setCapacity(serviceData.capacity);
      setFare(serviceData.fare);
      setVehicleId(serviceData.vehicle_id);
      setStatus(serviceData.status || 'active');
      setStops(serviceData.stops);
      setSchedule(serviceData.schedule);
    } catch (error) {
      console.error("Error fetching public service:", error);
      toast.error((error as Error).message || "Failed to fetch public service");
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchService();
    }
  }, [params.id, fetchService]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;
    
    setIsSaving(true);
    
    try {
      const serviceData = {
        route_name: routeName,
        stops,
        schedule,
        capacity,
        fare,
        vehicle_id: vehicleId,
        status
      };
      
      // Validate data before sending
      const errors = publicService.validatePublicServiceData(serviceData);
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
        setIsSaving(false);
        return;
      }
      
      const result = await publicService.updatePublicService(service.service_id!, serviceData);
      toast.success("Public service updated successfully!");
      router.push(`/public-services/${result.service_id}`);
    } catch (error) {
      console.error("Error updating public service:", error);
      toast.error((error as Error).message || "Failed to update public service");
      setIsSaving(false);
    }
  };

  // Handle adding a new stop
  const addStop = () => {
    setStops([
      ...stops,
      {
        name: "",
        location: "",
        sequence: stops.length + 1,
        estimated_time: ""
      }
    ]);
  };

  // Handle removing a stop
  const removeStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index);
    // Re-sequence stops
    const resequencedStops = newStops.map((stop, i) => ({
      ...stop,
      sequence: i + 1
    }));
    setStops(resequencedStops);
  };

  // Handle updating a stop
  const updateStop = (index: number, field: keyof Stop, value: string | number) => {
    const newStops = [...stops];
    (newStops[index] as Record<keyof Stop, string | number>)[field] = value;
    setStops(newStops);
  };

  // Handle adding a new schedule entry
  const addScheduleEntry = () => {
    setSchedule([
      ...schedule,
      {
        day: "",
        departure_time: "",
        arrival_time: ""
      }
    ]);
  };

  // Handle removing a schedule entry
  const removeScheduleEntry = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  // Handle updating a schedule entry
  const updateScheduleEntry = (index: number, field: keyof Schedule, value: string) => {
    const newSchedule = [...schedule];
    (newSchedule[index] as Record<keyof Schedule, string>)[field] = value;
    setSchedule(newSchedule);
  };

  if (isLoading) {
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
            Edit Public Service
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
              {/* Route Name */}
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Route Name
                </label>
                <input
                  type="text"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="Enter route name"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              {/* Capacity */}
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Capacity
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              {/* Fare */}
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Fare
                </label>
                <input
                  type="number"
                  value={fare}
                  onChange={(e) => setFare(parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              {/* Vehicle ID */}
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Vehicle ID
                </label>
                <input
                  type="number"
                  value={vehicleId || ''}
                  onChange={(e) => setVehicleId(e.target.value ? parseInt(e.target.value) : undefined)}
                  min="1"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Optional"
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'maintenance' | 'cancelled')}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Stops Section */}
            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-black dark:text-white">
                  Stops
                </h3>
                <Button 
                  type="button" 
                  onClick={addStop}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Stop
                </Button>
              </div>
              
              <div className="space-y-4">
                {stops.map((stop, index) => (
                  <div key={index} className="grid grid-cols-1 gap-4 md:grid-cols-12">
                    <div className="md:col-span-3">
                      <label className="mb-1 block text-sm text-black dark:text-white">
                        Name
                      </label>
                      <input
                        type="text"
                        value={stop.name}
                        onChange={(e) => updateStop(index, 'name', e.target.value)}
                        placeholder="Stop name"
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>
                    
                    <div className="md:col-span-3">
                      <label className="mb-1 block text-sm text-black dark:text-white">
                        Location
                      </label>
                      <input
                        type="text"
                        value={stop.location}
                        onChange={(e) => updateStop(index, 'location', e.target.value)}
                        placeholder="Location"
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm text-black dark:text-white">
                        Sequence
                      </label>
                      <input
                        type="number"
                        value={stop.sequence}
                        onChange={(e) => updateStop(index, 'sequence', parseInt(e.target.value) || 0)}
                        min="1"
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>
                    
                    <div className="md:col-span-3">
                      <label className="mb-1 block text-sm text-black dark:text-white">
                        Estimated Time
                      </label>
                      <input
                        type="text"
                        value={stop.estimated_time}
                        onChange={(e) => updateStop(index, 'estimated_time', e.target.value)}
                        placeholder="08:00 AM"
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>
                    
                    <div className="md:col-span-1 flex items-end">
                      <Button 
                        type="button" 
                        onClick={() => removeStop(index)}
                        variant="outline"
                        className="h-10 w-full"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Section */}
            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-black dark:text-white">
                  Schedule
                </h3>
                <Button 
                  type="button" 
                  onClick={addScheduleEntry}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Schedule
                </Button>
              </div>
              
              <div className="space-y-4">
                {schedule.map((entry, index) => (
                  <div key={index} className="grid grid-cols-1 gap-4 md:grid-cols-12">
                    <div className="md:col-span-4">
                      <label className="mb-1 block text-sm text-black dark:text-white">
                        Day
                      </label>
                      <select
                        value={entry.day}
                        onChange={(e) => updateScheduleEntry(index, 'day', e.target.value)}
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      >
                        <option value="">Select Day</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-3">
                      <label className="mb-1 block text-sm text-black dark:text-white">
                        Departure Time
                      </label>
                      <input
                        type="text"
                        value={entry.departure_time}
                        onChange={(e) => updateScheduleEntry(index, 'departure_time', e.target.value)}
                        placeholder="08:00 AM"
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>
                    
                    <div className="md:col-span-3">
                      <label className="mb-1 block text-sm text-black dark:text-white">
                        Arrival Time
                      </label>
                      <input
                        type="text"
                        value={entry.arrival_time}
                        onChange={(e) => updateScheduleEntry(index, 'arrival_time', e.target.value)}
                        placeholder="09:00 AM"
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>
                    
                    <div className="md:col-span-2 flex items-end">
                      <Button 
                        type="button" 
                        onClick={() => removeScheduleEntry(index)}
                        variant="outline"
                        className="h-10 w-full"
                      >
                        Remove
                      </Button>
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
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4" />
                    Save Changes
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