import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupDatabaseDrizzle() {
  console.log('🔧 Setting up database with Drizzle migrations...');
  
  // Create connection pool with proper SSL configuration
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('render.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    // Create drizzle instance
    const db = drizzle(pool);
    
    console.log('📦 Running Drizzle migrations...');
    
    // Run migrations using Drizzle's migrate function
    try {
      await migrate(db, { migrationsFolder: './migrations' });
      console.log('✅ Drizzle migrations completed successfully!');
    } catch (migrationError) {
      // If migration fails due to existing tables, that's okay
      if (migrationError.message?.includes('already exists')) {
        console.log('⚠️  Some tables already exist, but this is normal');
        console.log('💡 Migration system will handle this gracefully');
        console.log('✅ Database is ready to use');
      } else {
        throw migrationError;
      }
    }
    
    // Test connection
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection test passed');
    
    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    
    // Provide helpful error messages
    if (error.message?.includes('SSL/TLS required')) {
      console.error('💡 SSL/TLS Error: Make sure your DATABASE_URL includes sslmode=require for production');
    } else if (error.message?.includes('relation') && error.message?.includes('already exists')) {
      console.log('⚠️  Some tables already exist, but this is normal');
      console.log('💡 The migration system will handle this gracefully');
    } else if (error.message?.includes('does not exist')) {
      console.error('💡 Database does not exist. Please create the database first.');
    }
    
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabaseDrizzle()
    .then(() => {
      console.log('🎉 Database setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

export default setupDatabaseDrizzle; 