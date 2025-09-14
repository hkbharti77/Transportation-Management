'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LocationRecord } from '@/services/trackingService';

interface LocationMapProps {
  locations: LocationRecord[];
  currentLocation?: LocationRecord | null;
  bookingPosition?: LocationRecord | null;
  height?: string;
  className?: string;
}

interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  color: string;
  isCurrent?: boolean;
}

export default function LocationMap({ 
  locations, 
  currentLocation, 
  bookingPosition,
  height = '400px',
  className = ''
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<HTMLDivElement | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize map markers
  useEffect(() => {
    const newMarkers: MapMarker[] = [];

    // Add current location marker
    if (currentLocation) {
      newMarkers.push({
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
        title: `Current Location - Truck ${currentLocation.truck_id}`,
        color: '#ef4444', // Red for current location
        isCurrent: true
      });
    }

    // Add booking position marker
    if (bookingPosition) {
      newMarkers.push({
        lat: bookingPosition.latitude,
        lng: bookingPosition.longitude,
        title: `Booking Position - Truck ${bookingPosition.truck_id}`,
        color: '#8b5cf6', // Purple for booking position
        isCurrent: false
      });
    }

    // Add historical location markers
    locations.forEach((location, index) => {
      if (location.location_id !== currentLocation?.location_id && location.location_id !== bookingPosition?.location_id) {
        newMarkers.push({
          lat: location.latitude,
          lng: location.longitude,
          title: `Location ${index + 1} - Truck ${location.truck_id}`,
          color: '#3b82f6', // Blue for historical locations
          isCurrent: false
        });
      }
    });

    setMarkers(newMarkers);
  }, [locations, currentLocation, bookingPosition]);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapRef.current || isLoaded) return;

    // Simple map implementation using OpenStreetMap
    const initializeMap = () => {
      const mapContainer = mapRef.current;
      if (!mapContainer) return;

      // Create a simple map using Leaflet (you can replace this with Google Maps or Mapbox)
      const mapElement = document.createElement('div');
      mapElement.style.width = '100%';
      mapElement.style.height = '100%';
      mapElement.style.borderRadius = '8px';
      mapElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      mapElement.style.display = 'flex';
      mapElement.style.alignItems = 'center';
      mapElement.style.justifyContent = 'center';
      mapElement.style.color = 'white';
      mapElement.style.fontSize = '18px';
      mapElement.style.fontWeight = 'bold';
      mapElement.style.textAlign = 'center';
      mapElement.style.padding = '20px';
      mapElement.style.boxSizing = 'border-box';

      // Add map content
      mapElement.innerHTML = `
        <div>
          <div style="font-size: 24px; margin-bottom: 10px;">🗺️</div>
          <div>Location Map</div>
          <div style="font-size: 14px; margin-top: 10px; opacity: 0.8;">
            ${markers.length} location${markers.length !== 1 ? 's' : ''} plotted
          </div>
          ${currentLocation ? `
            <div style="font-size: 12px; margin-top: 5px; opacity: 0.7;">
              Current: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}
            </div>
          ` : ''}
          ${bookingPosition ? `
            <div style="font-size: 12px; margin-top: 5px; opacity: 0.7;">
              Booking: ${bookingPosition.latitude.toFixed(6)}, ${bookingPosition.longitude.toFixed(6)}
            </div>
          ` : ''}
        </div>
      `;

      mapContainer.appendChild(mapElement);
      setMap(mapElement);
      setIsLoaded(true);
    };

    // Simulate map loading
    const timer = setTimeout(initializeMap, 500);
    return () => clearTimeout(timer);
  }, [markers, currentLocation, isLoaded]);

  // Update map when markers change
  useEffect(() => {
    if (!map || !isLoaded) return;

    // Update the map content with new marker count
    const mapContent = map.querySelector('div');
    if (mapContent) {
      mapContent.innerHTML = `
        <div>
          <div style="font-size: 24px; margin-bottom: 10px;">🗺️</div>
          <div>Location Map</div>
          <div style="font-size: 14px; margin-top: 10px; opacity: 0.8;">
            ${markers.length} location${markers.length !== 1 ? 's' : ''} plotted
          </div>
          ${currentLocation ? `
            <div style="font-size: 12px; margin-top: 5px; opacity: 0.7;">
              Current: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}
            </div>
          ` : ''}
          ${bookingPosition ? `
            <div style="font-size: 12px; margin-top: 5px; opacity: 0.7;">
              Booking: ${bookingPosition.latitude.toFixed(6)}, ${bookingPosition.longitude.toFixed(6)}
            </div>
          ` : ''}
        </div>
      `;
    }
  }, [markers, currentLocation, map, isLoaded]);

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

      {/* Location Details Overlay */}
      {markers.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Location Details</h4>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            {markers.slice(0, 3).map((marker, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className={`w-2 h-2 rounded-full ${marker.isCurrent ? 'bg-red-500' : 'bg-blue-500'}`}
                ></div>
                <span>
                  {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                </span>
              </div>
            ))}
            {markers.length > 3 && (
              <div className="text-gray-500 dark:text-gray-500">
                +{markers.length - 3} more locations
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
