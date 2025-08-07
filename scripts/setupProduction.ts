import pool from "../db";
import bcrypt from "bcrypt";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

async function setupProduction() {
  try {
    console.log("🚀 Setting up production environment...");

    // Check if we're in production
    if (process.env.NODE_ENV !== 'production') {
      console.log("⚠️  This script is designed for production use");
      console.log("   Set NODE_ENV=production to run in production mode");
      process.exit(1);
    }

    // Check database connection
    console.log("📡 Testing database connection...");
    await pool.query('SELECT NOW()');
    console.log("✅ Database connection successful");

    // Check if users table exists
    console.log("🔍 Checking database schema...");
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log("❌ Users table does not exist");
      console.log("🔄 Creating database schema...");
      
      try {
        // Create drizzle instance and run migrations
        const db = drizzle(pool);
        await migrate(db, { migrationsFolder: "./migrations" });
        console.log("✅ Database schema created successfully");
      } catch (migrationError) {
        console.log("⚠️  Migration failed, trying schema push...");
        // Fallback: try to push schema directly
        const { execSync } = await import('child_process');
        try {
          execSync('npm run db:push', { stdio: 'inherit' });
          console.log("✅ Database schema pushed successfully");
        } catch (pushError) {
          console.error("❌ Failed to create database schema");
          console.error("   Please ensure your DATABASE_URL is correct and the database is accessible");
          process.exit(1);
        }
      }
    } else {
      console.log("✅ Database schema exists");
    }

    // Check if users table has the is_active column
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_active'
    `);

    if (columnCheck.rows.length === 0) {
      console.log("❌ Users table missing 'is_active' column");
      console.log("🔄 Updating schema...");
      try {
        const { execSync } = await import('child_process');
        execSync('npm run db:push', { stdio: 'inherit' });
        console.log("✅ Schema updated successfully");
      } catch (error) {
        console.error("❌ Failed to update schema");
        process.exit(1);
      }
    }

    console.log("✅ Database schema is up to date");

    // Check if users already exist
    const existingUsers = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(existingUsers.rows[0].count);

    if (userCount > 0) {
      console.log(`📋 Found ${userCount} existing users`);
      
      // Check if the three required users exist
      const requiredUsers = await pool.query(`
        SELECT username, is_active FROM users 
        WHERE username IN ('admin', 'manager', 'staff')
      `);

      const foundUsers = requiredUsers.rows.map((row: any) => row.username);
      const missingUsers = ['admin', 'manager', 'staff'].filter(user => !foundUsers.includes(user));

      if (missingUsers.length > 0) {
        console.log(`⚠️  Missing required users: ${missingUsers.join(', ')}`);
        console.log("   Creating missing users...");
        
        // Create missing users
        for (const username of missingUsers) {
          const password = `${username}123`;
          const role = username;
          const hashedPassword = await bcrypt.hash(password, 10);
          
          await pool.query(
            `INSERT INTO users (username, password, role, date_of_creation, is_active)
             VALUES ($1, $2, $3, $4, $5)`,
            [username, hashedPassword, role, new Date().toISOString(), true]
          );
          
          console.log(`✅ Created user: ${username}`);
        }
      }

      // Ensure only the three users are active
      console.log("🔒 Restricting access to only allowed users...");
      await pool.query(`
        UPDATE users 
        SET is_active = false 
        WHERE username NOT IN ('admin', 'manager', 'staff')
      `);

      // Ensure the three users are active
      await pool.query(`
        UPDATE users 
        SET is_active = true 
        WHERE username IN ('admin', 'manager', 'staff')
      `);

    } else {
      console.log("📝 No users found, creating the three required users...");
      
      // Create the three users
      const userData = [
        { username: "admin", password: "admin123", role: "admin" },
        { username: "manager", password: "manager123", role: "manager" },
        { username: "staff", password: "staff123", role: "staff" },
      ];

      for (const user of userData) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        await pool.query(
          `INSERT INTO users (username, password, role, date_of_creation, is_active)
           VALUES ($1, $2, $3, $4, $5)`,
          [user.username, hashedPassword, user.role, new Date().toISOString(), true]
        );
        
        console.log(`✅ Created user: ${user.username}`);
      }
    }

    // Verify final state
    const activeUsers = await pool.query(`
      SELECT username, role FROM users 
      WHERE is_active = true 
      ORDER BY username
    `);

    console.log("\n🎉 Production setup completed successfully!");
    console.log("\n📋 Active Users:");
    console.log("┌──────────┬─────────┐");
    console.log("│ Username │ Role    │");
    console.log("├──────────┼─────────┤");
    
    activeUsers.rows.forEach((user: any) => {
      console.log(`│ ${user.username.padEnd(8)} │ ${user.role.padEnd(7)} │`);
    });
    
    console.log("└──────────┴─────────┘");

    console.log("\n🔐 Login Credentials:");
    console.log("   admin/admin123");
    console.log("   manager/manager123");
    console.log("   staff/staff123");

    console.log("\n✅ Only these three users can access the application!");

  } catch (error) {
    console.error("❌ Production setup failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupProduction(); 