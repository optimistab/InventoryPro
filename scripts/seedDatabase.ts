import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { products, clients, users } from '../shared/schema';

// Load environment variables
dotenv.config();

async function seedDatabase() {
  console.log('🌱 Seeding database with initial data...');

  // Create connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('render.com')
      ? { rejectUnauthorized: false }
      : false,
  });

  try {
    const db = drizzle(pool);

    console.log('👤 Creating admin user...');
    await db.insert(users).values({
      username: 'admin',
      password: '$2b$10$8K3VzJcQX8zJcQX8zJcQX8zJcQX8zJcQX8zJcQX8zJcQX8zJcQX8', // 'admin123' hashed
      role: 'admin',
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
    console.log('🔐 Admin login: admin / admin123');
    console.log('📊 Sample data created: 1 admin user, 2 clients, 3 products');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Database seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database seeding failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;