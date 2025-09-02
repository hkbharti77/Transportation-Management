# User Profile Implementation

## Overview

The user profile functionality has been implemented to allow users to view their own profile or admins to view any user's profile using the API endpoint `GET /api/v1/users/{user_id}`.

## Implementation Details

### 1. API Endpoint
- **URL**: `GET /api/v1/users/{user_id}`
- **Authentication**: Bearer token required
- **Access Control**: Admin users can view any profile, regular users can only view their own profile
- **Response**: Returns user details including name, email, phone, role, status, and timestamps

### 2. Components

#### User Profile Page (`/users/[id]/page.tsx`)
- Located at: `src/app/(admin)/(ui-elements)/users/[id]/page.tsx`
- Uses `userService.getUserById(userId)` to fetch user data
- Implements proper authentication and authorization checks
- Handles user actions (edit, delete, toggle status, reset password, change role)

#### UserDetailsCard Component
- Located at: `src/components/ui-elements/user-management/UserDetailsCard.tsx`
- Displays comprehensive user information
- Shows different action buttons based on user permissions
- Includes modals for delete confirmation and role changes

### 3. Security Features

#### Authentication
- Users must be logged in to access any profile
- Redirects to `/signin` if not authenticated

#### Authorization
- **Admin users**: Can view and manage any user profile
- **Regular users**: Can only view their own profile
- **Unauthorized access**: Redirects to users list

#### Action Permissions
- **Edit User**: Available to all authenticated users
- **Admin-only actions**:
  - Toggle user status (activate/deactivate)
  - Reset user password
  - Change user role
  - Delete user
- **Own profile actions**:
  - Change password (redirects to password change page)

### 4. User Service Methods

The following methods are implemented in `userService`:

```typescript
// Get user by ID
async getUserById(userId: number): Promise<User>

// Reset user password
async resetUserPassword(userId: number): Promise<ApiResponse<{ message: string }>>

// Change user role
async changeUserRole(userId: number, role: string): Promise<ApiResponse<User>>

// Toggle user status
async toggleUserStatus(userId: number, isActive: boolean): Promise<ApiResponse<User>>

// Delete user
async deleteUser(userId: number): Promise<ApiResponse<null>>
```

## Testing the Implementation

### 1. Prerequisites
- Backend server running on `http://localhost:8000`
- Valid Bearer token in localStorage
- User with admin role for testing admin functionality

### 2. Test Scenarios

#### Test Admin Access
1. Login as admin user
2. Navigate to `/users` to see user list
3. Click "View Profile" on any user
4. Verify all admin actions are visible
5. Test role change functionality
6. Test password reset functionality
7. Test user status toggle

#### Test Regular User Access
1. Login as regular user
2. Navigate to `/users/{your_user_id}`
3. Verify only own profile actions are visible
4. Verify admin actions are hidden

#### Test Unauthorized Access
1. Login as regular user
2. Try to access another user's profile: `/users/{other_user_id}`
3. Verify redirect to users list

### 3. API Testing

You can test the API endpoint directly using curl:

```bash
# Get user by ID (replace {user_id} and {token})
curl -X 'GET' \
  'http://localhost:8000/api/v1/users/{user_id}' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {your_token}'
```

### 4. Expected Response Format

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "phone": "1234567890",
  "role": "admin",
  "id": 14,
  "is_active": true,
  "created_at": "2025-08-31T10:51:19.040445+05:30",
  "updated_at": "2025-08-31T12:42:04.150106+05:30"
}
```

## File Structure

```
src/
├── app/(admin)/(ui-elements)/users/
│   ├── page.tsx                    # Users list page
│   ├── [id]/
│   │   ├── page.tsx               # User profile page
│   │   └── edit/
│   │       └── page.tsx           # Edit user page
│   └── create/
│       └── page.tsx               # Create user page
├── components/ui-elements/user-management/
│   ├── UserDetailsCard.tsx        # User profile display component
│   └── UserTable.tsx              # Users table component
└── services/
    └── userService.ts             # API service methods
```

## Error Handling

- **API Errors**: Proper error messages displayed to users
- **Authentication Errors**: Automatic redirect to login page
- **Authorization Errors**: Redirect to appropriate page with error message
- **Network Errors**: Fallback to empty data with warning message

## Future Enhancements

1. **Profile Picture Upload**: Add avatar upload functionality
2. **Activity Log**: Show user activity history
3. **Permission Management**: More granular permission controls
4. **Audit Trail**: Track changes made to user profiles
5. **Bulk Operations**: Support for bulk user management

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure backend server is running on `http://localhost:8000`
   - Check Bearer token is valid
   - Verify CORS settings on backend

2. **Permission Denied**
   - Check user role is 'admin' for admin actions
   - Verify user is accessing their own profile or has admin rights

3. **User Not Found**
   - Verify user ID exists in database
   - Check API endpoint is correct

### Debug Information

- Check browser console for error messages
- Verify localStorage contains valid access_token
- Check network tab for API request/response details
