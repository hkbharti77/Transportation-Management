import { routeService, Trip, RouteDetailStats, RouteStatsResponse } from './routeService';

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

describe('RouteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRouteStats', () => {
    it('should fetch overall route statistics', async () => {
      // Mock response data
      const mockStats: RouteStatsResponse = {
        total_routes: 10,
        status_breakdown: {
          active: 7,
          inactive: 3
        },
        avg_distance: 25.5,
        avg_estimated_time: 45,
        avg_base_fare: 15.5
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStats),
      });

      const result = await routeService.getRouteStats();

      expect(fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/v1/routes/stats',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual(mockStats);
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ detail: 'Forbidden' }),
      });

      await expect(routeService.getRouteStats())
        .rejects
        .toThrow('Forbidden');
    });
  });

  describe('getRouteDetailStats', () => {
    it('should fetch statistics for a specific route', async () => {
      // Mock response data
      const mockStats: RouteDetailStats = {
        route_id: 1,
        route_number: "R001",
        total_trips: 1,
        active_trips: 1,
        completed_trips: 0,
        completion_rate: 0,
        base_fare: 15,
        estimated_time: 45,
        distance: 25.5
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStats),
      });

      const routeId = 1;
      const result = await routeService.getRouteDetailStats(routeId);

      expect(fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/v1/routes/1/stats',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual(mockStats);
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ detail: 'Route not found' }),
      });

      await expect(routeService.getRouteDetailStats(999))
        .rejects
        .toThrow('Route not found');
    });
  });

  describe('getRouteTrips', () => {
    it('should fetch trips for a specific route', async () => {
      // Mock response data
      const mockTrips: Trip[] = [
        {
          id: 3,
          departure_time: '2025-09-06T13:30:00',
          arrival_time: '2025-09-06T14:15:00',
          status: 'scheduled',
          fare: 15,
          available_seats: 44,
          total_seats: 50
        }
      ];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTrips),
      });

      const routeId = 1;
      const result = await routeService.getRouteTrips(routeId, 0, 100);

      expect(fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/v1/routes/1/trips?skip=0&limit=100',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual(mockTrips);
    });

    it('should limit the number of trips to 100', async () => {
      const mockTrips: Trip[] = [];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTrips),
      });

      const routeId = 1;
      await routeService.getRouteTrips(routeId, 0, 150); // Requesting 150, should be limited to 100

      expect(fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/v1/routes/1/trips?skip=0&limit=100',
        expect.anything()
      );
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ detail: 'Route not found' }),
      });

      await expect(routeService.getRouteTrips(999, 0, 10))
        .rejects
        .toThrow('Route not found');
    });
  });
});