import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session table for connect-pg-simple
export const sessions = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Products table - laptops and computers
export const products = pgTable("products", {
  id: serial("id"), // Keep for backward compatibility, but adsId is now primary
  adsId: text("ads_id").primaryKey(), // 11-digit numeric string, e.g., "12345678901"
  referenceNumber: text("reference_number").notNull().unique(), // "ADS" + adsId, e.g., "ADS12345678901"
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  category: text("category").notNull(), // "laptop" or "desktop"
  condition: text("condition").notNull(), // "new", "refurbished", "used"
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  specifications: text("specifications"), // JSON string of specs
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
});

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  company: text("company"),
  isActive: boolean("is_active").notNull().default(true),
});

// Sales table
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  saleDate: text("sale_date").notNull(), // ISO date string
  status: text("status").notNull().default("completed"), // "pending", "completed", "cancelled"
  notes: text("notes"),
});

// Client requirements tracking
export const clientRequirements = pgTable("client_requirements", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  productCategory: text("product_category").notNull(),
  specifications: text("specifications"), // JSON string
  budgetMin: decimal("budget_min", { precision: 10, scale: 2 }),
  budgetMax: decimal("budget_max", { precision: 10, scale: 2 }),
  timeframe: text("timeframe"),
  priority: text("priority").notNull().default("medium"), // "low", "medium", "high"
  status: text("status").notNull().default("active"), // "active", "fulfilled", "cancelled"
  notes: text("notes"),
  createdDate: text("created_date").notNull(),
});

// Product lifecycle date tracking
export const productDateEvents = pgTable("product_date_events", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  clientId: integer("client_id"), // optional, for customer-related events
  eventType: text("event_type").notNull(), // see EVENT_TYPES constant below
  eventDate: text("event_date").notNull(), // ISO date string
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

// Event types for product lifecycle tracking
export const EVENT_TYPES = {
  PRODUCT_ADDED: "product_added",
  FIRST_SALE: "first_sale_to_customer", 
  RETURNED_FROM_CUSTOMER: "returned_from_customer",
  REPAIR_STARTED: "repair_started",
  REPAIR_COMPLETED: "repair_completed",
  RESALE_TO_CUSTOMER: "resale_to_customer",
  RECOVERY_RECEIVED: "recovery_received",
  QUALITY_CHECK: "quality_check",
  PRICE_UPDATED: "price_updated",
  STOCK_UPDATED: "stock_updated",
  CUSTOMER_COMPLAINT: "customer_complaint",
  WARRANTY_CLAIM: "warranty_claim",
  DISPOSED: "disposed"
} as const;

// Recovery information for refurbished items
export const recoveryItems = pgTable("recovery_items", {
  id: serial("id").primaryKey(),
  originalProductId: integer("original_product_id"),
  clientId: integer("client_id"),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  condition: text("condition").notNull(), // "working", "repairable", "parts-only"
  recoveryDate: text("recovery_date").notNull(),
  estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
  repairCost: decimal("repair_cost", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("received"), // "received", "repairing", "ready", "sold"
  notes: text("notes"),
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // e.g., "admin", "manager", "staff"
  dateOfCreation: text("date_of_creation").notNull(), // ISO date string
  isActive: boolean("is_active").notNull().default(true), // Only active users can login
});

// Insert schemas
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  adsId: true,
  referenceNumber: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
});

export const insertClientRequirementSchema = createInsertSchema(clientRequirements).omit({
  id: true,
});

export const insertRecoveryItemSchema = createInsertSchema(recoveryItems).omit({
  id: true,
});

export const insertProductDateEventSchema = createInsertSchema(productDateEvents).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type ClientRequirement = typeof clientRequirements.$inferSelect;
export type InsertClientRequirement = z.infer<typeof insertClientRequirementSchema>;

export type RecoveryItem = typeof recoveryItems.$inferSelect;
export type InsertRecoveryItem = z.infer<typeof insertRecoveryItemSchema>;

export type ProductDateEvent = typeof productDateEvents.$inferSelect;
export type InsertProductDateEvent = z.infer<typeof insertProductDateEventSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Extended types for joins
export type SaleWithDetails = Sale & {
  client: Client;
  product: Product;
};
