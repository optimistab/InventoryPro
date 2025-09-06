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
  insertOrderSchema,
  insertSalesBuySchema,
  insertSalesRentSchema,
  EVENT_TYPES
} from "@shared/schema";
import passport from "passport";
import pool from "../db";
import bcrypt from "bcrypt";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import multer from "multer";
import csv from "csv-parser";
import * as XLSX from "xlsx";
import { Readable } from "stream";

// Configure multer for file uploads
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Sample CSV download route
  app.get("/api/products/sample-csv", (req, res) => {
    const sampleData = [
      {
        name: "MacBook Pro 16-inch",
        sku: "MBP16-001",
        brand: "Apple",
        model: "MacBook Pro",
        category: "laptop",
        condition: "new",
        price: "2499.99",
        cost: "1999.99",
        stockQuantity: "5",
        specifications: "16GB RAM, 512GB SSD, M2 Pro chip",
        description: "Professional laptop for creative work"
      },
      {
        name: "Dell XPS 13",
        sku: "DXPS13-002",
        brand: "Dell",
        model: "XPS 13",
        category: "laptop",
        condition: "refurbished",
        price: "899.99",
        cost: "699.99",
        stockQuantity: "3",
        specifications: "8GB RAM, 256GB SSD, Intel i5",
        description: "Compact ultrabook for business"
      }
    ];

    const csvContent = [
      'name,sku,brand,model,category,condition,price,cost,stockQuantity,specifications,description',
      ...sampleData.map(row =>
        `"${row.name}","${row.sku}","${row.brand}","${row.model}","${row.category}","${row.condition}","${row.price}","${row.cost}","${row.stockQuantity}","${row.specifications}","${row.description}"`
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sample_products.csv"');
    res.send(csvContent);
  });

  // File upload route
  app.post("/api/products/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase();
      const products: any[] = [];

      if (fileExtension === 'csv') {
        // Parse CSV
        const csvData = req.file.buffer.toString('utf-8');
        const stream = Readable.from(csvData);

        await new Promise((resolve, reject) => {
          stream
            .pipe(csv())
            .on('data', (row) => {
              products.push(row);
            })
            .on('end', resolve)
            .on('error', reject);
        });
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Parse Excel
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        products.push(...jsonData);
      } else {
        return res.status(400).json({ message: "Unsupported file format" });
      }

      // Validate and transform data
      const validProducts = [];
      const errors = [];

      for (let i = 0; i < products.length; i++) {
        const row = products[i];
        try {
          // Map CSV/Excel columns to our schema
          const productData = {
            name: row.name || row.Name,
            sku: row.sku || row.SKU,
            brand: row.brand || row.Brand,
            model: row.model || row.Model,
            category: row.category || row.Category || 'laptop',
            condition: row.condition || row.Condition || 'new',
            price: (row.price || row.Price || '0').toString(),
            cost: (row.cost || row.Cost || '0').toString(),
            stockQuantity: parseInt(row.stockQuantity || row.StockQuantity || row.stock_quantity || '0'),
            specifications: row.specifications || row.Specifications || null,
            description: row.description || row.Description || null,
            isActive: true
          };

          // Validate required fields
          if (!productData.name || !productData.sku || !productData.brand) {
            errors.push(`Row ${i + 1}: Missing required fields (name, sku, brand)`);
            continue;
          }

          // Validate and convert data types
          const price = parseFloat(productData.price);
          const cost = parseFloat(productData.cost);
          const stockQuantity = productData.stockQuantity;

          if (isNaN(price) || price < 0) {
            errors.push(`Row ${i + 1}: Invalid price`);
            continue;
          }

          if (isNaN(cost) || cost < 0) {
            errors.push(`Row ${i + 1}: Invalid cost`);
            continue;
          }

          if (isNaN(stockQuantity) || stockQuantity < 0) {
            errors.push(`Row ${i + 1}: Invalid stock quantity`);
            continue;
          }

          // Update the product data with properly typed values
          productData.price = price.toFixed(2);
          productData.cost = cost.toFixed(2);
          productData.stockQuantity = stockQuantity;

          // Validate category and condition
          if (!['laptop', 'desktop'].includes(productData.category)) {
            errors.push(`Row ${i + 1}: Invalid category (must be 'laptop' or 'desktop')`);
            continue;
          }

          if (!['new', 'refurbished', 'used'].includes(productData.condition)) {
            errors.push(`Row ${i + 1}: Invalid condition (must be 'new', 'refurbished', or 'used')`);
            continue;
          }

          validProducts.push(productData);
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
        }
      }

      if (validProducts.length === 0) {
        return res.status(400).json({
          message: "No valid products found",
          errors
        });
      }

      // Create products in database
      const result = await storage.createProducts(validProducts);

      let message = `Successfully processed ${result.products.length} products`;
      if (result.created > 0 && result.updated > 0) {
        message += ` (${result.created} created, ${result.updated} updated)`;
      } else if (result.created > 0) {
        message += ` (${result.created} created)`;
      } else if (result.updated > 0) {
        message += ` (${result.updated} updated)`;
      }

      res.status(201).json({
        message,
        products: result.products,
        summary: {
          total: result.products.length,
          created: result.created,
          updated: result.updated
        },
        errors: errors.length > 0 ? errors : undefined
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        message: "Failed to process file upload",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

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
      // Preprocess the data to ensure correct types
      const rawData = req.body;
      const processedData = {
        ...rawData,
        // Ensure price and cost are valid decimal strings
        price: (() => {
          const price = rawData.price;
          if (typeof price === 'string') return price;
          if (typeof price === 'number') return price.toString();
          return '0';
        })(),
        cost: (() => {
          const cost = rawData.cost;
          if (typeof cost === 'string') return cost;
          if (typeof cost === 'number') return cost.toString();
          return '0';
        })(),
        stockQuantity: (() => {
          if (typeof rawData.stockQuantity === 'number') return rawData.stockQuantity;
          if (typeof rawData.stockQuantity === 'string') {
            const parsed = parseInt(rawData.stockQuantity);
            return isNaN(parsed) ? 0 : parsed;
          }
          return 0;
        })(),
        isActive: rawData.isActive !== undefined ? Boolean(rawData.isActive) : true,
      };

      console.log('Raw data:', rawData);
      console.log('Processed data:', processedData);

      const productData = insertProductSchema.parse(processedData);
      const product = await storage.createProduct(productData);


      // Automatically track product addition date
      await storage.createProductDateEvent({
        adsId: product.adsId,
        eventType: EVENT_TYPES.PRODUCT_ADDED,
        eventDate: new Date().toISOString(),
        notes: `Product ${product.name} added to inventory`,
        createdAt: new Date().toISOString()
      });
      console.log("Product date event created successfully");

      res.status(201).json(product);
    } catch (error) {
      console.error('Validation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      res.status(400).json({
        message: "POST Invalid product data",
        error: errorMessage,
        details: error instanceof Error && 'issues' in error ? error.issues : undefined
      });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      // Preprocess the data to ensure correct types
      const rawData = req.body;
      const processedData = {
        ...rawData,
        price: rawData.price !== undefined ? (() => {
          const price = rawData.price;
          if (typeof price === 'string') return price;
          if (typeof price === 'number') return price.toString();
          return undefined;
        })() : undefined,
        cost: rawData.cost !== undefined ? (() => {
          const cost = rawData.cost;
          if (typeof cost === 'string') return cost;
          if (typeof cost === 'number') return cost.toString();
          return undefined;
        })() : undefined,
        stockQuantity: rawData.stockQuantity !== undefined ? (() => {
          if (typeof rawData.stockQuantity === 'number') return rawData.stockQuantity;
          if (typeof rawData.stockQuantity === 'string') {
            const parsed = parseInt(rawData.stockQuantity);
            return isNaN(parsed) ? undefined : parsed;
          }
          return undefined;
        })() : undefined,
        isActive: rawData.isActive !== undefined ? Boolean(rawData.isActive) : undefined,
      };

      console.log('PUT Raw data:', rawData);
      console.log('PUT Processed data:', processedData);

      const productData = insertProductSchema.partial().parse(processedData);
      const product = await storage.updateProduct(id, productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error('PUT Validation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      res.status(400).json({
        message: "PUT Invalid product data",
        error: errorMessage,
        details: error instanceof Error && 'issues' in error ? error.issues : undefined
      });
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
      const product = await storage.getProductByAdsId(sale.adsId);
      const existingSales = await storage.getSalesByProduct(sale.adsId);
      const isFirstSale = existingSales.length === 1; // Just created this sale

      // Automatically track sale event
      await storage.createProductDateEvent({
        adsId: sale.adsId,
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

  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const orderData = insertOrderSchema.partial().parse(req.body);
      const order = await storage.updateOrder(id, orderData);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteOrder(id);
      if (!deleted) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  // Sales Buy routes
  app.get("/api/sales-buy", async (req, res) => {
    try {
      const salesBuy = await storage.getSalesBuy();
      res.json(salesBuy);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales buy records" });
    }
  });

  app.post("/api/sales-buy", async (req, res) => {
    try {
      const salesBuyData = insertSalesBuySchema.parse(req.body);
      const salesBuy = await storage.createSalesBuy(salesBuyData);
      res.status(201).json(salesBuy);
    } catch (error) {
      res.status(400).json({ message: "Invalid sales buy data" });
    }
  });

  // Sales Rent routes
  app.get("/api/sales-rent", async (req, res) => {
    try {
      const salesRent = await storage.getSalesRent();
      res.json(salesRent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales rent records" });
    }
  });

  app.post("/api/sales-rent", async (req, res) => {
    try {
      const salesRentData = insertSalesRentSchema.parse(req.body);
      const salesRent = await storage.createSalesRent(salesRentData);
      res.status(201).json(salesRent);
    } catch (error) {
      res.status(400).json({ message: "Invalid sales rent data" });
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
      if (item.adsId) {
        await storage.createProductDateEvent({
          adsId: item.adsId,
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

  app.get("/api/product-date-events/product/:adsId", async (req, res) => {
    try {
      const adsId = req.params.adsId;
      const events = await storage.getProductDateEventsByProduct(adsId);
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

  // Setup endpoint for production - simplified due to database reset strategy
  app.post("/api/setup", async (req, res) => {
    try {
      console.log("🚀 Production setup check...");

      // Check if we're in production
      if (process.env.NODE_ENV !== 'production') {
        return res.status(400).json({
          error: "Setup endpoint only available in production",
          message: "This endpoint is designed for production use only"
        });
      }

      // Test database connection
      console.log("📡 Testing database connection...");
      await pool.query('SELECT NOW()');
      console.log("✅ Database connection successful");

      // Check if users exist (database should already be set up by build process)
      const userCheck = await pool.query('SELECT COUNT(*) FROM users');
      const userCount = parseInt(userCheck.rows[0].count);

      if (userCount === 0) {
        return res.status(500).json({
          error: "No users found",
          message: "Database setup may have failed during build. Please check build logs."
        });
      }

      console.log(`📋 Found ${userCount} users in database`);

      // Get user credentials
      const activeUsers = await pool.query(`
        SELECT username, role, employee_id FROM users
        WHERE is_active = true
        ORDER BY username
      `);

      // Generate credentials for all active users
      const credentials: Record<string, string> = {};
      for (const user of activeUsers.rows) {
        credentials[user.username] = `${user.username}123`;
      }

      console.log("🎉 Production setup verified successfully!");

      res.json({
        success: true,
        message: "Production setup verified successfully!",
        users: activeUsers.rows,
        credentials: credentials,
        userTypes: {
          admin: 3,
          developer: 2,
          support: 2,
          salesperson: 6,
          salesmanager: 2,
          InventoryStaff: 2
        }
      });

    } catch (error) {
      console.error("❌ Production setup check failed:", error);
      res.status(500).json({
        error: "Production setup check failed",
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
