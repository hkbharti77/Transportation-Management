# User Management System - TailAdmin Integration

## Overview

A comprehensive User Management System built with Next.js, Tailwind CSS, and TailAdmin template components. This system provides full CRUD operations for user management with role-based access control, search, filtering, and pagination capabilities.

## Features

### Core Functionality
- ✅ **Create/Update/Delete Users** - Full CRUD operations
- ✅ **Role Management** - Admin, Staff, Customer roles
- ✅ **User Status Control** - Activate/Deactivate users
- ✅ **Password Reset** - Admin-initiated password resets
- ✅ **Search & Filter** - Advanced search and filtering capabilities
- ✅ **Pagination** - Efficient data loading with pagination
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **Dark Mode Support** - Full dark mode compatibility

### User Roles
- **Admin** - Full system access and user management
- **Staff** - Limited administrative access
- **Customer** - Basic user access

## Architecture

### Pages Structure
```
src/app/(admin)/(ui-elements)/users/
├── page.tsx                    # User list page
├── create/
│   └── page.tsx               # Create user page
└── [id]/
    ├── page.tsx               # User details page
    └── edit/
        └── page.tsx           # Edit user page
```

### Components Structure
```
src/components/ui-elements/user-management/
├── UserTable.tsx              # Main user table component
├── UserForm.tsx               # Reusable form for create/edit
├── UserSearchFilter.tsx       # Search and filter interface
└── UserDetailsCard.tsx        # User details display
```

### Services
```
src/services/
└── userService.ts             # API service layer
```

## API Integration

### Authentication
```typescript
// Admin Login
POST /api/v1/auth/login
Body: { email: string, password: string }
Response: { token: string, user: User }
```

### User Management Endpoints

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| List Users | GET | `/api/v1/users/` | Get paginated users with filters |
| Get User | GET | `/api/v1/users/{user_id}` | Get specific user details |
| Create User | POST | `/api/v1/users/` | Create new user |
| Update User | PUT | `/api/v1/users/{user_id}` | Update user information |
| Delete User | DELETE | `/api/v1/users/{user_id}` | Delete user |
| Change Role | PUT | `/api/v1/users/{user_id}/role` | Update user role |
| Toggle Status | PUT | `/api/v1/users/{user_id}/activate` | Activate/Deactivate user |
| Reset Password | POST | `/api/v1/users/{user_id}/reset-password` | Reset user password |

### Query Parameters
- `search` - Search by name, email, or phone
- `role` - Filter by role (admin, staff, customer)
- `status` - Filter by status (active, inactive)
- `page` - Page number for pagination
- `limit` - Items per page

## Components Documentation

### UserTable Component
**Purpose**: Displays users in a table format with actions

**Props**:
```typescript
interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  onToggleStatus: (userId: number, isActive: boolean) => void;
  onResetPassword: (userId: number) => void;
  onRoleChange: (userId: number, role: string) => void;
  isLoading?: boolean;
}
```

**Features**:
- Responsive table design
- Role and status badges
- Action dropdowns for each user
- Loading states
- Empty state handling

### UserForm Component
**Purpose**: Reusable form for creating and editing users

**Props**:
```typescript
interface UserFormProps {
  user?: User | null;
  onSubmit: (userData: User) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}
```

**Features**:
- Form validation
- Role selection
- Status toggle
- Email field disabled in edit mode
- Confirmation modal for unsaved changes

### UserSearchFilter Component
**Purpose**: Search and filter interface for user list

**Props**:
```typescript
interface UserSearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  onReset: () => void;
  isLoading?: boolean;
}
```

**Features**:
- Debounced search
- Role and status filters
- Collapsible filter panel
- Reset functionality
- Create user button

### UserDetailsCard Component
**Purpose**: Detailed user information display with actions

**Props**:
```typescript
interface UserDetailsCardProps {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onResetPassword: () => void;
  onRoleChange: (role: string) => void;
  isLoading?: boolean;
}
```

**Features**:
- User avatar and information display
- Action buttons for all operations
- Confirmation modals for destructive actions
- Role change modal
- Loading states

