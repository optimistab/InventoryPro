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

      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
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
      res.status(400).json({ message: "Invalid product data" });
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

  const httpServer = createServer(app);
  return httpServer;
}
