import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { users } from '../shared/schema';

// Load environment variables
dotenv.config();

async function resetDatabase() {
  console.log('🔄 Resetting database for development...');

  // Create connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('render.com')
      ? { rejectUnauthorized: false }
      : false,
  });

  try {
    const db = drizzle(pool);

    console.log('🗑️  Dropping all tables...');

    // More aggressive cleanup - drop everything
    try {
      await db.execute(sql`DROP SCHEMA public CASCADE;`);
    } catch (e) {
      // Ignore errors if schema doesn't exist
    }
    await db.execute(sql`CREATE SCHEMA public;`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO postgres;`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public;`);

    console.log('✅ Database schema reset successfully');

    // Clear migration journal to start fresh
    console.log('🧹 Clearing migration journal...');
    const fs = await import('fs');
    const path = await import('path');

    const journalPath = path.join(process.cwd(), 'migrations/meta/_journal.json');
    if (fs.existsSync(journalPath)) {
      fs.writeFileSync(journalPath, JSON.stringify({
        version: "7",
        dialect: "postgresql",
        entries: []
      }, null, 2));
      console.log('✅ Migration journal cleared');
    }

    console.log('📦 Recreating database schema...');

    // Run SQL migrations directly
    const migrationFiles = [
      '0000_outstanding_lilandra.sql'
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(process.cwd(), 'migrations', file);
      if (fs.existsSync(filePath)) {
        const sql = fs.readFileSync(filePath, 'utf8');
        console.log(`Running migration: ${file}`);
        await db.execute(sql);
      }
    }

    console.log('✅ Database schema recreated successfully');

    // Create users (always, in both development and production)
    console.log('👥 Creating users...');

    // Define the user structure with specified counts
    const userTypes = [
      { role: "admin", count: 3, prefix: "admin_" },
      { role: "developer", count: 2, prefix: "dev_" },
      { role: "support", count: 2, prefix: "support_" },
      { role: "salesperson", count: 6, prefix: "sales_" },
      { role: "salesmanager", count: 2, prefix: "sales_mgr_" },
      { role: "InventoryStaff", count: 2, prefix: "inv_staff_" }
    ];

    const allUsers: Array<{username: string, password: string, role: string}> = [];

    // Generate users for each type
    for (const userType of userTypes) {
      for (let i = 1; i <= userType.count; i++) {
        const username = `${userType.prefix}${String(i).padStart(2, '0')}`;
        const password = `${username}123`; // Pattern: [username]123
        allUsers.push({
          username,
          password,
          role: userType.role
        });
      }
    }

    // Hash passwords and insert users
    for (const user of allUsers) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Insert user into database
      await db.insert(users).values({
        username: user.username,
        password: hashedPassword,
        role: user.role,
        dateOfCreation: new Date().toISOString(),
        isActive: true,
      });

      console.log(`✅ Created user: ${user.username} (${user.role})`);
    }

    console.log('✅ Users created successfully!');
    console.log(`📊 Total users created: ${allUsers.length}`);
    console.log('🔐 User login pattern: [username]123');

    // Test connection
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection test passed');

    console.log('🎉 Database reset and user creation completed successfully!');
    console.log('📝 You can now make schema changes and restart dev server');
    console.log('🔐 User login pattern: [username]123 (e.g., admin_01 / admin_01123)');

  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  resetDatabase()
    .then(() => {
      console.log('🚀 Database is ready for development!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database reset failed:', error);
      process.exit(1);
    });
}

export default resetDatabase;