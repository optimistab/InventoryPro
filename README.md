# InventoryPro - Inventory Tracking Tool

A secure inventory tracking system designed for managing laptops, computers, and related equipment with role-based access control for multiple authorized users across different departments.

## 🚀 Features

- **Secure User Access**: 17 authorized users across 6 roles (Admin, Developer, Support, Sales, Sales Manager, Inventory Staff)
- **Inventory Management**: Track products, clients, sales, and recovery items
- **Product Lifecycle Tracking**: Monitor product events from addition to disposal
- **Client Requirements Management**: Track customer needs and specifications
- **Dashboard Analytics**: Real-time statistics and insights
- **Role-Based Access**: Comprehensive role system with department-specific permissions

## 🔐 Security

- **Restricted Access**: 17 authorized users across 6 roles with controlled access
- **Password Hashing**: Secure bcrypt password encryption
- **Session Management**: Secure session handling with Passport.js
- **Database Security**: PostgreSQL with SSL connections in production



## 🛠️ Local Development

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd InventoryPro
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up the database**:
   ```bash
   npm run db:push
   ```

5. **Create users**:
   ```bash
   npm run create-users
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

7. **Access the application**:
    - Open http://localhost:3000
    - Login with one of the 17 authorized users (see user list below)

## 👥 Authorized Users

After running `npm run create-users`, the following users will be available:

### Admin Users (Full System Access)
- `admin_01` / `admin_01123`
- `admin_02` / `admin_02123`
- `admin_03` / `admin_03123`

### Developer Users
- `dev_01` / `dev_01123`
- `dev_02` / `dev_02123`

### Support Users
- `support_01` / `support_01123`
- `support_02` / `support_02123`

### Sales Users
- `sales_01` through `sales_06` / `sales_01123` through `sales_06123`

### Sales Manager Users
- `sales_mgr_01` / `sales_mgr_01123`
- `sales_mgr_02` / `sales_mgr_02123`

### Inventory Staff Users
- `inv_staff_01` / `inv_staff_01123`
- `inv_staff_02` / `inv_staff_02123`

## 🚀 Deployment to Render

### Quick Deployment

1. **Set up PostgreSQL on Render**:
   - Create a new PostgreSQL service in Render
   - Copy the External Database URL

2. **Deploy the web service**:
   - Connect your GitHub repository to Render
   - Set environment variables:
     - `NODE_ENV=production`
     - `DATABASE_URL=your_postgresql_connection_string`

3. **Initialize the database and users**:
    - Use Render Shell to run:
      ```bash
      npm run db:push
      npm run create-users
      ```

For detailed deployment instructions, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

## 📋 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking
```

### Database Management
```bash
npm run db:push      # Push schema changes to database
```

### User Management
```bash
npm run create-users     # Create all 17 authorized users across 6 roles
npm run restrict-users   # Deactivate unauthorized users
npm run check-users      # Check current user status
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts and authentication
- **products**: Inventory items (laptops, computers)
- **clients**: Customer information
- **sales**: Sales transactions
- **client_requirements**: Customer needs tracking
- **recovery_items**: Refurbished equipment
- **product_date_events**: Product lifecycle events

## 🔧 Configuration

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment (development/production)
- `SESSION_SECRET`: Session encryption key
- `PORT`: Server port (default: 3000)

### Database Configuration

The application automatically handles:
- SSL connections for production
- Connection pooling
- Schema migrations with Drizzle ORM

## 📊 Features Overview

### Dashboard
- Real-time inventory statistics
- Recent sales activity
- Quick action buttons
- Sales charts and analytics

### Inventory Management
- Add/edit/delete products
- Track stock quantities
- Monitor product conditions
- Manage product specifications

### Sales Tracking
- Record sales transactions
- Link sales to clients and products
- Track sale status and notes
- Generate sales reports

### Client Management
- Store customer information
- Track client requirements
- Monitor customer preferences
- Manage contact details

### Product Lifecycle
- Track product events from creation to disposal
- Monitor repair and recovery processes
- Record quality checks and warranty claims
- Maintain audit trail

## 🔒 Security Features

### Access Control
- 17 authorized users across 6 roles (admin, developer, support, salesperson, salesmanager, InventoryStaff)
- Role-based permissions with department-specific access
- Session-based authentication
- Automatic user deactivation for unauthorized accounts

### Data Protection
- Password hashing with bcrypt
- Secure session management
- SQL injection prevention
- Input validation and sanitization

## 🐛 Troubleshooting

### Common Issues

**"User not found or inactive"**
```bash
npm run check-users
npm run create-users
```

**Database connection issues**
```bash
# Check environment variables
echo $DATABASE_URL

# Test connection
npm run create-users
```

**Build errors**
```bash
npm install
npm run check
```

### Getting Help

1. Check the [USER_ACCESS_MANAGEMENT.md](./USER_ACCESS_MANAGEMENT.md) for user management
2. Review [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for deployment issues
3. Check application logs in Render dashboard
4. Verify database schema with `npm run db:push`

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

This is a private inventory management system with restricted access. For internal improvements:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support

For technical support or questions about the system:
- Check the documentation files
- Review the troubleshooting section
- Contact the system administrator