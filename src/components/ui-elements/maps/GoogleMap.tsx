'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LocationRecord } from '@/services/trackingService';

interface GoogleMapProps {
  locations: LocationRecord[];
  currentLocation?: LocationRecord | null;
  bookingPosition?: LocationRecord | null;
  height?: string;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function GoogleMap({ 
  locations, 
  currentLocation, 
  bookingPosition,
  height = '400px',
  className = ''
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsScriptLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }

    return () => {
      // Clean up markers when component unmounts
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  // Initialize map when script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current) return;

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 10,
      center: currentLocation 
        ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
        : locations.length > 0
        ? { lat: locations[0].latitude, lng: locations[0].longitude }
        : { lat: 20.5937, lng: 78.9629 } // Center of India as default
    });

    mapInstanceRef.current = map;
    
    // Add markers
    updateMarkers(map);
  }, [isScriptLoaded, currentLocation, bookingPosition, locations]);

  // Update markers when locations change
  const updateMarkers = (map: any) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add current location marker
    if (currentLocation) {
      const marker = new window.google.maps.Marker({
        position: { lat: currentLocation.latitude, lng: currentLocation.longitude },
        map: map,
        title: `Current Location - Truck ${currentLocation.truck_id}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#ef4444', // Red
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });
      markersRef.current.push(marker);
    }

    // Add booking position marker
    if (bookingPosition) {
      const marker = new window.google.maps.Marker({
        position: { lat: bookingPosition.latitude, lng: bookingPosition.longitude },
        map: map,
        title: `Booking Position - Truck ${bookingPosition.truck_id}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#8b5cf6', // Purple
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });
      markersRef.current.push(marker);
    }

    // Add historical location markers
    locations.forEach((location, index) => {
      if (location.location_id !== currentLocation?.location_id && location.location_id !== bookingPosition?.location_id) {
        const marker = new window.google.maps.Marker({
          position: { lat: location.latitude, lng: location.longitude },
          map: map,
          title: `Location ${index + 1} - Truck ${location.truck_id}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3b82f6', // Blue
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 1
          }
        });
        markersRef.current.push(marker);
      }
    });

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach(marker => bounds.extend(marker.getPosition()));
      map.fitBounds(bounds);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        style={{ height }}
        className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
      />
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Current Location</span>
          </div>
          {bookingPosition && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-gray-700 dark:text-gray-300">Booking Position</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Historical Locations</span>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {!isScriptLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}