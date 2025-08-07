# InventoryPro - Inventory Tracking Tool

A secure inventory tracking system designed for managing laptops, computers, and related equipment with restricted access for only three authorized users.

## 🚀 Features

- **Secure User Access**: Only three authorized users can access the system
- **Inventory Management**: Track products, clients, sales, and recovery items
- **Product Lifecycle Tracking**: Monitor product events from addition to disposal
- **Client Requirements Management**: Track customer needs and specifications
- **Dashboard Analytics**: Real-time statistics and insights
- **Role-Based Access**: Admin, Manager, and Staff roles with different permissions

## 🔐 Security

- **Restricted Access**: Only three specific users can login
- **Password Hashing**: Secure bcrypt password encryption
- **Session Management**: Secure session handling with Passport.js
- **Database Security**: PostgreSQL with SSL connections in production

## 👥 Authorized Users

| Username | Password | Role    | Permissions |
|----------|----------|---------|-------------|
| admin    | admin123 | Admin   | Full access to all features |
| manager  | manager123 | Manager | Manage inventory and sales |
| staff    | staff123 | Staff   | View and update inventory |

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
   - Login with one of the three authorized users

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

3. **Initialize the database**:
   - Use Render Shell to run:
     ```bash
     npm run db:push
     npm run setup-production
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
npm run create-users     # Create the three authorized users
npm run restrict-users   # Deactivate unauthorized users
npm run check-users      # Check current user status
npm run setup-production # Set up production environment
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
- Only three predefined users can access the system
- Role-based permissions (admin, manager, staff)
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
npm run setup-production
```

**Database connection issues**
```bash
# Check environment variables
echo $DATABASE_URL

# Test connection
npm run setup-production
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

# npx drizzle-kit studio