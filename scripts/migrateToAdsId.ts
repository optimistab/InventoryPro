import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Load environment variables
dotenv.config();

async function migrateToAdsId() {
  console.log('🚀 Starting migration to adsId system...');

  // Create connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('render.com')
      ? { rejectUnauthorized: false }
      : false,
  });

  try {
    console.log('📡 Testing database connection...');
    await pool.query('SELECT 1 as test');
    console.log('✅ Database connection successful');

    console.log('⚠️  WARNING: This will delete all existing data!');
    console.log('🔄 Creating backup of current schema...');

    // Create drizzle instance
    const db = drizzle(pool);

    console.log('🗑️  Deleting all existing data...');

    // Delete data in reverse dependency order
    await pool.query('DELETE FROM product_date_events');
    await pool.query('DELETE FROM sales');
    await pool.query('DELETE FROM recovery_items');
    await pool.query('DELETE FROM client_requirements');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM clients');
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM session');

    console.log('✅ All data deleted successfully');

    console.log('🔄 Applying new schema with adsId system...');

    // Apply the new schema
    try {
      execSync('npx drizzle-kit push', { stdio: 'inherit' });
      console.log('✅ New schema applied successfully!');
    } catch (pushError) {
      console.error('❌ Failed to apply schema:', pushError);
      throw pushError;
    }

    console.log('🎉 Migration to adsId system completed successfully!');
    console.log('📝 New products will now have:');
    console.log('   - adsId: 11-digit numeric primary key');
    console.log('   - referenceNumber: ADS + adsId (e.g., ADS12345678901)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToAdsId()
    .then(() => {
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

export default migrateToAdsId;