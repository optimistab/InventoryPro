# User Access Management

This system is configured to allow only three specific users to login and access the application.

## Allowed Users

The following three users are the only ones allowed to login:

| Username | Password | Role    |
|----------|----------|---------|
| admin    | admin123 | admin   |
| manager  | manager123 | manager |
| staff    | staff123 | staff   |

## Available Commands

### 1. Create Users
```bash
npm run create-users
```
This command creates the three allowed users with their respective credentials.

### 2. Restrict Access
```bash
npm run restrict-users
```
This command deactivates any users that are not in the allowed list, ensuring only the three specified users can login.

### 3. Check User Status
```bash
npm run check-users
```
This command displays the current status of all users in the database, showing which ones are active and can login.

## How It Works

The system uses an `is_active` boolean field in the users table to control access:

- **Active users** (`is_active = true`) can login and access the application
- **Inactive users** (`is_active = false`) cannot login, even with correct credentials

The authentication system checks this field during login attempts and only allows active users to authenticate.

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt before storage
2. **Active User Check**: Only users with `is_active = true` can login
3. **Role-Based Access**: Each user has a specific role (admin, manager, staff)
4. **Session Management**: Uses Passport.js for secure session handling

## Initial Setup

To set up the system with restricted access:

1. **Create the users**:
   ```bash
   npm run create-users
   ```

2. **Restrict access** (if you have existing users):
   ```bash
   npm run restrict-users
   ```

3. **Verify the setup**:
   ```bash
   npm run check-users
   ```

## Adding New Users (Not Recommended)

If you need to add additional users (not recommended for security), you would need to:

1. Modify the `scripts/createUsers.ts` file to include the new user
2. Run `npm run create-users` again (this will fail if users already exist)
3. Or manually insert the user with `is_active = true`

## Troubleshooting

### "User not found or inactive" Error
This means either:
- The username doesn't exist in the database
- The user exists but has `is_active = false`

### No Users Can Login
Run `npm run check-users` to see the current status. If no users are active, run:
```bash
npm run create-users
npm run restrict-users
```

### Database Schema Issues
If you get database errors, ensure the schema is up to date:
```bash
npm run db:push
```

## Security Best Practices

1. **Regular Password Changes**: Consider implementing password expiration
2. **Monitor Access**: Check user status regularly with `npm run check-users`
3. **Backup Users**: Keep a secure backup of user credentials
4. **Network Security**: Ensure the application is only accessible from trusted networks
5. **HTTPS**: Always use HTTPS in production environments 