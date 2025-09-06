CREATE TABLE "client_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"product_category" text NOT NULL,
	"specifications" text,
	"budget_min" numeric(10, 2),
	"budget_max" numeric(10, 2),
	"timeframe" text,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_date" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"company" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"cx_type" text,
	"gst" text,
	"id_proof" text,
	"website" text,
	"address_proof" text,
	"repeat_cx" text,
	CONSTRAINT "clients_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "product_date_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"ads_id" text NOT NULL,
	"client_id" integer,
	"event_type" text NOT NULL,
	"event_date" text NOT NULL,
	"notes" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"ads_id" text,
	"reference_number" text,
	"name" text NOT NULL,
	"sku" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"category" text NOT NULL,
	"condition" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"cost" numeric(10, 2) NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"specifications" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"prod_id" text,
	"prod_health" text,
	"prod_status" text,
	"last_audit_date" text,
	"audit_status" text,
	"return_date" text,
	"maintenance_date" text,
	"maintenance_status" text,
	"order_status" text,
	"created_by" text,
	CONSTRAINT "products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "products_ads_id_unique" UNIQUE("ads_id"),
	CONSTRAINT "products_reference_number_unique" UNIQUE("reference_number")
);
--> statement-breakpoint
CREATE TABLE "recovery_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"ads_id" text,
	"client_id" integer,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"condition" text NOT NULL,
	"recovery_date" text NOT NULL,
	"estimated_value" numeric(10, 2),
	"repair_cost" numeric(10, 2),
	"status" text DEFAULT 'received' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"ads_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"sale_date" text NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sid" text PRIMARY KEY NOT NULL,
	"sess" text NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
-- Users table with employee ID system
-- Employee IDs are auto-generated in ADS0001 format during user creation
-- See scripts/createUsers.ts for employee ID generation logic
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text NOT NULL,
	"employee_id" text,
	"date_of_creation" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_employee_id_unique" UNIQUE("employee_id")
);
