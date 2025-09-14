import { tripService, TripResources } from './tripService';

// Mock the localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => 'test-token'),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

// Mock the fetch API
global.fetch = jest.fn();

describe('TripService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTripResources', () => {
    it('should fetch trip resources', async () => {
      // Mock response data
      const mockResources: TripResources = {
        vehicles: [
          {
            id: 1,
            truck_number: 'TRK-001',
            capacity: 1000,
            status: 'available'
          }
        ],
        drivers: [
          {
            id: 1,
            name: 'John Driver',
            license_number: 'DL123456',
            status: 'active'
          }
        ],
        routes: [
          {
            id: 1,
            route_number: 'R001',
            start_point: 'Point A',
            end_point: 'Point B'
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResources),
      });

      const result = await tripService.getTripResources();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/trips/resources',
        {
          method: 'GET',

          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual(mockResources);
    });

    it('should handle API errors when fetching trip resources', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ detail: 'Forbidden' }),
      });

      await expect(tripService.getTripResources())
        .rejects
        .toThrow('Forbidden');
    });
  });

  describe('bookTrip', () => {
    it('should book a trip', async () => {
      // Mock response data
      const mockBooking = {
        id: 1,
        trip_id: 1,
        user_id: 1,
        seat_number: 'A1',
        status: 'confirmed',
        booking_time: '2023-01-01T00:00:00Z'
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBooking),
      });

      const tripId = 1;
      const seatNumber = 'A1';
      const result = await tripService.bookTrip(tripId, seatNumber);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/trips/1/book',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
          body: JSON.stringify({
            trip_id: tripId,
            seat_number: seatNumber
          }),
        }
      );

      expect(result).toEqual(mockBooking);
    });
  });

  describe('getTripBookings', () => {
    it('should fetch bookings for a trip', async () => {
      // Mock response data
      const mockBookings = [
        {
          id: 1,
          trip_id: 1,
          user_id: 1,
          seat_number: 'A1',
          status: 'confirmed',
          booking_time: '2023-01-01T00:00:00Z'
        },
        {
          id: 2,
          trip_id: 1,
          user_id: 2,
          seat_number: 'A2',
          status: 'confirmed',
          booking_time: '2023-01-01T01:00:00Z'
        }
      ];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBookings),
      });

      const tripId = 1;
      const result = await tripService.getTripBookings(tripId);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/trips/1/bookings',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual(mockBookings);
    });
  });
});