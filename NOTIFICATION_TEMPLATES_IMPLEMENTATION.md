# Notification Templates Implementation

This document provides details about the implementation of the notification templates feature in the Transportation Management system.

## Overview

The notification templates feature allows administrators to create, manage, and customize notification templates for different types of communications including SMS, email, and push notifications. Each template can contain dynamic variables that are replaced with actual values when sending notifications.

## Implementation Details

### Backend API

The feature integrates with the following backend API endpoints:

1. **GET** `/api/v1/notifications/templates` - Retrieve all notification templates
2. **POST** `/api/v1/notifications/templates` - Create a new notification template
3. **GET** `/api/v1/notifications/templates/{template_id}` - Retrieve a specific notification template
4. **PUT** `/api/v1/notifications/templates/{template_id}` - Update a specific notification template
5. **DELETE** `/api/v1/notifications/templates/{template_id}` - Delete a specific notification template
6. **PUT** `/api/v1/notifications/templates/{template_id}/status` - Toggle the active status of a template

### Frontend Components

The implementation includes the following React components:

1. **TemplateManagement** - Main page component that orchestrates the notification template management interface
2. **TemplateTable** - Displays a list of all notification templates in a table format
3. **TemplateForm** - Form component for creating and editing notification templates

### Service Layer

The `notificationService.ts` file provides a clean abstraction over the backend API calls:

- `getTemplates(filters)` - Fetch templates with optional filtering
- `getTemplateById(templateId)` - Fetch a specific template by ID
- `createTemplate(templateData)` - Create a new template
- `updateTemplate(templateId, templateData)` - Update an existing template
- `deleteTemplate(templateId)` - Delete a template
- `toggleTemplateStatus(templateId, is_active)` - Toggle template active status

## Template Structure

Each notification template contains the following fields:

- `name` - A descriptive name for the template
- `title_template` - The title or subject line for the notification
- `message_template` - The main content of the notification with variable placeholders
- `notification_type` - The type of notification (sms, email, or push)
- `category` - A category for organizing templates (e.g., booking, trip, order)
- `is_active` - Whether the template is currently active
- `variables` - An object containing example values for template variables

## Variable System

Templates support dynamic variables using double curly brace syntax (e.g., `{{variable_name}}`). When sending notifications, these placeholders are replaced with actual values.

Example:
```
Hello {{customer_name}}, your booking #{{booking_id}} has been confirmed for {{date}}.
```

## UI Features

1. **Template Listing** - View all notification templates in a sortable table
2. **Create New Template** - Form for creating new notification templates
3. **Edit Existing Template** - Form for modifying existing templates
4. **Status Toggle** - Quickly activate or deactivate templates
5. **Variable Management** - Define and manage template variables with example values

## Security

The notification service follows the same authentication patterns as other services in the application:
- Uses Bearer token authentication
- Automatically handles 401/403 responses by redirecting to login
- Properly handles API errors and displays user-friendly messages

## Future Enhancements

Potential future improvements could include:
- Template preview functionality
- Template categorization and filtering
- Bulk operations (activate/deactivate multiple templates)
- Template import/export functionality
- Rich text editor for email templates
- Template versioning system