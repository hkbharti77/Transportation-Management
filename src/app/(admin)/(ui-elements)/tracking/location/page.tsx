'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Badge from '@/components/ui/badge/Badge';
import { trackingService, LocationData, LocationRecord, TrackingStats } from '@/services/trackingService';
import { fleetService, Truck } from '@/services/fleetService';
import { bookingService, Booking, Dispatch as BookingDispatch } from '@/services/bookingService';
import GoogleMap from '@/components/ui-elements/maps/GoogleMap';
import { 
  LocationIcon, 
  PlayIcon,
  StopIcon,
  HistoryIcon,
  PencilIcon,
  CloseIcon,
  InfoIcon
} from '@/icons';

interface LocationTrackingState {
  isTracking: boolean;
  isConnected: boolean;
  currentLocation: LocationRecord | null;
  locationHistory: LocationRecord[];
  trackingStats: TrackingStats | null;
  selectedTruck: Truck | null;
  trucks: Truck[];
  error: string | null;
  success: string | null;
  editingLocation: LocationRecord | null;
  isEditMode: boolean;
  bookingPosition: LocationRecord | null;
  selectedBookingId: number | null;
  // Add new state properties for connected services
  bookings: Booking[];
  selectedBooking: Booking | null;
  dispatch: BookingDispatch | null;
}

