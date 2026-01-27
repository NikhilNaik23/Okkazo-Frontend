# API Documentation - Okkazo Platform

This document outlines the expected API endpoints and data structures for the Okkazo event management platform backend.

## Table of Contents
- [Health & API Status](#health--api-status)
- [Authentication & Users](#authentication--users)
- [Vendors](#vendors)
- [Events](#events)
- [Bookings](#bookings)
- [Admin](#admin)
- [Manager](#manager)
- [Public](#public)
- [Notifications](#notifications)
- [Common Data Structures](#common-data-structures)
- [File Upload Configuration](#file-upload-configuration)
- [Error Responses](#error-responses)
- [Authentication](#authentication)
- [Pagination](#pagination)
- [Notes for Backend Team](#notes-for-backend-team)

---

## Health & API Status

### Health Check
**Endpoint:** `GET /api/health`

**Description:** Check if the API is running and database connections are healthy

**Response:**
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2026-01-27T10:30:00Z",
  "services": {
    "database": "up|down",
    "cache": "up|down",
    "storage": "up|down"
  },
  "uptime": "number (seconds)",
  "version": "string"
}
```

### API Information
**Endpoint:** `GET /api`

**Description:** Get API version and available endpoints information

**Response:**
```json
{
  "name": "Okkazo API",
  "version": "1.0.0",
  "description": "Event management platform API",
  "documentation": "/api/docs",
  "endpoints": {
    "auth": "/api/auth",
    "users": "/api/users",
    "vendors": "/api/vendors",
    "events": "/api/events",
    "bookings": "/api/bookings",
    "admin": "/api/admin",
    "public": "/api/public"
  },
  "status": "operational",
  "lastUpdated": "2026-01-27T10:30:00Z"
}
```

### Database Health
**Endpoint:** `GET /api/health/db`

**Description:** Detailed database connection and performance metrics

**Response:**
```json
{
  "status": "connected|disconnected",
  "responseTime": "number (ms)",
  "connections": {
    "active": "number",
    "idle": "number",
    "total": "number"
  },
  "lastCheck": "timestamp"
}
```

### API Metrics
**Endpoint:** `GET /api/metrics`

**Authentication:** Admin only

**Description:** API usage statistics and performance metrics

**Response:**
```json
{
  "requests": {
    "total": "number",
    "success": "number",
    "failed": "number",
    "avgResponseTime": "number (ms)"
  },
  "endpoints": [
    {
      "path": "string",
      "method": "string",
      "calls": "number",
      "avgTime": "number (ms)",
      "errorRate": "number (percentage)"
    }
  ],
  "period": "24h|7d|30d"
}
```

---

## Authentication & Users

### User Registration
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "user|vendor|manager|admin"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "token": "string"
  }
}
```

### User Login
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

### Get User Profile
**Endpoint:** `GET /api/users/profile`

**Response:** (Reference: `userData.jsx`)
```json
{
  "name": "string",
  "fullName": "string",
  "memberSince": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "avatar": "string (URL)",
  "bio": "string",
  "interests": ["string"]
}
```

### Get User Activities
**Endpoint:** `GET /api/users/activities`

**Response:** (Reference: `userData.jsx`)
```json
{
  "activities": [
    {
      "id": "number",
      "type": "purchase|review|share|follow",
      "title": "string",
      "description": "string",
      "time": "string"
    }
  ]
}
```

### Update User Profile
**Endpoint:** `PUT /api/users/profile`

**Request Body:**
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "bio": "string",
  "interests": ["string"]
}
```

---

## Vendors

### Vendor Registration
**Endpoint:** `POST /api/vendors/register`

**Request Body:** (Reference: `vendorRegistrationData.js`)
```json
{
  "businessName": "string",
  "serviceCategory": "Catering|Photography|Venue|Decor|Entertainment|Other",
  "email": "string",
  "phone": "string",
  "location": "string",
  "description": "string",
  "agreedToTerms": "boolean",
  "documents": {
    "businessLicense": "File (PDF, JPG, PNG - Max 5MB)",
    "ownerIdentity": "File (PDF, JPG, PNG - Max 5MB)",
    "otherProofs": ["File (Max 3 files)"]
  }
}
```

**Validation Rules:**
- `maxFileSize`: 5MB (5 * 1024 * 1024 bytes)
- `allowedFileTypes`: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
- `maxOtherProofs`: 3 files

**Response:**
```json
{
  "success": true,
  "vendorId": "string",
  "status": "PENDING",
  "message": "Your application has been submitted for review"
}
```

### Get Vendor Profile
**Endpoint:** `GET /api/vendors/:vendorId/profile`

**Response:** (Reference: `vendorProfileData.jsx`)
```json
{
  "name": "string",
  "rating": "string",
  "reviews": "string",
  "location": "string",
  "about": "string",
  "stats": [
    {
      "label": "string",
      "value": "string"
    }
  ],
  "services": [
    {
      "id": "number",
      "name": "string",
      "description": "string",
      "price": "string"
    }
  ],
  "businessDetails": {
    "businessName": "string",
    "serviceCategory": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "description": "string"
  },
  "documents": {
    "businessLicense": {
      "name": "string",
      "size": "number",
      "uploadDate": "string",
      "status": "Verified|Pending|Rejected",
      "url": "string"
    },
    "ownerIdentity": {
      "name": "string",
      "size": "number",
      "uploadDate": "string",
      "status": "Verified|Pending|Rejected",
      "url": "string"
    },
    "otherProofs": [
      {
        "name": "string",
        "size": "number",
        "uploadDate": "string",
        "status": "Verified|Pending|Rejected",
        "url": "string"
      }
    ]
  }
}
```

### Update Vendor Profile
**Endpoint:** `PUT /api/vendors/:vendorId/profile`

**Request Body:**
```json
{
  "about": "string",
  "services": [
    {
      "id": "number (optional for new)",
      "name": "string",
      "description": "string",
      "price": "string"
    }
  ]
}
```

### Get Vendor Dashboard
**Endpoint:** `GET /api/vendors/:vendorId/dashboard`

**Response:** (Reference: `vendorDashboardData.js`)
```json
{
  "stats": {
    "totalRevenue": {
      "value": "string",
      "change": "string",
      "trend": "up|down"
    },
    "activeBookings": {
      "value": "string",
      "status": "string"
    },
    "pendingRequests": {
      "value": "string",
      "priority": "string"
    }
  },
  "revenueData": {
    "Last 3 Months": [
      { "month": "string", "value": "number" }
    ],
    "Last 6 Months": [
      { "month": "string", "value": "number" }
    ],
    "Last Year": [
      { "month": "string", "value": "number" }
    ]
  },
  "servicePerformance": [
    {
      "name": "string",
      "percentage": "number",
      "color": "string (hex)"
    }
  ],
  "recentActivity": [
    {
      "id": "number",
      "title": "string",
      "status": "string",
      "details": "string",
      "time": "string",
      "type": "booking|success"
    }
  ],
  "upcomingConsultations": [
    {
      "id": "number",
      "name": "string",
      "time": "string",
      "type": "video|chat"
    }
  ]
}
```

### Get Vendor Booked Events
**Endpoint:** `GET /api/vendors/:vendorId/bookings`

**Query Parameters:**
- `status`: "all|pending|confirmed" (optional)

**Response:** (Reference: `bookedEventsData.js`)
```json
{
  "bookings": [
    {
      "id": "number",
      "title": "string",
      "status": "PENDING|CONFIRMED",
      "date": "string",
      "month": "string",
      "category": "string",
      "location": "string",
      "service": "string",
      "pax": "number"
    }
  ],
  "stats": {
    "pending": "number",
    "confirmed": "number"
  }
}
```

### Accept/Reject Booking Request
**Endpoint:** `POST /api/vendors/:vendorId/bookings/:bookingId/respond`

**Request Body:**
```json
{
  "action": "accept|reject",
  "reason": "string (required for reject)"
}
```

### Get All Vendors by Category
**Endpoint:** `GET /api/vendors`

**Query Parameters:**
- `category`: "Venue|Catering|Photography|Decor|Entertainment|Other" (optional)
- `location`: "string" (optional)
- `page`: "number" (optional)
- `limit`: "number" (optional)

**Response:** (Reference: `vendorData.js`)
```json
{
  "vendors": {
    "Venue": [
      {
        "id": "string",
        "name": "string",
        "rating": "number",
        "reviews": "number",
        "priceMin": "number",
        "priceMax": "number",
        "image": "string (URL)",
        "location": "string"
      }
    ],
    "Catering": [...],
    "Photography": [...],
    "Decor": [...],
    "Entertainment": [...]
  },
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

---

## Events

### Create Event (Planning Wizard)
**Endpoint:** `POST /api/events`

**Request Body:** (Reference: `planningWizardData.js`)
```json
{
  "title": "string",
  "type": "Birthday|Wedding|Corporate|Conference|etc.",
  "listingType": "Private|Public",
  "location": "string",
  "coordinates": {
    "lat": "number",
    "lng": "number"
  },
  "date": "string (ISO date)",
  "startTime": "string",
  "endTime": "string",
  "services": ["Venue", "Catering", "Photography", "etc."],
  "vendors": {
    "Venue": "vendorId",
    "Catering": "vendorId",
    "Photography": "vendorId"
  }
}
```

### Get All Events
**Endpoint:** `GET /api/events`

**Query Parameters:**
- `type`: "public|private" (optional)
- `category`: "string" (optional)
- `location`: "string" (optional)
- `page`: "number" (optional)
- `limit`: "number" (optional)

**Response:** (Reference: `eventsData.js`)
```json
{
  "events": [
    {
      "id": "number",
      "title": "string",
      "date": "string",
      "location": "string",
      "price": "string",
      "image": "string (URL)",
      "tag": "string",
      "status": "string",
      "categories": [
        {
          "name": "string",
          "price": "string"
        }
      ]
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

### Get Event Details
**Endpoint:** `GET /api/events/:eventId`

**Response:** (Reference: `eventDetailsData.js`)
```json
{
  "title": "string",
  "status": "IN PROGRESS|COMPLETED|CANCELLED",
  "category": "string",
  "subCategory": "string",
  "services": [
    {
      "type": "VENUE|CATERING|PHOTOGRAPHY",
      "name": "string"
    }
  ],
  "budget": {
    "original": "string",
    "revised": "string",
    "final": "string"
  },
  "transactions": [
    {
      "id": "string",
      "date": "string",
      "amount": "string",
      "method": "Wire Transfer|Credit Card|etc.",
      "status": "PAID|PENDING"
    }
  ],
  "manager": "string",
  "vendors": [
    {
      "name": "string",
      "status": "CONFIRMED|PENDING"
    }
  ],
  "logs": [
    {
      "title": "string",
      "time": "string",
      "type": "success|warning|info"
    }
  ]
}
```

### Get User's Events
**Endpoint:** `GET /api/users/:userId/events`

**Query Parameters:**
- `type`: "organized|attending" (optional)

**Response:** (Reference: `myEventsData.js`)
```json
{
  "organized": [
    {
      "id": "number",
      "title": "string",
      "date": "string",
      "location": "string",
      "image": "string (URL)",
      "status": "Live|Pending Approval|Draft",
      "sold": "string"
    }
  ],
  "tickets": [
    {
      "id": "number",
      "title": "string",
      "date": "string",
      "time": "string",
      "location": "string",
      "image": "string (URL)",
      "tickets": "string",
      "type": "string"
    }
  ]
}
```

### Promote Event
**Endpoint:** `POST /api/events/:eventId/promote`

**Request Body:**
```json
{
  "promotionType": "basic|premium",
  "duration": "number (days)",
  "targetAudience": ["string"]
}
```

### Event Checkout
**Endpoint:** `POST /api/events/:eventId/checkout`

**Request Body:**
```json
{
  "tickets": [
    {
      "categoryName": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "paymentMethod": "string",
  "billingDetails": {
    "name": "string",
    "email": "string",
    "phone": "string"
  }
}
```

---

## Bookings

### Create Booking
**Endpoint:** `POST /api/bookings`

**Request Body:**
```json
{
  "eventId": "string",
  "vendorId": "string",
  "serviceType": "string",
  "pax": "number",
  "notes": "string (optional)"
}
```

### Get Booking Details
**Endpoint:** `GET /api/bookings/:bookingId`

**Response:**
```json
{
  "id": "number",
  "eventTitle": "string",
  "vendorName": "string",
  "status": "PENDING|CONFIRMED|REJECTED|CANCELLED",
  "date": "string",
  "location": "string",
  "service": "string",
  "pax": "number",
  "amount": "number",
  "createdAt": "string"
}
```

---

## Admin

### Get Admin Dashboard
**Endpoint:** `GET /api/admin/dashboard`

**Response:**
```json
{
  "stats": {
    "totalEvents": "number",
    "totalVendors": "number",
    "totalRevenue": "string",
    "pendingApprovals": "number"
  }
}
```

### Get Events for Verification
**Endpoint:** `GET /api/admin/events`

**Query Parameters:**
- `status`: "pending|verified|rejected" (optional)

**Response:** (Reference: `adminData.js`)
```json
{
  "events": [
    {
      "id": "number",
      "title": "string",
      "organizer": "string",
      "date": "string",
      "submitted": "string",
      "category": "MUSIC FESTIVAL|CONFERENCE|EXHIBITION|WORKSHOP",
      "status": "URGENT|REVIEWING|PENDING",
      "image": "string (URL)"
    }
  ]
}
```

### Verify/Reject Event
**Endpoint:** `POST /api/admin/events/:eventId/verify`

**Request Body:**
```json
{
  "action": "approve|reject",
  "reason": "string (required for reject)"
}
```

### Get Vendors for Verification
**Endpoint:** `GET /api/admin/vendors`

**Query Parameters:**
- `status`: "pending|reviewing|approved|rejected" (optional)

**Response:** (Reference: `adminData.js`)
```json
{
  "vendors": [
    {
      "id": "string",
      "name": "string",
      "legalName": "string",
      "status": "PENDING|REVIEWING|APPROVED|REJECTED",
      "submittedDate": "string",
      "riskLevel": "Low Risk|Medium Risk|High Risk|Sanction Flag",
      "description": "string",
      "location": "string",
      "taxId": "string",
      "registryNumber": "string",
      "yearFounded": "string",
      "address": "string",
      "checks": {
        "businessLicense": {
          "status": "valid|invalid|warning",
          "match": "boolean",
          "message": "string"
        },
        "ownerIdentity": {
          "status": "valid|invalid|warning",
          "verified": "boolean",
          "message": "string"
        },
        "bankAccount": {
          "status": "valid|invalid|pending",
          "linked": "boolean",
          "message": "string"
        }
      }
    }
  ]
}
```

### Verify/Reject Vendor
**Endpoint:** `POST /api/admin/vendors/:vendorId/verify`

**Request Body:**
```json
{
  "action": "approve|reject",
  "reason": "string (required for reject)",
  "checks": {
    "businessLicense": "valid|invalid|warning",
    "ownerIdentity": "valid|invalid|warning",
    "bankAccount": "valid|invalid|pending"
  }
}
```

---

## Manager

### Get Manager Dashboard
**Endpoint:** `GET /api/managers/:managerId/dashboard`

**Response:**
```json
{
  "assignedEvents": "number",
  "activeVendors": "number",
  "pendingTasks": "number"
}
```

---

## Public

### Get Trending Events
**Endpoint:** `GET /api/public/trending-events`

**Response:** (Reference: `publicData.jsx`)
```json
{
  "events": [
    {
      "id": "number",
      "image": "string (URL)",
      "date": {
        "month": "string",
        "day": "string"
      },
      "tag": "string",
      "title": "string",
      "location": "string",
      "price": "string"
    }
  ]
}
```

### Get Platform Features
**Endpoint:** `GET /api/public/features`

**Response:** (Reference: `publicData.jsx`)
```json
{
  "features": [
    {
      "title": "string",
      "description": "string",
      "icon": "string (icon name)"
    }
  ]
}
```

---

## Notifications

### Get User Notifications
**Endpoint:** `GET /api/users/:userId/notifications`

**Response:** (Reference: `notificationsData.jsx`)
```json
{
  "new": [
    {
      "id": "number",
      "title": "string",
      "message": "string",
      "time": "string",
      "unread": "boolean",
      "type": "booking|message|update|review|promotion|recommendation"
    }
  ],
  "earlier": [...],
  "promotions": [...]
}
```

### Mark Notification as Read
**Endpoint:** `PUT /api/notifications/:notificationId/read`

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Mark All Notifications as Read
**Endpoint:** `PUT /api/users/:userId/notifications/read-all`

**Response:**
```json
{
  "success": true,
  "markedCount": "number"
}
```

### Delete Notification
**Endpoint:** `DELETE /api/notifications/:notificationId`

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

## Search & Filtering

### Global Search
**Endpoint:** `GET /api/search`

**Query Parameters:**
- `q`: "string" (search query - required)
- `type`: "events|vendors|all" (optional, default: all)
- `page`: "number" (optional)
- `limit`: "number" (optional)

**Response:**
```json
{
  "results": {
    "events": [
      {
        "id": "number",
        "title": "string",
        "type": "event",
        "relevance": "number"
      }
    ],
    "vendors": [
      {
        "id": "string",
        "name": "string",
        "type": "vendor",
        "relevance": "number"
      }
    ]
  },
  "totalResults": "number",
  "query": "string"
}
```

### Advanced Event Search
**Endpoint:** `GET /api/events/search`

**Query Parameters:**
- `keyword`: "string" (optional)
- `category`: "string" (optional)
- `location`: "string" (optional)
- `dateFrom`: "string (ISO date)" (optional)
- `dateTo`: "string (ISO date)" (optional)
- `priceMin`: "number" (optional)
- `priceMax`: "number" (optional)
- `sortBy`: "date|price|popularity" (optional)
- `page`: "number" (optional)
- `limit`: "number" (optional)

**Response:**
```json
{
  "events": [...],
  "filters": {
    "categories": ["string"],
    "locations": ["string"],
    "priceRange": {
      "min": "number",
      "max": "number"
    }
  },
  "pagination": {...}
}
```

---

## Common Data Structures

### Location Data
(Reference: `commonData.js`)
```json
{
  "locations": ["string"]
}
```

### Service Categories
(Reference: `planningWizardData.js`)
```json
{
  "categories": [
    "Catering",
    "Photography", 
    "Venue",
    "Decor",
    "Entertainment",
    "Other"
  ]
}
```

---

## File Upload Configuration

### File Upload Constraints
(Reference: `vendorRegistrationData.js`)

```json
{
  "maxFileSize": 5242880,
  "allowedTypes": [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg"
  ],
  "maxOtherProofs": 3
}
```

### File Upload Endpoint
**Endpoint:** `POST /api/upload`

**Request:** Multipart form data

**Response:**
```json
{
  "success": true,
  "file": {
    "name": "string",
    "url": "string",
    "size": "number",
    "type": "string"
  }
}
```

---

## Error Responses

All endpoints should return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}
```

### Common Error Codes:
- `VALIDATION_ERROR` - Invalid input data
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `SERVER_ERROR` - Internal server error

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens should be returned upon successful login/registration and should expire after a reasonable time period (e.g., 24 hours for access tokens).

Consider implementing refresh tokens for better security.

---

## Pagination

Endpoints that return lists should support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response should include pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

---

## Notes for Backend Team

1. **Date Format**: Use ISO 8601 format for all dates (e.g., "2026-01-27T10:30:00Z")
2. **Currency**: Store prices as numbers (in cents/smallest currency unit) to avoid floating-point issues
3. **File Storage**: Use cloud storage (S3, Azure Blob, etc.) for file uploads and return URLs
4. **Validation**: Implement server-side validation matching frontend constraints
5. **Status Values**: Use consistent status values across entities (PENDING, CONFIRMED, REJECTED, etc.)
6. **Real-time Updates**: Consider WebSocket implementation for real-time notifications and chat features
7. **Rate Limiting**: Implement rate limiting on all endpoints to prevent abuse
8. **Data Sanitization**: Always sanitize user inputs to prevent XSS and SQL injection

---

## Priority Implementation Order

1. **Health & Monitoring** - Health checks, API info, metrics endpoints
2. **Authentication** - User registration, login, token management, password reset
3. **Vendors** - Registration, profile management, dashboard
4. **Events** - Creation, listing, details, search
5. **Bookings** - Create, accept/reject, status management
6. **Admin** - Vendor/event verification workflows
7. **Notifications** - Real-time notification system
8. **Search & Filtering** - Global search, advanced filters
9. **Analytics** - Dashboard statistics and reporting
10. **File Upload** - Document management and verification

---

## Additional Endpoints to Consider

### Password Management
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `PUT /api/auth/change-password` - Change password (authenticated)

### Email Verification
- `POST /api/auth/send-verification` - Send verification email
- `GET /api/auth/verify-email/:token` - Verify email address

### Webhooks (for payment integration)
- `POST /api/webhooks/payment` - Payment gateway webhooks
- `POST /api/webhooks/notification` - External notification webhooks

### Analytics
- `GET /api/analytics/events/:eventId` - Event analytics
- `GET /api/analytics/vendor/:vendorId` - Vendor performance analytics
- `GET /api/analytics/platform` - Platform-wide analytics (admin only)

### Reviews & Ratings
- `POST /api/vendors/:vendorId/reviews` - Add vendor review
- `GET /api/vendors/:vendorId/reviews` - Get vendor reviews
- `POST /api/events/:eventId/reviews` - Add event review
- `GET /api/events/:eventId/reviews` - Get event reviews

### Chat/Messaging (if required)
- `GET /api/chats/:userId` - Get user conversations
- `POST /api/chats/:chatId/messages` - Send message
- `GET /api/chats/:chatId/messages` - Get messages
- `PUT /api/chats/:chatId/read` - Mark conversation as read

### Favorites/Bookmarks
- `POST /api/users/:userId/favorites` - Add to favorites
- `GET /api/users/:userId/favorites` - Get user favorites
- `DELETE /api/users/:userId/favorites/:itemId` - Remove from favorites

### Reports (Admin)
- `GET /api/admin/reports/revenue` - Revenue reports
- `GET /api/admin/reports/users` - User activity reports
- `GET /api/admin/reports/vendors` - Vendor performance reports
- `GET /api/admin/reports/events` - Event statistics reports

---

## WebSocket Events

For real-time features, implement WebSocket connections:

### Connection
**Endpoint:** `ws://api.okkazo.com/ws`

**Authentication:** Send token in connection query parameter or first message

### Events to Emit (Server → Client)
```javascript
{
  "event": "notification",
  "data": {
    "id": "number",
    "title": "string",
    "message": "string",
    "type": "string"
  }
}

{
  "event": "booking_update",
  "data": {
    "bookingId": "number",
    "status": "string",
    "vendorId": "string"
  }
}

{
  "event": "message",
  "data": {
    "chatId": "string",
    "from": "string",
    "content": "string",
    "timestamp": "string"
  }
}
```

### Events to Listen (Client → Server)
```javascript
{
  "event": "subscribe",
  "data": {
    "channels": ["notifications", "bookings", "chat"]
  }
}

{
  "event": "typing",
  "data": {
    "chatId": "string",
    "isTyping": "boolean"
  }
}
```

---

## Security Considerations

1. **Rate Limiting Examples:**
   - Login attempts: 5 per 15 minutes per IP
   - API calls: 100 per minute per user
   - File uploads: 10 per hour per user
   - Password reset: 3 per hour per email

2. **CORS Configuration:**
   - Allow origins: `https://okkazo.com`, `https://www.okkazo.com`
   - Allowed methods: GET, POST, PUT, DELETE, OPTIONS
   - Allowed headers: Authorization, Content-Type
   - Credentials: true

3. **Content Security:**
   - Implement CSRF tokens for state-changing operations
   - Validate and sanitize all file uploads
   - Use parameterized queries to prevent SQL injection
   - Implement XSS protection headers

4. **Data Protection:**
   - Encrypt sensitive data at rest
   - Use HTTPS for all communications
   - Implement data retention policies
   - GDPR compliance for user data deletion

---

## Environment Variables

Backend should support these environment variables:

```bash
# Server
PORT=3000
NODE_ENV=production|development|staging
API_VERSION=1.0.0

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=okkazo
DB_USER=okkazo_user
DB_PASSWORD=secure_password

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# File Storage
STORAGE_PROVIDER=s3|azure|local
AWS_BUCKET_NAME=okkazo-files
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@okkazo.com
SMTP_PASSWORD=your_password
FROM_EMAIL=Okkazo <noreply@okkazo.com>

# Payment Gateway
PAYMENT_PROVIDER=stripe|paypal
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# External Services
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
LOG_LEVEL=info|debug|error

# Frontend
FRONTEND_URL=https://okkazo.com
ADMIN_URL=https://admin.okkazo.com
```

---

**Last Updated:** January 27, 2026
**Version:** 1.0
**Frontend Reference:** /src/data/
