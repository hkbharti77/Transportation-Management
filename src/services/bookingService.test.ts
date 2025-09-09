/*
 * Booking Service Tests
 * 
 * NOTE: This project doesn't have Jest configured. To run these tests:
 * 1. Install Jest and related packages: npm install --save-dev jest @types/jest ts-jest
 * 2. Add jest.config.js configuration
 * 3. Add "test": "jest" to package.json scripts
 * 
 * For now, these tests serve as documentation of the expected API behavior.
 */

/*
import { bookingService } from '../bookingService';
import type { CreateBookingRequest, Booking, UpdateBookingStatusRequest, BookingWithDispatch, BookingAnalytics, BookingRevenue } from '../bookingService';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('BookingService', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock localStorage.getItem to return a test token
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'access_token') {
        return 'test-token';
      }
      if (key === 'current_user') {
        return JSON.stringify({ id: 1, role: 'admin', name: 'Test User' });
      }
      return null;
    });
  });

  describe('createBooking', () => {
    it('should create a new booking successfully', async () => {
      const mockBooking: Booking = {
        booking_id: 16,
        source: 'Mumbai',
        destination: 'Delhi',
        service_type: 'cargo',
        price: 15000,
        user_id: 3,
        truck_id: 4,
        booking_status: 'confirmed',
        created_at: '2025-09-08T22:12:36.598692+05:30',
        updated_at: '2025-09-08T22:12:36.598692+05:30'
      };

      const createRequest: CreateBookingRequest = {
        source: 'Mumbai',
        destination: 'Delhi',
        service_type: 'cargo',
        price: 15000,
        user_id: 3
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBooking),
      });

      const result = await bookingService.createBooking(createRequest);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
          body: JSON.stringify(createRequest),
        }
      );

      expect(result).toEqual(mockBooking);
    });

    it('should handle API errors when creating booking', async () => {
      const createRequest: CreateBookingRequest = {
        source: 'Mumbai',
        destination: 'Delhi',
        service_type: 'cargo',
        price: 15000,
        user_id: 3
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 422,
        json: () => Promise.resolve({
          detail: [
            {
              loc: ['body', 'price'],
              msg: 'ensure this value is greater than 0',
              type: 'value_error.number.not_gt'
            }
          ]
        }),
      });

      await expect(bookingService.createBooking(createRequest))
        .rejects.toThrow('HTTP error! status: 422');
    });
  });

  describe('getBookings', () => {
    it('should fetch bookings with filters', async () => {
      const mockBookings: Booking[] = [
        {
          booking_id: 1,
          source: 'Mumbai',
          destination: 'Delhi',
          service_type: 'cargo',
          price: 15000,
          user_id: 3,
          truck_id: 4,
          booking_status: 'confirmed',
          created_at: '2025-09-08T22:12:36.598692+05:30',
          updated_at: '2025-09-08T22:12:36.598692+05:30'
        }
      ];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBookings),
      });

      const filters = {
        booking_status: 'confirmed',
        service_type: 'cargo',
        page: 1,
        limit: 10
      };

      const result = await bookingService.getBookings(filters);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('bookings/?booking_status=confirmed&service_type=cargo&limit=10'),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result.data).toEqual(mockBookings);
    });
  });

  describe('getBookingsByUserId', () => {
    it('should fetch bookings for a specific user with pagination', async () => {
      const mockBookings: Booking[] = [
        {
          booking_id: 16,
          source: 'Mumbai',
          destination: 'Delhi',
          service_type: 'cargo',
          price: 15000,
          user_id: 3,
          truck_id: 4,
          booking_status: 'confirmed',
          created_at: '2025-09-08T22:12:36.598692+05:30',
          updated_at: '2025-09-08T17:58:30.304355+05:30'
        },
        {
          booking_id: 17,
          source: 'Mumbai',
          destination: 'Delhi',
          service_type: 'cargo',
          price: 15000,
          user_id: 3,
          truck_id: 4,
          booking_status: 'confirmed',
          created_at: '2025-09-08T23:30:06.328015+05:30',
          updated_at: '2025-09-08T23:30:06.328015+05:30'
        }
      ];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBookings),
      });

      const result = await bookingService.getBookingsByUserId(3, 0, 100);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/user/3?skip=0&limit=100',
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

    it('should handle pagination parameters correctly', async () => {
      const mockBookings: Booking[] = [];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBookings),
      });

      await bookingService.getBookingsByUserId(3, 50, 25);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/user/3?skip=50&limit=25',
        expect.any(Object)
      );
    });

    it('should enforce limit maximum of 100', async () => {
      const mockBookings: Booking[] = [];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBookings),
      });

      await bookingService.getBookingsByUserId(3, 0, 150);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/user/3?skip=0&limit=100',
        expect.any(Object)
      );
    });
  });

  describe('updateBookingStatus (new format)', () => {
    it('should update booking status with request body', async () => {
      const mockBooking: Booking = {
        booking_id: 16,
        source: 'Mumbai',
        destination: 'Delhi',
        service_type: 'cargo',
        price: 15000,
        user_id: 3,
        truck_id: 4,
        booking_status: 'pending',
        created_at: '2025-09-08T22:12:36.598692+05:30',
        updated_at: '2025-09-08T18:01:24.001628+05:30'
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBooking),
      });

      const result = await bookingService.updateBookingStatus(16, 'pending');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/16/status',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
          body: JSON.stringify({ booking_status: 'pending' }),
        }
      );

      expect(result).toEqual(mockBooking);
    });
  });

  describe('cancelBooking (DELETE method)', () => {
    it('should cancel booking using DELETE method', async () => {
      const mockBooking: Booking = {
        booking_id: 16,
        source: 'Mumbai',
        destination: 'Delhi',
        service_type: 'cargo',
        price: 15000,
        user_id: 3,
        truck_id: 4,
        booking_status: 'cancelled',
        created_at: '2025-09-08T22:12:36.598692+05:30',
        updated_at: '2025-09-08T18:02:00.486655+05:30'
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBooking),
      });

      const result = await bookingService.cancelBooking(16);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/16/cancel',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual(mockBooking);
    });
  });

  describe('getBookingsByStatus (new format)', () => {
    it('should fetch bookings by status with pagination', async () => {
      const mockBookings: Booking[] = [
        {
          booking_id: 17,
          source: 'Mumbai',
          destination: 'Delhi',
          service_type: 'cargo',
          price: 15000,
          user_id: 3,
          truck_id: 4,
          booking_status: 'confirmed',
          created_at: '2025-09-08T23:30:06.328015+05:30',
          updated_at: '2025-09-08T23:30:06.328015+05:30'
        }
      ];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBookings),
      });

      const result = await bookingService.getBookingsByStatus('confirmed', 0, 100);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/status/confirmed?skip=0&limit=100',
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

    it('should handle pagination parameters correctly', async () => {
      const mockBookings: Booking[] = [];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBookings),
      });

      await bookingService.getBookingsByStatus('pending', 50, 25);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/status/pending?skip=50&limit=25',
        expect.any(Object)
      );
    });
  });

  describe('confirmBooking', () => {
    it('should confirm a booking successfully', async () => {
      const mockBooking: Booking = {
        booking_id: 16,
        source: 'Mumbai',
        destination: 'Delhi',
        service_type: 'cargo',
        price: 15000,
        user_id: 3,
        truck_id: 4,
        booking_status: 'confirmed',
        created_at: '2025-09-08T22:12:36.598692+05:30',
        updated_at: '2025-09-08T18:08:45.986102+05:30'
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBooking),
      });

      const result = await bookingService.confirmBooking(16);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/16/confirm',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual(mockBooking);
    });
  });

  describe('completeBooking', () => {
    it('should complete a booking successfully', async () => {
      const mockBooking: Booking = {
        booking_id: 17,
        source: 'Mumbai',
        destination: 'Delhi',
        service_type: 'cargo',
        price: 15000,
        user_id: 3,
        truck_id: 4,
        booking_status: 'completed',
        created_at: '2025-09-08T23:30:06.328015+05:30',
        updated_at: '2025-09-08T18:09:23.896714+05:30'
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBooking),
      });

      const result = await bookingService.completeBooking(17);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/17/complete',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual(mockBooking);
    });
  });
    it('should fetch booking with dispatch information', async () => {
      const mockBookingWithDispatch: BookingWithDispatch = {
        booking: {
          booking_id: 16,
          destination: 'Delhi',
          service_type: 'cargo',
          price: 15000,
          updated_at: '2025-09-08T18:02:00.486655+05:30',
          user_id: 3,
          source: 'Mumbai',
          truck_id: 4,
          booking_status: 'cancelled',
          created_at: '2025-09-08T22:12:36.598692+05:30'
        },
        dispatch: {
          dispatch_id: 1,
          dispatch_time: null,
          status: 'cancelled',
          updated_at: '2025-09-08T23:32:00.485691+05:30',
          booking_id: 16,
          assigned_driver: null,
          arrival_time: null,
          created_at: '2025-09-08T22:12:36.598692+05:30'
        }
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBookingWithDispatch),
      });

      const result = await bookingService.getBookingWithDispatch(16);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/16/with-dispatch',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual(mockBookingWithDispatch);
    });
  });

  describe('getBookingById', () => {
    it('should fetch a single booking by ID', async () => {
      const mockBooking: Booking = {
        booking_id: 16,
        source: 'Mumbai',
        destination: 'Delhi',
        service_type: 'cargo',
        price: 15000,
        user_id: 3,
        truck_id: 4,
        booking_status: 'confirmed',
        created_at: '2025-09-08T22:12:36.598692+05:30',
        updated_at: '2025-09-08T22:12:36.598692+05:30'
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBooking),
      });

      const result = await bookingService.getBookingById(16);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/16',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual(mockBooking);
    });
  });

  describe('deleteBooking', () => {
    it('should delete a booking successfully', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{}'),
      });

      const result = await bookingService.deleteBooking(16);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/16',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual({ message: 'Booking deleted successfully' });
    });

    it('should handle delete error for confirmed booking', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          detail: 'Only pending or cancelled bookings can be deleted'
        }),
      });

      await expect(bookingService.deleteBooking(16))
        .rejects.toThrow('Only pending or cancelled bookings can be deleted');
    });
  });
  describe('cancelBooking (original test)', () => {
    it('should cancel booking successfully', async () => {
      const mockBooking: Booking = {
        booking_id: 16,
        source: 'Mumbai',
        destination: 'Delhi',
        service_type: 'cargo',
        price: 15000,
        user_id: 3,
        truck_id: 4,
        booking_status: 'cancelled',
        created_at: '2025-09-08T22:12:36.598692+05:30',
        updated_at: '2025-09-08T18:02:00.486655+05:30'
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBooking),
      });

      const result = await bookingService.cancelBooking(16);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/16/cancel',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual(mockBooking);
    });
  });

  describe('getBookingWithDispatch', () => {
    it('should fetch booking with dispatch information', async () => {
      const mockBookingWithDispatch: BookingWithDispatch = {
        booking: {
          booking_id: 16,
          destination: 'Delhi',
          service_type: 'cargo',
          price: 15000,
          updated_at: '2025-09-08T18:02:00.486655+05:30',
          user_id: 3,
          source: 'Mumbai',
          truck_id: 4,
          booking_status: 'cancelled',
          created_at: '2025-09-08T22:12:36.598692+05:30'
        },
        dispatch: {
          dispatch_id: 1,
          dispatch_time: null,
          status: 'cancelled',
          updated_at: '2025-09-08T23:32:00.485691+05:30',
          booking_id: 16,
          assigned_driver: null,
          arrival_time: null,
          created_at: '2025-09-08T22:12:36.598692+05:30'
        }
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBookingWithDispatch),
      });

      const result = await bookingService.getBookingWithDispatch(16);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/16/with-dispatch',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual(mockBookingWithDispatch);
    });
  });

  describe('getUserBookings', () => {
    it('should fetch current user bookings', async () => {
      const mockBookings: Booking[] = [
        {
          booking_id: 1,
          source: 'Mumbai',
          destination: 'Delhi',
          service_type: 'cargo',
          price: 15000,
          user_id: 3,
          truck_id: 4,
          booking_status: 'confirmed',
          created_at: '2025-09-08T22:12:36.598692+05:30',
          updated_at: '2025-09-08T22:12:36.598692+05:30'
        }
      ];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBookings),
      });

      const result = await bookingService.getUserBookings();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/me',
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

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorageMock.getItem.mockReturnValue('test-token');
      expect(bookingService.isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(bookingService.isAuthenticated()).toBe(false);
    });
  });

  describe('isCurrentUserAdmin', () => {
    it('should return true for admin user', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'current_user') {
          return JSON.stringify({ id: 1, role: 'admin', name: 'Admin User' });
        }
        return null;
      });
      
      expect(bookingService.isCurrentUserAdmin()).toBe(true);
    });

    it('should return false for non-admin user', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'current_user') {
          return JSON.stringify({ id: 1, role: 'customer', name: 'Regular User' });
        }
        return null;
      });
      
      expect(bookingService.isCurrentUserAdmin()).toBe(false);
    });

    it('should return false when no current user data', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(bookingService.isCurrentUserAdmin()).toBe(false);
    });
  });

  describe('getBookingAnalytics', () => {
    it('should fetch booking analytics data', async () => {
      const mockAnalytics: BookingAnalytics = {
        period: {
          start_date: '2025-08-10T00:00:52.705826',
          end_date: '2025-09-09T00:00:52.705826'
        },
        summary: {
          total_bookings: 2,
          completed_bookings: 1,
          total_revenue: 30000,
          average_booking_value: 15000,
          completion_rate: 50
        },
        by_status: [
          {
            status: 'confirmed',
            count: 1
          },
          {
            status: 'completed',
            count: 1
          }
        ],
        by_service_type: [
          {
            service_type: 'cargo',
            count: 2
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAnalytics),
      });

      const result = await bookingService.getBookingAnalytics();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/analytics',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual(mockAnalytics);
    });

    it('should fetch booking analytics with date parameters', async () => {
      const mockAnalytics: BookingAnalytics = {
        period: {
          start_date: '2025-08-01T00:00:00.000Z',
          end_date: '2025-08-31T23:59:59.999Z'
        },
        summary: {
          total_bookings: 5,
          completed_bookings: 3,
          total_revenue: 75000,
          average_booking_value: 15000,
          completion_rate: 60
        },
        by_status: [],
        by_service_type: []
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAnalytics),
      });

      const startDate = '2025-08-01T00:00:00.000Z';
      const endDate = '2025-08-31T23:59:59.999Z';

      const result = await bookingService.getBookingAnalytics(startDate, endDate);

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/v1/bookings/analytics?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('getBookingRevenue', () => {
    it('should fetch booking revenue data successfully', () => {
      const mockRevenueData: BookingRevenue = {
        period: {
          start_date: '2025-08-10T00:01:49.098824',
          end_date: '2025-09-09T00:01:49.098824'
        },
        total_revenue: 30000,
        revenue_by_status: [
          { status: 'confirmed', revenue: 15000 },
          { status: 'completed', revenue: 15000 }
        ],
        revenue_by_service_type: [
          { service_type: 'cargo', revenue: 30000 }
        ],
        daily_revenue_trend: [
          { date: '2025-09-08', revenue: 30000 }
        ]
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRevenueData),
      });

      const result = bookingService.getBookingRevenue();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/revenue',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).resolves.toEqual(mockRevenueData);
    });

    it('should fetch booking revenue data with date range', () => {
      const mockRevenueData: BookingRevenue = {
        period: {
          start_date: '2025-08-01T00:00:00.000000',
          end_date: '2025-08-31T23:59:59.999999'
        },
        total_revenue: 45000,
        revenue_by_status: [
          { status: 'confirmed', revenue: 20000 },
          { status: 'completed', revenue: 25000 }
        ],
        revenue_by_service_type: [
          { service_type: 'cargo', revenue: 35000 },
          { service_type: 'passenger', revenue: 10000 }
        ],
        daily_revenue_trend: [
          { date: '2025-08-01', revenue: 15000 },
          { date: '2025-08-15', revenue: 30000 }
        ]
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRevenueData),
      });

      const startDate = '2025-08-01T00:00:00.000Z';
      const endDate = '2025-08-31T23:59:59.999Z';
      const result = bookingService.getBookingRevenue(startDate, endDate);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings/revenue?start_date=2025-08-01T00%3A00%3A00.000Z&end_date=2025-08-31T23%3A59%3A59.999Z',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).resolves.toEqual(mockRevenueData);
    });
  });
});
*/

// Export type definitions for reference
// export type { CreateBookingRequest, Booking, UpdateBookingStatusRequest, BookingWithDispatch, BookingAnalytics, BookingRevenue } from '../bookingService';