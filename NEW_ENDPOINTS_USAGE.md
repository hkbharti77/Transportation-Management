# New Endpoints Usage Guide

This document explains how to use the newly implemented API endpoints in the Transportation Management system.

## 1. Update Current User Profile

### Endpoint
`PUT /api/v1/users/me`

### Implementation
The method is implemented in `userService.updateCurrentUser()`.

### Usage Example
```typescript
import { userService } from '@/services/userService';

// Update current user profile
try {
  const updatedUser = await userService.updateCurrentUser({
    name: 'New Name',
    phone: 'New Phone Number'
  });
  console.log('User updated:', updatedUser);
} catch (error) {
  console.error('Failed to update user:', error);
}
```

## 2. Get Trip Resources

### Endpoint
`GET /api/v1/trips/resources`

### Implementation
The method is implemented in `tripService.getTripResources()`.

### Usage Example
```typescript
import { tripService } from '@/services/tripService';

// Get trip resources for creating a new trip
try {
  const resources = await tripService.getTripResources();
  console.log('Available vehicles:', resources.vehicles);
  console.log('Available drivers:', resources.drivers);
  console.log('Available routes:', resources.routes);
} catch (error) {
  console.error('Failed to fetch trip resources:', error);
}
```

## Integration Examples

### Using updateCurrentUser in a Profile Update Form
```typescript
'use client';

import React, { useState } from 'react';
import { userService } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';

const ProfileUpdateForm: React.FC = () => {
  const { user, fetchUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await userService.updateCurrentUser({ name, phone });
      await fetchUserProfile(); // Refresh user data
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default ProfileUpdateForm;
```

### Using getTripResources in a Trip Creation Form
```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { tripService } from '@/services/tripService';

const TripCreationForm: React.FC = () => {
  const [resources, setResources] = useState<{
    vehicles: any[];
    drivers: any[];
    routes: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await tripService.getTripResources();
        setResources(data);
      } catch (err) {
        setError('Failed to load resources: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  if (loading) return <div>Loading resources...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!resources) return <div>No resources available</div>;

  return (
    <div>
      <h2>Create New Trip</h2>
      {/* Form with dropdowns for vehicles, drivers, and routes */}
      <form>
        <div>
          <label htmlFor="route">Route</label>
          <select id="route">
            {resources.routes.map(route => (
              <option key={route.id} value={route.id}>
                {route.route_number}: {route.start_point} → {route.end_point}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="vehicle">Vehicle</label>
          <select id="vehicle">
            {resources.vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.truck_number} (Capacity: {vehicle.capacity})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="driver">Driver</label>
          <select id="driver">
            {resources.drivers.map(driver => (
              <option key={driver.id} value={driver.id}>
                {driver.name} ({driver.license_number})
              </option>
            ))}
          </select>
        </div>
        
        {/* Other form fields for trip creation */}
        <button type="submit">Create Trip</button>
      </form>
    </div>
  );
};

export default TripCreationForm;
```

## Testing

The new methods are covered by unit tests:
- `userService.updateCurrentUser()` is tested in `userService.test.ts`
- `tripService.getTripResources()` is tested in `tripService.test.ts`

To run the tests:
```bash
npm test userService.test.ts
npm test tripService.test.ts
```