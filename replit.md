# LaptopTracker Pro - Business Management System

## Overview

LaptopTracker Pro is a comprehensive business management system designed for laptop and computer retailers. It provides full-stack functionality for inventory management, sales tracking, client relationship management, and device recovery operations. The application uses a modern web architecture with a React frontend, Express backend, and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with consistent error handling
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless hosting
- **Session Management**: PostgreSQL-based session storage

### Development Environment
- **Bundling**: esbuild for production builds
- **Development Server**: Vite with HMR and middleware integration
- **TypeScript**: Strict mode with path mapping
- **Linting**: Configured for React and TypeScript best practices

## Key Components

### Database Schema (shared/schema.ts)
- **Products**: Laptop and desktop inventory with SKU, pricing, specifications
- **Clients**: Customer information with contact details and company data
- **Sales**: Transaction records linking clients and products
- **Client Requirements**: Track customer needs and preferences
- **Recovery Items**: Manage device recovery and refurbishment operations

### API Routes (server/routes.ts)
- **Products API**: CRUD operations for inventory management
- **Clients API**: Customer relationship management endpoints
- **Sales API**: Transaction processing and reporting
- **Recovery API**: Device recovery workflow management
- **Dashboard API**: Aggregated statistics and analytics

### Frontend Pages
- **Dashboard**: Business overview with stats cards, charts, and quick actions
- **Inventory**: Product catalog with search, filtering, and management
- **Sales**: Transaction history and new sale creation
- **Clients**: Customer directory with contact management
- **Recovery**: Device recovery workflow tracking
- **Predictions**: Business analytics and forecasting

### UI Components
- **Forms**: Validated forms for products, clients, sales, and recovery items
- **Layout**: Responsive sidebar navigation with mobile support
- **Dashboard**: Stats cards, charts, recent sales, and quick actions
- **Data Tables**: Sortable, searchable tables for data management

## Data Flow

1. **Client Request**: User interacts with React components
2. **API Call**: TanStack Query manages HTTP requests to Express backend
3. **Route Handler**: Express routes process requests and validate data
4. **Database Operation**: Drizzle ORM executes type-safe PostgreSQL queries
5. **Response**: JSON data flows back through the same path
6. **UI Update**: React Query automatically updates UI with fresh data

### Form Validation Flow
1. **Frontend**: React Hook Form with Zod schema validation
2. **Backend**: Drizzle-Zod schemas ensure data consistency
3. **Database**: PostgreSQL constraints provide final validation layer

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection**: `@neondatabase/serverless` driver
- **Migrations**: Drizzle Kit for schema management

### UI Framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Tailwind CSS**: Utility-first styling
- **Class Variance Authority**: Component variant management

### Development Tools
- **Replit Integration**: Development environment optimizations
- **Vite Plugins**: Runtime error overlay and cartographer
- **TypeScript**: Full type safety across the stack

## Deployment Strategy

### Production Build
1. **Frontend**: Vite builds optimized React bundle to `dist/public`
2. **Backend**: esbuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations ensure schema consistency
4. **Environment**: Production configuration with optimized settings

### Development Environment
- **Hot Reload**: Vite middleware integrated with Express
- **Type Checking**: TypeScript compiler in watch mode
- **Database**: Development migrations with `drizzle-kit push`
- **Session Storage**: PostgreSQL-based sessions for scalability

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment-specific configurations
- **Session Management**: Secure session handling with PostgreSQL storage

The architecture prioritizes type safety, developer experience, and scalability while maintaining a clean separation of concerns between frontend, backend, and database layers.