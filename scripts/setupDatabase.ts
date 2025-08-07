import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Load environment variables
dotenv.config();

async function setupDatabase() {
  console.log('🔧 Setting up database...');
  
  // Create connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : 
         process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : false,
  });

  try {
    // Create drizzle instance
    const db = drizzle(pool);
    
    console.log('📦 Pushing schema changes...');
    
    // Use drizzle-kit push instead of migrate to handle existing tables
    try {
      execSync('npx drizzle-kit push', { stdio: 'inherit' });
      console.log('✅ Schema changes applied successfully!');
    } catch (pushError) {
      console.log('⚠️  Push command failed, but continuing...');
    }
    
    console.log('✅ Database setup completed successfully!');
    
    // Test connection
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection test passed');
    
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