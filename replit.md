# EduManager - Institute Management System

## Overview

EduManager is a comprehensive React.js application designed to streamline management operations for educational institutions. The system provides an integrated platform for managing students, faculty, courses, and timetable generation with Firebase backend services for authentication, data storage, and real-time notifications.

The application features a modern, responsive interface built with React, TypeScript, and Tailwind CSS, implementing Material Design principles. It includes role-based access control, department-wise organization, and intelligent conflict detection for timetable generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite for fast development and optimized builds
- Tailwind CSS with custom design system for consistent styling
- Wouter for lightweight client-side routing
- React Hook Form with Zod validation for form management
- TanStack Query for server state management and caching

**Component Organization:**
- Page-level components in `/pages` directory for main application views
- Reusable UI components in `/components/ui` following shadcn/ui patterns
- Feature-specific components organized by domain (auth, student, faculty, course, timetable)
- Layout components for navigation and shell structure

**State Management:**
- React Context API for global state (Auth, Institute, Theme contexts)
- Custom hooks for data fetching and business logic encapsulation
- Local component state for UI interactions

**Design System:**
- Custom CSS variables for theming with light/dark mode support
- Material Design 3 inspired color palette and component patterns
- Responsive design with mobile-first approach
- Accessibility considerations with proper ARIA labels and keyboard navigation

### Backend Architecture

**Server Setup:**
- Express.js server with TypeScript
- Development mode with Vite integration for hot module replacement
- RESTful API structure with `/api` prefix
- Error handling middleware with proper HTTP status codes

**Database Design:**
- PostgreSQL database with Drizzle ORM for type-safe database operations
- Neon Database integration for serverless PostgreSQL hosting
- Schema definitions in shared directory for type consistency
- Migration support through Drizzle Kit

**API Design:**
- Storage interface abstraction for flexible data persistence
- In-memory storage implementation for development
- CRUD operations with proper error handling
- Request/response logging for debugging

### Data Storage Solutions

**Primary Database:**
- PostgreSQL with Drizzle ORM for structured data storage
- Schema-first approach with automatic TypeScript type generation
- Support for complex relationships between entities

**Firestore Integration:**
- Real-time data synchronization for collaborative features
- Document-based storage for flexible data structures
- Collection organization: institutes, faculty, students, courses, timetables
- Optimistic updates with conflict resolution

**Session Management:**
- PostgreSQL session store with connect-pg-simple
- Secure session handling with proper expiration

### Authentication and Authorization

**Firebase Authentication:**
- Email/password authentication with domain validation
- Google Sign-In integration for streamlined access
- Role-based access control restricting to faculty members only
- Institute-specific email domain validation for security

**Access Control:**
- Institute selection before authentication to enforce domain restrictions
- User context management with automatic session restoration
- Protected routes with authentication guards

**Security Features:**
- Email domain validation against selected institute
- Secure session storage and management
- Environment variable protection for sensitive configuration

### External Dependencies

**Firebase Services:**
- Firebase Authentication for user management and OAuth
- Firestore for real-time database operations
- Firebase Cloud Messaging for push notifications to faculty
- Firebase SDK for web applications

**Database Services:**
- Neon Database for serverless PostgreSQL hosting
- Connection pooling and automatic scaling

**Development Tools:**
- Replit integration with cartographer and dev banner plugins
- Runtime error overlay for development debugging
- Hot module replacement for fast development cycles

**Export and Reporting:**
- jsPDF for PDF generation of timetables and reports
- xlsx library for Excel export functionality
- Custom export service for multiple format support

**UI and Styling:**
- Radix UI primitives for accessible component foundations
- Tailwind CSS for utility-first styling approach
- Material Icons for consistent iconography
- Custom fonts (Roboto, Inter, Fira Code) for typography hierarchy

**Form Handling:**
- React Hook Form for performant form management
- Zod schema validation for type-safe form validation
- Custom validation rules for domain-specific requirements

**Date and Time:**
- date-fns for date manipulation and formatting
- Custom time slot management for timetable generation

The architecture emphasizes type safety, real-time capabilities, and scalable design patterns while maintaining a clean separation of concerns between frontend, backend, and external services.