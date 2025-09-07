import { userService, User } from './userService';

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

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateCurrentUser', () => {
    it('should update the current user profile', async () => {
      // Mock response data
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        role: 'customer',
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      const userData = { name: 'John Smith', phone: '0987654321' };
      const result = await userService.updateCurrentUser(userData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/users/me',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
          body: JSON.stringify(userData),
        }
      );

      expect(result).toEqual(mockUser);
    });

    it('should handle API errors when updating current user', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ detail: 'Bad Request' }),
      });

      const userData = { name: 'Invalid Name' };
      
      await expect(userService.updateCurrentUser(userData))
        .rejects
        .toThrow('Bad Request');
    });
  });

  describe('getDrivers', () => {
    it('should fetch all drivers', async () => {
      // Mock response data
      const mockDrivers: User[] = [
        {
          id: 1,
          name: 'Driver One',
          email: 'driver1@example.com',
          phone: '1234567890',
          role: 'driver',
          is_active: true,
          created_at: '2023-01-01T00:00:00Z',
        },
        {
          id: 2,
          name: 'Driver Two',
          email: 'driver2@example.com',
          phone: '0987654321',
          role: 'driver',
          is_active: true,
          created_at: '2023-01-02T00:00:00Z',
        }
      ];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDrivers),
      });

      const result = await userService.getDrivers(0, 10);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/users/drivers?skip=0&limit=10',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual(mockDrivers);
    });
  });

  describe('getCustomers', () => {
    it('should fetch all customers', async () => {
      // Mock response data
      const mockCustomers: User[] = [
        {
          id: 1,
          name: 'Customer One',
          email: 'customer1@example.com',
          phone: '1234567890',
          role: 'customer',
          is_active: true,
          created_at: '2023-01-01T00:00:00Z',
        },
        {
          id: 2,
          name: 'Customer Two',
          email: 'customer2@example.com',
          phone: '0987654321',
          role: 'customer',
          is_active: true,
          created_at: '2023-01-02T00:00:00Z',
        }
      ];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCustomers),
      });

      const result = await userService.getCustomers(0, 10);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/users/customers?skip=0&limit=10',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual(mockCustomers);
    });
  });

  describe('getTransporters', () => {
    it('should fetch all transporters', async () => {
      // Mock response data
      const mockTransporters: User[] = [
        {
          id: 1,
          name: 'Transporter One',
          email: 'transporter1@example.com',
          phone: '1234567890',
          role: 'public_service_manager',
          is_active: true,
          created_at: '2023-01-01T00:00:00Z',
        },
        {
          id: 2,
          name: 'Transporter Two',
          email: 'transporter2@example.com',
          phone: '0987654321',
          role: 'public_service_manager',
          is_active: true,
          created_at: '2023-01-02T00:00:00Z',
        }
      ];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTransporters),
      });

      const result = await userService.getTransporters(0, 10);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/users/transporters?skip=0&limit=10',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual(mockTransporters);
    });
  });

  describe('changeUserRole', () => {
    it('should change user role', async () => {
      // Mock response data
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        role: 'admin',
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: mockUser, success: true }),
      });

      const userId = 1;
      const newRole = 'admin';
      const result = await userService.changeUserRole(userId, newRole);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/users/1/role',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      expect(result).toEqual({ data: mockUser, success: true });
    });
  });

  describe('resetUserPassword', () => {
    it('should reset user password', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { message: 'Password reset successfully' }, success: true }),
      });

      const userId = 1;
      const result = await userService.resetUserPassword(userId);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/users/1/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }
      );

      expect(result).toEqual({ data: { message: 'Password reset successfully' }, success: true });
    });
  });
});