export default function LocationTrackingPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<LocationTrackingState>({
    isTracking: false,
    isConnected: false,
    currentLocation: null,
    locationHistory: [],
    trackingStats: null,
    selectedTruck: null,
    trucks: [],
    error: null,
    success: null,
    editingLocation: null,
    isEditMode: false,
    bookingPosition: null,
    selectedBookingId: null,
    // Initialize new state properties
    bookings: [],
    selectedBooking: null,
    dispatch: null
  });

  const [locationForm, setLocationForm] = useState<Partial<LocationData>>({
    latitude: 0,
    longitude: 0,
    altitude: 0,
    speed: 0,
    heading: 0,
    accuracy: 5,
    location_type: 'gps',
    truck_id: 0
  });

  // Load trucks, bookings and initial data
  useEffect(() => {
    if (isAuthenticated) {
      loadTrucks();
      loadBookings(); // Add this line to load bookings
      loadTrackingStats();
    }
  }, [isAuthenticated]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const loadTrucks = async () => {
    try {
      const trucksData = await fleetService.getTrucks();
      setState(prev => ({ ...prev, trucks: trucksData }));
    } catch (error) {
      console.error('Error loading trucks:', error);
      setState(prev => ({ ...prev, error: 'Failed to load trucks' }));
    }
  };

  const loadBookings = async () => {
    try {
      const bookingsResponse = await bookingService.getBookings({ limit: 100 });
      setState(prev => ({ ...prev, bookings: bookingsResponse.data }));
    } catch (error) {
      console.error('Error loading bookings:', error);
      setState(prev => ({ ...prev, error: 'Failed to load bookings' }));
    }
  };

  const loadTrackingStats = async () => {
    try {
      const stats = await trackingService.getTrackingStats();
      setState(prev => ({ ...prev, trackingStats: stats }));
    } catch (error) {
      console.warn('Tracking stats not available:', error);
      // Set default stats if endpoint is not available
      setState(prev => ({ 
        ...prev, 
        trackingStats: {
          total_locations: 0,
          active_trucks: 0,
          last_update: new Date().toISOString(),
          average_speed: 0
        }
      }));
    }
  };

  const loadLocationHistory = async (truckId: number) => {
    try {
      // Removed unused page and limit parameters
      const history = await trackingService.getLocationHistory(truckId);
      setState(prev => ({ ...prev, locationHistory: history.data }));
    } catch (error) {
      console.warn('Location history not available:', error);
      setState(prev => ({ 
        ...prev, 
        locationHistory: [],
        error: 'Location history endpoint not available. Only manual location submission is working.'
      }));
    }
  };

  const loadCurrentLocation = async (truckId: number) => {
    try {
      const currentLocation = await trackingService.getCurrentLocation(truckId);
      if (currentLocation) {
        setState(prev => ({ ...prev, currentLocation }));
      }
    } catch (error) {
      console.warn('Current location not available:', error);
    }
  };

  const loadBookingPosition = async (bookingId: number) => {
    try {
      const bookingPosition = await trackingService.getBookingPosition(bookingId);
      setState(prev => ({ ...prev, bookingPosition, selectedBookingId: bookingId }));
    } catch (error) {
      console.warn('Booking position not available:', error);
      setState(prev => ({ ...prev, bookingPosition: null, selectedBookingId: null }));
    }
  };

  const getCurrentBrowserLocation = async () => {
    try {
      const position = await trackingService.getCurrentBrowserLocation();
      setLocationForm(prev => ({
        ...prev,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy || 5
      }));
      setState(prev => ({ ...prev, success: 'Current location obtained from GPS' }));
    } catch (error) {
      console.error('Error getting current location:', error);
      setState(prev => ({ ...prev, error: 'Failed to get current location. Please check GPS permissions.' }));
    }
  };

  const submitLocation = async () => {
    if (!locationForm.truck_id || !locationForm.latitude || !locationForm.longitude) {
      setState(prev => ({ ...prev, error: 'Please select a truck and provide coordinates' }));
      return;
    }

    try {
      if (state.isEditMode && state.editingLocation) {
        // Update existing location
        const updateData = {
          latitude: locationForm.latitude!,
          longitude: locationForm.longitude!,
          altitude: locationForm.altitude || 0,
          speed: locationForm.speed || 0,
          heading: locationForm.heading || 0,
          accuracy: locationForm.accuracy || 5,
          location_type: locationForm.location_type || 'gps'
        };

        const result = await trackingService.updateLocation(state.editingLocation.location_id, updateData);
        setState(prev => ({ 
          ...prev, 
          currentLocation: result,
          success: 'Location updated successfully',
          error: null,
          isEditMode: false,
          editingLocation: null
        }));

        // Reset form
        setLocationForm({
          latitude: 0,
          longitude: 0,
          altitude: 0,
          speed: 0,
          heading: 0,
          accuracy: 5,
          location_type: 'gps',
          truck_id: 0
        });
      } else {
        // Create new location
        const locationData: LocationData = {
          latitude: locationForm.latitude!,
          longitude: locationForm.longitude!,
          altitude: locationForm.altitude || 0,
          speed: locationForm.speed || 0,
          heading: locationForm.heading || 0,
          accuracy: locationForm.accuracy || 5,
          location_type: locationForm.location_type || 'gps',
          truck_id: locationForm.truck_id,
          timestamp: new Date().toISOString()
        };

        const result = await trackingService.submitLocation(locationData);
        setState(prev => ({ 
          ...prev, 
          currentLocation: result,
          success: 'Location submitted successfully',
          error: null
        }));
      }

      // Refresh location history
      loadLocationHistory(locationForm.truck_id);
    } catch (error) {
      console.error('Error submitting location:', error);
      setState(prev => ({ ...prev, error: 'Failed to submit location' }));
    }
  };

  const startRealTimeTracking = () => {
    if (!state.selectedTruck) {
      setState(prev => ({ ...prev, error: 'Please select a truck first' }));
      return;
    }

    try {
      const ws = trackingService.connectToLocationUpdates(
        state.selectedTruck.id!,
        (location) => {
          setState(prev => ({
            ...prev,
            currentLocation: location,
            locationHistory: [location, ...prev.locationHistory.slice(0, 49)],
            isConnected: true
          }));
        },
        (error) => {
          console.warn('WebSocket error:', error);
          setState(prev => ({ 
            ...prev, 
            error: 'Real-time tracking not available. WebSocket connection failed. You can still submit locations manually.',
            isTracking: false,
            isConnected: false
          }));
        }
      );

      if (ws) {
        wsRef.current = ws;
        setState(prev => ({ 
          ...prev, 
          isTracking: true, 
          isConnected: true,
          error: null 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: 'Real-time tracking not available. WebSocket connection failed. You can still submit locations manually.',
          isTracking: false,
          isConnected: false
        }));
      }
    } catch (error) {
      console.warn('Error starting real-time tracking:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Real-time tracking not available. WebSocket connection failed. You can still submit locations manually.',
        isTracking: false,
        isConnected: false
      }));
    }
  };

  const stopRealTimeTracking = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setState(prev => ({ 
      ...prev, 
      isTracking: false, 
      isConnected: false 
    }));
  };

  const handleTruckSelect = (truckId: number) => {
    const truck = state.trucks.find(t => t.id === truckId);
    setState(prev => ({ 
      ...prev, 
      selectedTruck: truck || null,
      currentLocation: null,
      isEditMode: false,
      editingLocation: null
    }));
    setLocationForm(prev => ({ ...prev, truck_id: truckId }));
    
    if (truckId) {
      loadLocationHistory(truckId);
      loadCurrentLocation(truckId);
    }
  };

  // Add new handler for booking selection
  const handleBookingSelect = async (bookingId: number) => {
    const booking = state.bookings.find(b => b.booking_id === bookingId);
    
    if (!booking) {
      setState(prev => ({ 
        ...prev, 
        selectedBooking: null,
        selectedBookingId: null,
        dispatch: null,
        selectedTruck: null
      }));
      setLocationForm(prev => ({ ...prev, truck_id: 0 }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      selectedBooking: booking,
      selectedBookingId: bookingId
    }));

    try {
      // Load dispatch information for this booking
      const bookingWithDispatch = await bookingService.getBookingWithDispatch(bookingId);
      if (bookingWithDispatch.dispatch) {
        setState(prev => ({ 
          ...prev, 
          dispatch: bookingWithDispatch.dispatch
        }));
        
        // If dispatch has a truck assigned, select it
        if (bookingWithDispatch.dispatch.assigned_driver && booking.truck_id) {
          handleTruckSelect(booking.truck_id);
          setLocationForm(prev => ({ ...prev, truck_id: booking.truck_id }));
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          dispatch: null
        }));
      }
    } catch (error) {
      console.warn('Could not load dispatch information:', error);
      setState(prev => ({ 
        ...prev, 
        dispatch: null
      }));
    }
  };

  const handleEditLocation = (location: LocationRecord) => {
    setState(prev => ({ 
      ...prev, 
      editingLocation: location,
      isEditMode: true
    }));
    
    setLocationForm({
      latitude: location.latitude,
      longitude: location.longitude,
      altitude: location.altitude,
      speed: location.speed,
      heading: location.heading,
      accuracy: location.accuracy,
      location_type: location.location_type as 'gps' | 'network' | 'passive',
      truck_id: location.truck_id
    });
  };

  const handleCancelEdit = () => {
    setState(prev => ({ 
      ...prev, 
      isEditMode: false,
      editingLocation: null
    }));
    
    setLocationForm({
      latitude: 0,
      longitude: 0,
      altitude: 0,
      speed: 0,
      heading: 0,
      accuracy: 5,
      location_type: 'gps',
      truck_id: state.selectedTruck?.id || 0
    });
  };

  const formatLocationData = (location: LocationRecord) => {
    return trackingService.formatLocationData(location);
  };

  const getStatusBadge = (isConnected: boolean) => {
    return (
      <Badge
        color={isConnected ? 'success' : 'error'}
        variant="light"
        size="sm"
      >
        {isConnected ? 'Connected' : 'Disconnected'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Location Tracking" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🗺️ Location Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage real-time location data for your fleet
          </p>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge(state.isConnected)}
          <Button
            onClick={state.isTracking ? stopRealTimeTracking : startRealTimeTracking}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              state.isTracking
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {state.isTracking ? (
              <>
                <StopIcon className="h-4 w-4" />
                Stop Tracking
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4" />
                Start Tracking
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error and Success Messages */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-200">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg dark:bg-green-900 dark:border-green-700 dark:text-green-200">
          {state.success}
        </div>
      )}

      {/* Feature Availability Notice */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200">
        <div className="flex items-start">
          <InfoIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium">Feature Availability</h4>
            <p className="text-sm mt-1">
              <strong>Available:</strong> Location submission (POST/PUT), GPS integration, map visualization<br/>
              <strong>Limited:</strong> Real-time tracking and location history depend on server endpoints
            </p>
          </div>
        </div>
      </div>

      {/* Tracking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ComponentCard title="Total Locations">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {state.trackingStats?.total_locations?.toLocaleString() || 'N/A'}
          </div>
          {!state.trackingStats && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Stats endpoint not available
            </div>
          )}
        </ComponentCard>
        <ComponentCard title="Active Trucks">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {state.trackingStats?.active_trucks || 'N/A'}
          </div>
          {!state.trackingStats && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Stats endpoint not available
            </div>
          )}
        </ComponentCard>
        <ComponentCard title="Average Speed">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {state.trackingStats?.average_speed?.toFixed(1) || 'N/A'} km/h
          </div>
          {!state.trackingStats && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Stats endpoint not available
            </div>
          )}
        </ComponentCard>
        <ComponentCard title="Last Update">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {state.trackingStats?.last_update 
              ? new Date(state.trackingStats.last_update).toLocaleString()
              : 'N/A'
            }
          </div>
          {!state.trackingStats && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Stats endpoint not available
            </div>
          )}
        </ComponentCard>
      </div>

      {/* Map Visualization */}
      <ComponentCard title="Location Map">
        <div className="p-6">
          <GoogleMap 
            locations={state.locationHistory}
            currentLocation={state.currentLocation}
            bookingPosition={state.bookingPosition}
            height="500px"
          />
        </div>
      </ComponentCard>

      {/* Add Connected Services Section */}
      <ComponentCard title="Connected Services">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Booking
              </label>
              <select
                value={state.selectedBookingId || ''}
                onChange={(e) => handleBookingSelect(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select a booking</option>
                {state.bookings.map((booking) => (
                  <option key={booking.booking_id} value={booking.booking_id}>
                    Booking #{booking.booking_id} - {booking.source} to {booking.destination}
                  </option>
                ))}
              </select>
              
              {state.selectedBooking && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Booking Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">ID:</span>
                      <p className="font-medium">#{state.selectedBooking.booking_id}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">Status:</span>
                      <p className="font-medium capitalize">{state.selectedBooking.booking_status}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">Route:</span>
                      <p className="font-medium">{state.selectedBooking.source} → {state.selectedBooking.destination}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">Price:</span>
                      <p className="font-medium">₹{state.selectedBooking.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Dispatch Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dispatch Information
              </label>
              
              {state.dispatch ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Dispatch Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-green-700 dark:text-green-300">ID:</span>
                      <p className="font-medium">#{state.dispatch.dispatch_id}</p>
                    </div>
                    <div>
                      <span className="text-green-700 dark:text-green-300">Status:</span>
                      <p className="font-medium capitalize">{state.dispatch.status}</p>
                    </div>
                    <div>
                      <span className="text-green-700 dark:text-green-300">Driver:</span>
                      <p className="font-medium">
                        {state.dispatch.assigned_driver ? `Driver #${state.dispatch.assigned_driver}` : 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <span className="text-green-700 dark:text-green-300">Truck:</span>
                      <p className="font-medium">
                        {state.selectedBooking?.truck_id ? `Truck #${state.selectedBooking.truck_id}` : 'Not assigned'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {state.selectedBooking 
                      ? 'No dispatch assigned to this booking' 
                      : 'Select a booking to view dispatch information'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Booking Position Tracking */}
      <ComponentCard title="Booking Position Tracking">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Booking ID
              </label>
              <Input
                type="number"
                placeholder="Enter booking ID (e.g., 16)"
                value={state.selectedBookingId || ''}
                onChange={(e) => setState(prev => ({ ...prev, selectedBookingId: Number(e.target.value) || null }))}
              />
            </div>
            <Button
              onClick={() => state.selectedBookingId && loadBookingPosition(state.selectedBookingId)}
              disabled={!state.selectedBookingId}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <LocationIcon className="h-4 w-4" />
              Track Booking
            </Button>
          </div>
          
          {state.bookingPosition && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-3">
                Booking {state.selectedBookingId} Position
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-purple-700 dark:text-purple-300 font-medium">Coordinates:</span>
                  <p className="font-mono text-purple-900 dark:text-purple-100">
                    {state.bookingPosition.latitude.toFixed(6)}, {state.bookingPosition.longitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <span className="text-purple-700 dark:text-purple-300 font-medium">Truck ID:</span>
                  <p className="text-purple-900 dark:text-purple-100">{state.bookingPosition.truck_id}</p>
                </div>
                <div>
                  <span className="text-purple-700 dark:text-purple-300 font-medium">Location Type:</span>
                  <p className="text-purple-900 dark:text-purple-100">{state.bookingPosition.location_type}</p>
                </div>
                <div>
                  <span className="text-purple-700 dark:text-purple-300 font-medium">Last Updated:</span>
                  <p className="text-purple-900 dark:text-purple-100">
                    {new Date(state.bookingPosition.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ComponentCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Submission Form */}
        <ComponentCard title={state.isEditMode ? "Edit Location Data" : "Submit Location Data"}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Truck
              </label>
              <select
                value={locationForm.truck_id || ''}
                onChange={(e) => handleTruckSelect(Number(e.target.value))}
                disabled={state.isEditMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  state.isEditMode ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Select a truck</option>
                {state.trucks.map((truck) => (
                  <option key={truck.id} value={truck.id}>
                    {truck.truck_number} - {truck.number_plate}
                  </option>
                ))}
              </select>
              {state.isEditMode && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Truck cannot be changed when editing
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Latitude
                </label>
                <Input
                  type="number"
                  step={0.000001}
                  value={locationForm.latitude?.toString() || ''}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                  placeholder="28.6139"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Longitude
                </label>
                <Input
                  type="number"
                  step={0.000001}
                  value={locationForm.longitude?.toString() || ''}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                  placeholder="77.2090"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Altitude (m)
                </label>
                <Input
                  type="number"
                  value={locationForm.altitude?.toString() || ''}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, altitude: parseFloat(e.target.value) || 0 }))}
                  placeholder="215"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Speed (km/h)
                </label>
                <Input
                  type="number"
                  value={locationForm.speed?.toString() || ''}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, speed: parseFloat(e.target.value) || 0 }))}
                  placeholder="54"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Heading (°)
                </label>
                <Input
                  type="number"
                  value={locationForm.heading?.toString() || ''}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, heading: parseFloat(e.target.value) || 0 }))}
                  placeholder="92"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accuracy (m)
                </label>
                <Input
                  type="number"
                  value={locationForm.accuracy?.toString() || ''}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, accuracy: parseFloat(e.target.value) || 5 }))}
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location Type
                </label>
                <select
                  value={locationForm.location_type || 'gps'}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, location_type: e.target.value as 'gps' | 'network' | 'passive' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="gps">GPS</option>
                  <option value="network">Network</option>
                  <option value="passive">Passive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={getCurrentBrowserLocation}
                disabled={state.isEditMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  state.isEditMode 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <LocationIcon className="h-4 w-4" />
                Get Current Location
              </Button>
              
              {state.isEditMode ? (
                <>
                  <Button
                    onClick={submitLocation}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Update Location
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                  >
                    <CloseIcon className="h-4 w-4" />
                    Cancel Edit
                  </Button>
                </>
              ) : (
                <Button
                  onClick={submitLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <LocationIcon className="h-4 w-4" />
                  Submit Location
                </Button>
              )}
            </div>
          </div>
        </ComponentCard>

        {/* Current Location Display */}
        <ComponentCard title="Current Location">
          <div className="p-6">
            {state.currentLocation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Coordinates</label>
                    <p className="text-lg font-mono text-gray-900 dark:text-white">
                      {formatLocationData(state.currentLocation).coordinates}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Speed</label>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {formatLocationData(state.currentLocation).speed}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Heading</label>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {formatLocationData(state.currentLocation).heading}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Accuracy</label>
                    <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                      {formatLocationData(state.currentLocation).accuracy}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatLocationData(state.currentLocation).timestamp}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <LocationIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No location data available. Submit location data or start real-time tracking.
                </p>
              </div>
            )}
          </div>
        </ComponentCard>
      </div>

      {/* Location History */}
      <ComponentCard title="Location History">
        <div className="p-6">
          {state.locationHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Coordinates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Speed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Heading
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Accuracy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {state.locationHistory.map((location, index) => (
                    <tr key={location.location_id || index} className={state.editingLocation?.location_id === location.location_id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                        {formatLocationData(location).coordinates}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatLocationData(location).speed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatLocationData(location).heading}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatLocationData(location).accuracy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatLocationData(location).timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditLocation(location)}
                            disabled={state.isEditMode}
                            className={`px-3 py-1 text-xs rounded ${
                              state.isEditMode 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            <PencilIcon className="h-3 w-3" />
                          </Button>
                          {state.editingLocation?.location_id === location.location_id && (
                            <Badge color="info" variant="light" size="sm">
                              Editing
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Location History
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {state.error?.includes('endpoint not available') 
                  ? 'Location history endpoint is not available on the server.'
                  : 'No location data available. Submit some locations to see them here.'
                }
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                You can still submit new locations using the form above.
              </p>
            </div>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}
