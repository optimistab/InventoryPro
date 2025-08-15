import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables at the very beginning

dotenv.config();

// we are at the cafe Haven

// i have a nice diary.



// Fallback database configurations
const getDatabaseConfig = () => {
  // Primary: Use DATABASE_URL from environment variables
  console.log('process.env.DATABASE_URL --', process.env.DATABASE_URL);
  if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL --', process.env.DATABASE_URL);
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : 
           process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : false,
    };
  }

  // Fallback 1: Local PostgreSQL with default settings
  const localConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'inventoryprodb',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: false,
  };

  // Fallback 2: SQLite for development (if PostgreSQL is not available)
  if (process.env.NODE_ENV === 'development' && !process.env.FORCE_POSTGRES) {
    console.warn('⚠️  DATABASE_URL not found, using local PostgreSQL fallback');
    return localConfig;
  }

  // Fallback 3: Hardcoded local connection for development
  console.warn('⚠️  Using hardcoded local database connection');
  return {
    host: 'localhost',
    port: 5432,
    database: 'inventoryprodb',
    user: 'postgres',
    password: '',
    ssl: false,
  };
};

// Create pool with fallback configuration
const pool = new Pool(getDatabaseConfig());

// Test the connection and provide helpful error messages
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err: any) => {
  console.error('❌ Database connection error:', err.message);
  
  if (err.code === 'ECONNREFUSED') {
    console.error('💡 Make sure PostgreSQL is running: brew services start postgresql@14');
  } else if (err.code === '3D000') {
    console.error('💡 Database does not exist. Create it with: createdb inventoryprodb');
  } else if (err.code === '28P01') {
    console.error('💡 Authentication failed. Check your database credentials.');
  }
  
  console.error('🔧 Fallback options:');
  console.error('   1. Set DATABASE_URL environment variable');
  console.error('   2. Create .env file with database configuration');
  console.error('   3. Ensure PostgreSQL is running and accessible');
});

export default pool;