## Usage Examples

### Basic User List Implementation
```typescript
import UserTable from '@/components/ui-elements/user-management/UserTable';
import { userService } from '@/services/userService';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      const response = await userService.getUsers();
      setUsers(response.data);
    };
    fetchUsers();
  }, []);

  return (
    <UserTable
      users={users}
      onEdit={(user) => router.push(`/users/${user.id}/edit`)}
      onDelete={handleDelete}
      onToggleStatus={handleToggleStatus}
      onResetPassword={handleResetPassword}
      onRoleChange={handleRoleChange}
    />
  );
};
```

### Creating a New User
```typescript
import UserForm from '@/components/ui-elements/user-management/UserForm';
import { userService } from '@/services/userService';

const CreateUserPage = () => {
  const handleSubmit = async (userData) => {
    try {
      await userService.createUser(userData);
      router.push('/users');
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return (
    <UserForm
      mode="create"
      onSubmit={handleSubmit}
      onCancel={() => router.push('/users')}
    />
  );
};
```

## Styling and Theming

### Tailwind CSS Classes
The system uses TailAdmin's design system with consistent spacing, colors, and typography:

- **Colors**: Brand colors for primary actions, semantic colors for status
- **Spacing**: Consistent padding and margins using Tailwind's spacing scale
- **Typography**: TailAdmin's text classes for consistent font sizes and weights
- **Dark Mode**: Full dark mode support with proper color contrasts

### Component Styling
All components follow TailAdmin's design patterns:
- Rounded corners (`rounded-2xl`)
- Consistent borders (`border-gray-200`)
- Proper shadows (`shadow-theme-lg`)
- Responsive design with mobile-first approach

## Error Handling

### API Error Handling
```typescript
try {
  const response = await userService.getUsers();
  // Handle success
} catch (error) {
  // Handle error with user-friendly messages
  console.error('API Error:', error);
  // Show toast notification or error state
}
```

### Form Validation
- Client-side validation for required fields
- Email format validation
- Phone number validation
- Real-time error clearing

## Performance Optimizations

### Pagination
- Server-side pagination to handle large datasets
- Configurable page sizes
- Efficient data loading

### Search Debouncing
- 300ms debounce for search queries
- Reduces API calls during typing

### Loading States
- Skeleton loading for tables
- Button loading states
- Optimistic updates where appropriate

## Security Considerations

### Authentication
- JWT token-based authentication
- Token storage in localStorage
- Automatic token inclusion in API requests

### Authorization
- Role-based access control
- Admin-only operations protected
- Input validation and sanitization

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Chrome Mobile
- **JavaScript**: ES6+ features supported

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- TailAdmin template

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

## Testing

### Component Testing
- Unit tests for form validation
- Integration tests for API calls
- E2E tests for user workflows

### Manual Testing Checklist
- [ ] User creation flow
- [ ] User editing flow
- [ ] User deletion with confirmation
- [ ] Role changes
- [ ] Status toggles
- [ ] Password reset
- [ ] Search functionality
- [ ] Filter functionality
- [ ] Pagination
- [ ] Responsive design
- [ ] Dark mode toggle

## Future Enhancements

### Planned Features
- Bulk operations (bulk delete, bulk role change)
- User activity logs
- Advanced filtering options
- Export functionality (CSV, PDF)
- User import from CSV
- Audit trail
- Two-factor authentication
- User groups and permissions

### Performance Improvements
- Virtual scrolling for large datasets
- Caching strategies
- Image optimization
- Bundle size optimization

## Support and Maintenance

### Code Organization
- Modular component architecture
- Reusable service layer
- Consistent naming conventions
- Comprehensive TypeScript types

### Documentation
- Inline code comments
- Component prop documentation
- API endpoint documentation
- Usage examples

### Maintenance
- Regular dependency updates
- Security patches
- Performance monitoring
- User feedback integration

---

This User Management System provides a solid foundation for user administration with modern UI/UX patterns, comprehensive functionality, and excellent developer experience.
