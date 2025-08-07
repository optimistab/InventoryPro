# Drizzle Migration Workflow

This project now uses Drizzle's migration system for all database operations. Here's how to work with it:

## 🚀 **Quick Start**

### **Development Workflow:**

1. **Make schema changes** in `shared/schema.ts`
2. **Generate migration**: `npm run db:generate`
3. **Apply migration**: `npm run db:migrate`
4. **Start server**: `npm run dev` (automatically runs migrations)

### **Production Deployment:**

- **Automatic**: Deploy to Render - migrations run automatically
- **Manual**: `npm run setup-production`

## 📦 **Available Commands**

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate new migration from schema changes |
| `npm run db:migrate` | Apply all pending migrations |
| `npm run db:check` | Check database tables without migrations |
| `npm run db:setup` | Legacy setup (uses push command) |
| `npm run setup-production` | Full production setup with migrations |

## 🔄 **Workflow Examples**

### **Adding a New Table:**

1. **Update schema** in `shared/schema.ts`:
   ```typescript
   export const newTable = pgTable("new_table", {
     id: serial("id").primaryKey(),
     name: text("name").notNull(),
   });
   ```

2. **Generate migration**:
   ```bash
   npm run db:generate
   ```

3. **Review** the generated migration in `migrations/`

4. **Apply migration**:
   ```bash
   npm run db:migrate
   ```

### **Modifying Existing Table:**

1. **Update schema** in `shared/schema.ts`
2. **Generate migration**: `npm run db:generate`
3. **Apply migration**: `npm run db:migrate`

### **Deploying to Production:**

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add new table with migration"
   git push origin main
   ```

2. **Render will automatically**:
   - Run `npm run db:migrate` during deployment
   - Apply all pending migrations
   - Start the server

## 🛠️ **Migration Files**

- **Location**: `migrations/` directory
- **Format**: SQL files with timestamps
- **Meta**: JSON files tracking migration state

### **Migration Structure:**
```
migrations/
├── 0000_outstanding_lilandra.sql
├── 0001_add_missing_tables.sql
├── meta/
│   ├── 0000_snapshot.json
│   └── _journal.json
├── relations.ts
└── schema.ts
```

## 🔧 **Troubleshooting**

### **SSL Issues in Production:**
- The migration system automatically handles SSL for Render
- Uses `{ rejectUnauthorized: false }` for production connections

### **Migration Conflicts:**
- If tables already exist, migrations will handle gracefully
- Check migration logs for specific errors

### **Manual Migration:**
```bash
# Generate new migration
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Push schema (alternative)
npx drizzle-kit push
```

## 📋 **Best Practices**

1. **Always generate migrations** for schema changes
2. **Review migrations** before applying
3. **Test locally** before deploying
4. **Keep migrations small** and focused
5. **Never edit existing migrations** (create new ones instead)

## 🎯 **Benefits of This Approach**

- ✅ **Version Control**: All schema changes are tracked
- ✅ **Rollback Support**: Can rollback migrations if needed
- ✅ **Team Collaboration**: Everyone gets the same schema
- ✅ **Production Safety**: Safe deployment with migration tracking
- ✅ **SSL Support**: Handles production SSL requirements
- ✅ **Automatic Setup**: Runs migrations on server startup

## 🚨 **Important Notes**

- **Never delete migration files** once they're applied
- **Always test migrations** in development first
- **Backup production data** before major schema changes
- **Use transactions** for complex migrations (Drizzle handles this)

---

**Happy migrating! 🎉** 