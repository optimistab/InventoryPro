import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductSchema, 
  insertClientSchema, 
  insertSaleSchema,
  insertClientRequirementSchema,
  insertRecoveryItemSchema,
  insertProductDateEventSchema,
  EVENT_TYPES
} from "@shared/schema";
import passport from "passport";
import pool from "../db";
import bcrypt from "bcrypt";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);

      
      // Automatically track product addition date
      await storage.createProductDateEvent({
        productId: product.id,
        eventType: EVENT_TYPES.PRODUCT_ADDED,
        eventDate: new Date().toISOString(),
        notes: `Product ${product.name} added to inventory`,
        createdAt: new Date().toISOString()
      });
      console.log("Product date event created successfully");

      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "POST Invalid product data" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: " PUT Invalid product data" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Clients routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ message: "Invalid client data" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, clientData);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(400).json({ message: "Invalid client data" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteClient(id);
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Sales routes
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSalesWithDetails();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sale" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const saleData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(saleData);
      
      // Get product to check if this is first sale or resale
      const product = await storage.getProduct(sale.productId);
      const existingSales = await storage.getSalesByProduct(sale.productId);
      const isFirstSale = existingSales.length === 1; // Just created this sale
      
      // Automatically track sale event
      await storage.createProductDateEvent({
        productId: sale.productId,
        clientId: sale.clientId,
        eventType: isFirstSale ? EVENT_TYPES.FIRST_SALE : EVENT_TYPES.RESALE_TO_CUSTOMER,
        eventDate: sale.saleDate,
        notes: `Product sold to customer${product ? ` - ${product.name}` : ''}`,
        createdAt: new Date().toISOString()
      });
      
      res.status(201).json(sale);
    } catch (error) {
      res.status(400).json({ message: "Invalid sale data" });
    }
  });

  app.put("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const saleData = insertSaleSchema.partial().parse(req.body);
      const sale = await storage.updateSale(id, saleData);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      res.status(400).json({ message: "Invalid sale data" });
    }
  });

  app.delete("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSale(id);
      if (!deleted) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sale" });
    }
  });

  // Client Requirements routes
  app.get("/api/client-requirements", async (req, res) => {
    try {
      const requirements = await storage.getClientRequirements();
      res.json(requirements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client requirements" });
    }
  });

  app.post("/api/client-requirements", async (req, res) => {
    try {
      const requirementData = insertClientRequirementSchema.parse(req.body);
      const requirement = await storage.createClientRequirement(requirementData);
      res.status(201).json(requirement);
    } catch (error) {
      res.status(400).json({ message: "Invalid requirement data" });
    }
  });

  // Recovery Items routes
  app.get("/api/recovery-items", async (req, res) => {
    try {
      const items = await storage.getRecoveryItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recovery items" });
    }
  });

  app.post("/api/recovery-items", async (req, res) => {
    try {
      const itemData = insertRecoveryItemSchema.parse(req.body);
      const item = await storage.createRecoveryItem(itemData);
      
      // Automatically track recovery event
      if (item.originalProductId) {
        await storage.createProductDateEvent({
          productId: item.originalProductId,
          clientId: item.clientId || undefined,
          eventType: EVENT_TYPES.RECOVERY_RECEIVED,
          eventDate: item.recoveryDate,
          notes: `Product received for recovery - ${item.brand} ${item.model}`,
          createdAt: new Date().toISOString()
        });
      }
      
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid recovery item data" });
    }
  });

  // Product Date Events routes
  app.get("/api/product-date-events", async (req, res) => {
    try {
      const events = await storage.getProductDateEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch date events" });
    }
  });

  app.get("/api/product-date-events/product/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const events = await storage.getProductDateEventsByProduct(productId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product date events" });
    }
  });

  app.post("/api/product-date-events", async (req, res) => {
    try {
      const eventData = insertProductDateEventSchema.parse(req.body);
      const event = await storage.createProductDateEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid date event data" });
    }
  });

  app.put("/api/product-date-events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const eventData = insertProductDateEventSchema.partial().parse(req.body);
      const event = await storage.updateProductDateEvent(id, eventData);
      if (!event) {
        return res.status(404).json({ message: "Date event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid date event data" });
    }
  });

  app.delete("/api/product-date-events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProductDateEvent(id);
      if (!deleted) {
        return res.status(404).json({ message: "Date event not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete date event" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Auth routes
  // Login
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json({ message: "Logged in", user: req.user });
  });

  // Logout
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      res.json({ message: "Logged out" });
    });
  });

  // Check auth
  app.get("/api/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // Setup endpoint for production database initialization
  app.post("/api/setup", async (req, res) => {
    try {
      console.log("🚀 Production setup initiated via API...");

      // Check if we're in production
      if (process.env.NODE_ENV !== 'production') {
        return res.status(400).json({ 
          error: "Setup endpoint only available in production",
          message: "This endpoint is designed for production use only"
        });
      }

      // Check database connection
      console.log("📡 Testing database connection...");
      await pool.query('SELECT NOW()');
      console.log("✅ Database connection successful");

      // Check if users table exists - use a safer approach
      console.log("🔍 Checking database schema...");
      let tableExists = false;
      try {
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
          );
        `);
        tableExists = tableCheck.rows[0].exists;
      } catch (error) {
        console.log("⚠️  Could not check if users table exists, assuming it doesn't");
        tableExists = false;
      }

      if (!tableExists) {
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
            return res.status(500).json({ 
              error: "Failed to create database schema",
              message: "Please ensure your DATABASE_URL is correct and the database is accessible"
            });
          }
        }
      } else {
        console.log("✅ Database schema exists");
      }

      // Always try to ensure schema is up to date
      console.log("🔄 Ensuring schema is up to date...");
      try {
        const { execSync } = await import('child_process');
        execSync('npm run db:push', { stdio: 'inherit' });
        console.log("✅ Schema is up to date");
      } catch (error) {
        console.log("⚠️  Schema push failed, continuing with existing schema");
      }

      // Check if users table has the is_active column
      let hasIsActiveColumn = false;
      try {
        const columnCheck = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'is_active'
        `);
        hasIsActiveColumn = columnCheck.rows.length > 0;
      } catch (error) {
        console.log("⚠️  Could not check column structure, assuming schema needs update");
        hasIsActiveColumn = false;
      }

      if (!hasIsActiveColumn) {
        console.log("❌ Users table missing 'is_active' column or table doesn't exist");
        console.log("🔄 Updating schema...");
        try {
          const { execSync } = await import('child_process');
          execSync('npm run db:push', { stdio: 'inherit' });
          console.log("✅ Schema updated successfully");
        } catch (error) {
          console.error("❌ Failed to update schema");
          return res.status(500).json({ error: "Failed to update schema" });
        }
      }

      console.log("✅ Database schema is up to date");

      // Check if users already exist
      let userCount = 0;
      try {
        const existingUsers = await pool.query('SELECT COUNT(*) FROM users');
        userCount = parseInt(existingUsers.rows[0].count);
      } catch (error) {
        console.log("⚠️  Could not check existing users, assuming none exist");
        userCount = 0;
      }

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

      res.json({
        success: true,
        message: "Production setup completed successfully!",
        users: activeUsers.rows,
        credentials: {
          admin: "admin123",
          manager: "manager123", 
          staff: "staff123"
        }
      });

    } catch (error) {
      console.error("❌ Production setup failed:", error);
      res.status(500).json({ 
        error: "Production setup failed", 
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Simple schema creation endpoint
  app.post("/api/init-db", async (req, res) => {
    try {
      console.log("🚀 Database initialization initiated...");

      // Check if we're in production
      if (process.env.NODE_ENV !== 'production') {
        return res.status(400).json({ 
          error: "Init endpoint only available in production",
          message: "This endpoint is designed for production use only"
        });
      }

      console.log("📡 Testing database connection...");
      await pool.query('SELECT NOW()');
      console.log("✅ Database connection successful");

      console.log("🔄 Creating database schema...");
      const { execSync } = await import('child_process');
      
      try {
        execSync('npm run db:push', { stdio: 'inherit' });
        console.log("✅ Database schema created successfully");
        
        res.json({
          success: true,
          message: "Database schema created successfully!",
          nextStep: "Call /api/setup to create users"
        });
      } catch (error) {
        console.error("❌ Failed to create database schema");
        res.status(500).json({ 
          error: "Failed to create database schema",
          message: "Please ensure your DATABASE_URL is correct and the database is accessible"
        });
      }

    } catch (error) {
      console.error("❌ Database initialization failed:", error);
      res.status(500).json({ 
        error: "Database initialization failed", 
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
