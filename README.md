# InventoryPro - Database Development Approach

## Database Reset Strategy

**IMPORTANT:** This application uses a **database reset strategy** for development and deployment:

### Why Database Resets?
- **Rapid Development:** Schema changes happen frequently during development
- **Clean State:** Every `npm run dev` and deployment starts with a fresh database
- **No Migrations:** No need for backward compatibility or migration scripts
- **Simple Schema Updates:** Just update the base migration file and restart

### How It Works
1. **Database Reset:** `scripts/setupDatabase.ts` drops and recreates the entire database
2. **Schema Creation:** Single migration file `migrations/0000_outstanding_lilandra.sql` creates all tables
3. **Data Seeding:** Initial data is populated after schema creation
4. **User Creation:** Employee IDs are auto-generated in ADS0001 format

### Schema Update Process
When adding new columns/tables:

1. **Update Schema File:** Modify `shared/schema.ts`
2. **Update Migration:** Edit `migrations/0000_outstanding_lilandra.sql`
3. **Update Seed Data:** Modify `scripts/setupDatabase.ts` if needed
4. **Restart Application:** Database will reset with new schema

### Employee ID System
- **Format:** ADS0001, ADS0002, etc.
- **Auto-generated:** Sequential numbering during user creation
- **Unique:** Database constraint ensures no duplicates
- **Location:** `employee_id` column in `users` table

### Files Involved
- `scripts/setupDatabase.ts` - Main database setup script
- `migrations/0000_outstanding_lilandra.sql` - Base schema creation
- `shared/schema.ts` - TypeScript schema definitions
- `scripts/createUsers.ts` - User creation with employee IDs

This approach ensures fast development cycles without migration complexity.