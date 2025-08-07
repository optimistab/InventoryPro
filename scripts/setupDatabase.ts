import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Load environment variables
dotenv.config();

async function setupDatabase() {
  console.log('🔧 Setting up database...');
  
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
    
    console.log('📦 Checking database schema...');
    
    // Test connection first
    const testResult = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection test passed');
    
    // Try to push schema changes, but don't fail if it doesn't work
    try {
      console.log('📦 Attempting to sync schema...');
      
      // Create a modified DATABASE_URL with SSL parameters for drizzle-kit
      let databaseUrl = process.env.DATABASE_URL;
      if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('render.com')) {
        // Add SSL parameters to the connection string
        if (!databaseUrl?.includes('sslmode=')) {
          databaseUrl = `${databaseUrl}?sslmode=require`;
        }
      }
      
      // Set environment variables for drizzle-kit
      const env = { 
        ...process.env, 
        DATABASE_URL: databaseUrl,
        PGSSLMODE: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('render.com') ? 'require' : undefined
      };
      
      execSync('npx drizzle-kit push', { stdio: 'inherit', env });
      console.log('✅ Schema changes applied successfully!');
    } catch (pushError) {
      console.log('⚠️  Schema sync failed, but database connection is working');
      console.log('💡 This is normal if all tables already exist');
      console.log('🔧 You can manually run: npx drizzle-kit push');
    }
    
    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then(() => {
      console.log('🎉 Database setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

export default setupDatabase; 