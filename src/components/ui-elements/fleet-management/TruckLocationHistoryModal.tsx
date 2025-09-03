'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { fleetService, TruckLocationRecord } from '@/services/fleetService';
import { Truck } from '@/services/fleetService';
import { CheckCircleIcon, AlertIcon, LocationIcon, ClockIcon } from '@/icons';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface TruckLocationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  truck?: Truck | null;
}

export default function TruckLocationHistoryModal({
  isOpen,
  onClose,
  truck
}: TruckLocationHistoryModalProps) {
  const [locationHistory, setLocationHistory] = useState<TruckLocationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const recordsPerPage = 20;

  // Fetch location history when modal opens
  useEffect(() => {
    if (isOpen && truck) {
      fetchLocationHistory();
    }
  }, [isOpen, truck, currentPage]);

  const fetchLocationHistory = async () => {
    if (!truck) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const skip = (currentPage - 1) * recordsPerPage;
      const history = await fleetService.getTruckLocationHistory(truck.id!, skip, recordsPerPage);
      
      console.log('Location history fetched:', history);
      
      if (currentPage === 1) {
        setLocationHistory(history);
      } else {
        setLocationHistory(prev => [...prev, ...history]);
      }
      
      setHasMore(history.length === recordsPerPage);
      setTotalRecords(prev => prev + history.length);
      
    } catch (err) {
      console.error('Failed to fetch location history:', err);
      setError('Failed to load location history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setLocationHistory([]);
      setCurrentPage(1);
      setTotalRecords(0);
      setHasMore(true);
      setError(null);
      onClose();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const getSourceIcon = (source: string) => {
    switch (source?.toUpperCase()) {
      case 'GPS':
        return <LocationIcon className="h-4 w-4 text-blue-600" />;
      case 'MANUAL':
        return <LocationIcon className="h-4 w-4 text-gray-600" />;
      case 'MOBILE_APP':
        return <LocationIcon className="h-4 w-4 text-green-600" />;
      case 'TRACKING_DEVICE':
        return <LocationIcon className="h-4 w-4 text-purple-600" />;
      default:
        return <LocationIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source?.toUpperCase()) {
      case 'GPS':
        return 'GPS';
      case 'MANUAL':
        return 'Manual Entry';
      case 'MOBILE_APP':
        return 'Mobile App';
      case 'TRACKING_DEVICE':
        return 'Tracking Device';
      default:
        return source || 'Unknown';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-6xl mx-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Truck Location History
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Location tracking history for truck {truck?.truck_number} ({truck?.number_plate})
          </p>
          {totalRecords > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Showing {totalRecords} location records
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertIcon className="h-5 w-5 text-red-600" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {truck && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Truck Details</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Number:</strong> {truck.truck_number}</p>
              <p><strong>Plate:</strong> {truck.number_plate}</p>
              <p><strong>Type:</strong> {truck.truck_type}</p>
              <p><strong>Status:</strong> {truck.status}</p>
            </div>
          </div>
        )}

        {locationHistory.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Timestamp
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Coordinates
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Altitude
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Speed
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Heading
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Accuracy
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Source
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {locationHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="px-4 py-2 text-start">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-800 dark:text-white/90">
                            {formatTimestamp(record.timestamp)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatCoordinates(record.latitude, record.longitude)}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {record.altitude ? `${record.altitude}m` : 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {record.speed_kmh ? `${record.speed_kmh} km/h` : 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {record.heading_degrees ? `${record.heading_degrees}°` : 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {record.accuracy_meters ? `${record.accuracy_meters}m` : 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-start">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(record.source)}
                          <span className="text-sm text-gray-800 dark:text-white/90">
                            {getSourceLabel(record.source)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : !isLoading && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <LocationIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No Location History</p>
            <p className="text-sm">No location records found for this truck.</p>
          </div>
        )}

        {hasMore && (
          <div className="mt-6 text-center">
            <Button
              onClick={loadMore}
              disabled={isLoading}
              variant="outline"
              className="px-6"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  Loading...
                </div>
              ) : (
                'Load More Records'
              )}
            </Button>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
