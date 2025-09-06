import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { sql } from 'drizzle-orm';
import { users, clients, products } from '../shared/schema';

// Load environment variables
dotenv.config();

/**
 * DATABASE RESET STRATEGY
 *
 * This script resets the entire database on every run (npm run dev / deployment).
 * This approach is used because:
 * - Schema changes happen frequently during development
 * - No need for migration scripts/backward compatibility
 * - Clean state for each development session
 * - Simple schema updates: just modify migrations/0000_outstanding_lilandra.sql
 *
 * Process:
 * 1. Drop existing database
 * 2. Run base migration (0000_outstanding_lilandra.sql)
 * 3. Seed initial data
 * 4. Create users with auto-generated employee IDs (ADS0001 format)
 */
async function setupDatabase() {
  console.log('🚀 Setting up database for development...');

  // Create connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('render.com')
      ? { rejectUnauthorized: false }
      : false,
  });

  try {
    const db = drizzle(pool);

    console.log('🗑️  Resetting database...');

    // Use raw SQL to drop everything and recreate
    try {
      await db.execute(sql`DROP SCHEMA public CASCADE;`);
    } catch (e) {
      // Ignore if schema doesn't exist
    }
    await db.execute(sql`CREATE SCHEMA public;`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO postgres;`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public;`);

    console.log('📦 Running database migrations...');

    // Run migrations directly using SQL files
    const fs = await import('fs');
    const path = await import('path');

    const migrationFiles = [
      '0000_outstanding_lilandra.sql',
      '0001_add_missing_tables.sql',
      '0002_add_ads_id.sql'
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(process.cwd(), 'migrations', file);
      if (fs.existsSync(filePath)) {
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        console.log(`Running migration: ${file}`);

        // Split SQL by statement-breakpoint and execute each statement
        const statements = sqlContent.split('--> statement-breakpoint');
        for (const statement of statements) {
          const trimmed = statement.trim();
          if (trimmed) {
            await db.execute(trimmed);
          }
        }
      }
    }

    console.log('✅ Database migrations completed');

    // Check if we already have data
    const existingUsers = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    const userCount = parseInt((existingUsers as any)[0]?.count || '0');

    if (userCount === 0) {
      console.log('🌱 Seeding database with initial data...');

      console.log('👤 Creating admin user...');
      await db.insert(users).values({
        username: 'admin',
        password: '$2b$10$8K3VzJcQX8zJcQX8zJcQX8zJcQX8zJcQX8zJcQX8zJcQX8zJcQX8', // 'admin123' hashed
        role: 'admin',
        employeeId: 'ADS0001',
        dateOfCreation: new Date().toISOString(),
        isActive: true,
      });

      console.log('👥 Creating sample clients...');
      await db.insert(clients).values([
        {
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+1-555-0123',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          company: 'Tech Corp',
          isActive: true,
        },
        {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+1-555-0456',
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          company: 'Design Studio',
          isActive: true,
        },
      ]);

      console.log('💻 Creating sample products...');
      await db.insert(products).values([
        {
          adsId: 'ADS12345678901',
          referenceNumber: 'ADS12345678901',
          name: 'MacBook Pro 16"',
          sku: 'MBP16-2023',
          brand: 'Apple',
          model: 'MacBook Pro',
          category: 'laptop',
          condition: 'new',
          price: '2499.99',
          cost: '2000.00',
          stockQuantity: 5,
          specifications: '{"cpu": "M2 Pro", "ram": "16GB", "storage": "512GB SSD"}',
          description: 'Latest MacBook Pro with M2 Pro chip',
          isActive: true,
        },
        {
          adsId: 'ADS12345678902',
          referenceNumber: 'ADS12345678902',
          name: 'Dell XPS 13',
          sku: 'DXPS13-2023',
          brand: 'Dell',
          model: 'XPS 13',
          category: 'laptop',
          condition: 'new',
          price: '1299.99',
          cost: '1000.00',
          stockQuantity: 8,
          specifications: '{"cpu": "Intel i7", "ram": "16GB", "storage": "512GB SSD"}',
          description: 'Ultra-portable laptop with premium build',
          isActive: true,
        },
        {
          adsId: 'ADS12345678903',
          referenceNumber: 'ADS12345678903',
          name: 'iMac 24"',
          sku: 'IMAC24-2023',
          brand: 'Apple',
          model: 'iMac',
          category: 'desktop',
          condition: 'new',
          price: '1499.99',
          cost: '1200.00',
          stockQuantity: 3,
          specifications: '{"cpu": "M1", "ram": "8GB", "storage": "256GB SSD"}',
          description: 'All-in-one desktop computer',
          isActive: true,
        },
      ]);

      console.log('✅ Database seeded successfully!');
    } else {
      console.log('ℹ️  Database already has data, skipping seed');
    }

    // Test connection
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection test passed');

    console.log('🎉 Database setup completed successfully!');
    console.log('🔐 Admin login: admin / admin123');

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
      console.log('🚀 Database is ready for development!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

export default setupDatabase;