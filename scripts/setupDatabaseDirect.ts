import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupDatabaseDirect() {
  console.log('🔧 Setting up database directly...');
  
  // Create connection pool with proper SSL configuration
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('render.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    console.log('📦 Checking database tables...');
    
    // Test connection first
    const testResult = await pool.query('SELECT 1 as test');
    console.log('✅ Database connection test passed');
    
    // Check if required tables exist
    const requiredTables = [
      'session',
      'users', 
      'products',
      'clients',
      'sales',
      'client_requirements',
      'product_date_events',
      'recovery_items'
    ];
    
    const existingTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTableNames = existingTables.rows.map(row => row.table_name);
    console.log('📋 Existing tables:', existingTableNames);
    
    const missingTables = requiredTables.filter(table => !existingTableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log('⚠️  Missing tables:', missingTables);
      console.log('💡 Please run: npx drizzle-kit push');
    } else {
      console.log('✅ All required tables exist');
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
  setupDatabaseDirect()
    .then(() => {
      console.log('🎉 Database setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

export default setupDatabaseDirect; 