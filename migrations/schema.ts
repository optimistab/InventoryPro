import { pgTable, serial, integer, text, numeric, unique, boolean, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const clientRequirements = pgTable("client_requirements", {
	id: serial().primaryKey().notNull(),
	clientId: integer("client_id").notNull(),
	productCategory: text("product_category").notNull(),
	specifications: text(),
	budgetMin: numeric("budget_min", { precision: 10, scale:  2 }),
	budgetMax: numeric("budget_max", { precision: 10, scale:  2 }),
	timeframe: text(),
	priority: text().default('medium').notNull(),
	status: text().default('active').notNull(),
	notes: text(),
	createdDate: text("created_date").notNull(),
});

export const clients = pgTable("clients", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phone: text(),
	address: text(),
	city: text(),
	state: text(),
	zipCode: text("zip_code"),
	company: text(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	unique("clients_email_unique").on(table.email),
]);

export const productDateEvents = pgTable("product_date_events", {
	id: serial().primaryKey().notNull(),
	productId: integer("product_id").notNull(),
	clientId: integer("client_id"),
	eventType: text("event_type").notNull(),
	eventDate: text("event_date").notNull(),
	notes: text(),
	createdAt: text("created_at").notNull(),
});

export const products = pgTable("products", {
  id: serial(), // Keep for backward compatibility
  adsId: text("ads_id").primaryKey().notNull(),
  referenceNumber: text("reference_number").notNull(),
  name: text().notNull(),
  sku: text().notNull(),
  brand: text().notNull(),
  model: text().notNull(),
  category: text().notNull(),
  condition: text().notNull(),
  price: numeric({ precision: 10, scale:  2 }).notNull(),
  cost: numeric({ precision: 10, scale:  2 }).notNull(),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  specifications: text(),
  description: text(),
  isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
  unique("products_sku_unique").on(table.sku),
  unique("products_reference_number_unique").on(table.referenceNumber),
]);

export const recoveryItems = pgTable("recovery_items", {
	id: serial().primaryKey().notNull(),
	originalProductId: integer("original_product_id"),
	clientId: integer("client_id"),
	brand: text().notNull(),
	model: text().notNull(),
	condition: text().notNull(),
	recoveryDate: text("recovery_date").notNull(),
	estimatedValue: numeric("estimated_value", { precision: 10, scale:  2 }),
	repairCost: numeric("repair_cost", { precision: 10, scale:  2 }),
	status: text().default('received').notNull(),
	notes: text(),
});

export const sales = pgTable("sales", {
	id: serial().primaryKey().notNull(),
	clientId: integer("client_id").notNull(),
	productId: integer("product_id").notNull(),
	quantity: integer().notNull(),
	unitPrice: numeric("unit_price", { precision: 10, scale:  2 }).notNull(),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	saleDate: text("sale_date").notNull(),
	status: text().default('completed').notNull(),
	notes: text(),
});

export const session = pgTable("session", {
	sid: text().primaryKey().notNull(),
	sess: text().notNull(),
	expire: timestamp({ mode: 'string' }).notNull(),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	role: text().notNull(),
	dateOfCreation: text("date_of_creation").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);
