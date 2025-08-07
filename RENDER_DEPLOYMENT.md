# Render Deployment Guide

This guide explains how to deploy your inventory tracking tool to Render while maintaining the three-user access restriction.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **PostgreSQL Database**: You'll need a PostgreSQL database (Render provides managed PostgreSQL)

## Step 1: Set Up PostgreSQL Database on Render

1. **Create a new PostgreSQL service**:
   - Go to your Render dashboard
   - Click "New" → "PostgreSQL"
   - Choose a name (e.g., "inventorypro-db")
   - Select your preferred region
   - Choose a plan (Free tier works for testing)
   - Click "Create Database"

2. **Get your database credentials**:
   - Once created, go to your database dashboard
   - Copy the "External Database URL" (this is your `DATABASE_URL`)
   - Note: The URL format is: `postgresql://username:password@host:port/database`

## Step 2: Deploy Your Web Service

1. **Create a new Web Service**:
   - Go to your Render dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Choose the repository containing your code

2. **Configure the service**:
   - **Name**: `inventorypro` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Choose based on your needs

3. **Add Environment Variables**:
   - Click on "Environment" tab
   - Add the following variables:
     ```
     NODE_ENV=production
     DATABASE_URL=your_postgresql_connection_string_from_step_1
     ```

## Step 3: Initialize Database and Users

After your service is deployed, you need to set up the database schema and create the three users.

### Option A: Using Render Shell (Recommended)

1. **Access your service shell**:
   - Go to your web service dashboard
   - Click on "Shell" tab
   - This opens a terminal in your deployed environment

2. **Run the setup commands**:
   ```bash
   # Push database schema
   npm run db:push
   
   # Set up production users
   npm run setup-production
   ```

### Option B: Using Local Development

If you prefer to set up from your local machine:

1. **Set environment variables locally**:
   ```bash
   export NODE_ENV=production
   export DATABASE_URL=your_render_postgresql_url
   ```

2. **Run setup commands**:
   ```bash
   npm run db:push
   npm run setup-production
   ```

## Step 4: Verify Deployment

1. **Check your application**:
   - Visit your Render service URL
   - You should see the login page

2. **Test login with the three users**:
   - **admin/admin123**
   - **manager/manager123**
   - **staff/staff123**

3. **Verify user restrictions**:
   - Try creating a new user account (should fail)
   - Only the three specified users should be able to login

## Step 5: Security Considerations

### Environment Variables
- Never commit sensitive data to your repository
- Use Render's environment variables for all secrets
- The `DATABASE_URL` should only be set in Render's environment

### Database Security
- Render's managed PostgreSQL is secure by default
- The database is only accessible from your web service
- SSL connections are automatically handled

### Application Security
- Only the three specified users can login
- Passwords are hashed using bcrypt
- Sessions are managed securely with Passport.js

## Troubleshooting

### Database Connection Issues
```bash
# Check if DATABASE_URL is set correctly
echo $DATABASE_URL

# Test database connection
npm run setup-production
```

### User Access Issues
```bash
# Check user status
npm run check-users

# Re-setup users if needed
npm run setup-production
```

### Build Issues
- Ensure all dependencies are in `package.json`
- Check that the build command completes successfully
- Verify the start command is correct

### Common Errors

**"User not found or inactive"**
- Run `npm run setup-production` to ensure users are created
- Check that `is_active` column exists in database

**"Database connection failed"**
- Verify `DATABASE_URL` is correct in Render environment variables
- Ensure the database service is running
- Check that SSL is properly configured

**"Schema not found"**
- Run `npm run db:push` to create database tables
- Ensure Drizzle configuration is correct

## Monitoring and Maintenance

### Regular Checks
- Monitor your application logs in Render dashboard
- Check user access periodically with `npm run check-users`
- Monitor database performance and storage

### Updates
- To update the application, simply push to your GitHub repository
- Render will automatically redeploy
- Run `npm run setup-production` after major updates if needed

### Backup
- Render automatically backs up your PostgreSQL database
- Consider setting up additional backups for critical data

## Cost Optimization

- **Free Tier**: Good for testing and small applications
- **Paid Plans**: Consider upgrading for production use
- **Database**: PostgreSQL free tier has limitations, upgrade for production

## Support

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **PostgreSQL Issues**: Check Render's managed database documentation
- **Application Issues**: Check your application logs in Render dashboard 