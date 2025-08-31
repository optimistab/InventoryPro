import { relations } from "drizzle-orm/relations";
import { clientRequirements, clients, productDateEvents, products, recoveryItems, sales, session, users } from "./schema";

export const clientsRelations = relations(clients, ({ many }) => ({
	clientRequirements: many(clientRequirements),
	productDateEvents: many(productDateEvents),
	recoveryItems: many(recoveryItems),
	sales: many(sales),
}));

export const productsRelations = relations(products, ({ many }) => ({
	clientRequirements: many(clientRequirements),
	productDateEvents: many(productDateEvents),
	recoveryItems: many(recoveryItems),
	sales: many(sales),
}));

export const usersRelations = relations(users, ({ many }) => ({
	session: many(session),
}));

export const clientRequirementsRelations = relations(clientRequirements, ({ one }) => ({
	client: one(clients, {
		fields: [clientRequirements.clientId],
		references: [clients.id],
	}),
}));

export const productDateEventsRelations = relations(productDateEvents, ({ one }) => ({
	client: one(clients, {
		fields: [productDateEvents.clientId],
		references: [clients.id],
	}),
	product: one(products, {
		fields: [productDateEvents.adsId],
		references: [products.adsId],
	}),
}));

export const recoveryItemsRelations = relations(recoveryItems, ({ one }) => ({
	client: one(clients, {
		fields: [recoveryItems.clientId],
		references: [clients.id],
	}),
	product: one(products, {
		fields: [recoveryItems.adsId],
		references: [products.adsId],
	}),
}));

export const salesRelations = relations(sales, ({ one }) => ({
	client: one(clients, {
		fields: [sales.clientId],
		references: [clients.id],
	}),
	product: one(products, {
		fields: [sales.adsId],
		references: [products.adsId],
	}),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(users, {
		fields: [session.sid],
		references: [users.username],
	}),
}));

