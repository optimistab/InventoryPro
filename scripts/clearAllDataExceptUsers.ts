import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function clearAllDataExceptUsers() {
  console.log('🧹 Starting data cleanup - keeping only users...');

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

    console.log('🗑️  Deleting all data from tables (except users)...');

    // Delete data in reverse dependency order (except users)
    const deleteQueries = [
      'DELETE FROM product_date_events',
      'DELETE FROM sales',
      'DELETE FROM recovery_items',
      'DELETE FROM client_requirements',
      'DELETE FROM products',
      'DELETE FROM clients',
      'DELETE FROM session'
    ];

    for (const query of deleteQueries) {
      try {
        const result = await pool.query(query);
        const tableName = query.match(/FROM (\w+)/)?.[1] || 'unknown';
        console.log(`✅ Cleared ${result.rowCount} records from ${tableName}`);
      } catch (error) {
        console.log(`⚠️  Could not clear table: ${query} - ${error}`);
      }
    }

    // Check how many users remain
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Users table: ${userCount.rows[0].count} records preserved`);

    console.log('🎉 Data cleanup completed successfully!');
    console.log('📝 Only the users table has been preserved with all other data cleared.');

  } catch (error) {
    console.error('❌ Data cleanup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  clearAllDataExceptUsers()
    .then(() => {
      console.log('🎉 Data cleanup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Data cleanup failed:', error);
      process.exit(1);
    });
}

export default clearAllDataExceptUsers;