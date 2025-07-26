import { 
  Product, InsertProduct, 
  Client, InsertClient, 
  Sale, InsertSale, SaleWithDetails,
  ClientRequirement, InsertClientRequirement,
  RecoveryItem, InsertRecoveryItem,
  ProductDateEvent, InsertProductDateEvent
} from "@shared/schema";
import pool from "./../db";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  getClientByEmail(email: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Sales
  getSales(): Promise<Sale[]>;
  getSalesWithDetails(): Promise<SaleWithDetails[]>;
  getSale(id: number): Promise<Sale | undefined>;
  getSalesByClient(clientId: number): Promise<Sale[]>;
  getSalesByProduct(productId: number): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  updateSale(id: number, sale: Partial<InsertSale>): Promise<Sale | undefined>;
  deleteSale(id: number): Promise<boolean>;

  // Client Requirements
  getClientRequirements(): Promise<ClientRequirement[]>;
  getClientRequirement(id: number): Promise<ClientRequirement | undefined>;
  getClientRequirementsByClient(clientId: number): Promise<ClientRequirement[]>;
  createClientRequirement(requirement: InsertClientRequirement): Promise<ClientRequirement>;
  updateClientRequirement(id: number, requirement: Partial<InsertClientRequirement>): Promise<ClientRequirement | undefined>;
  deleteClientRequirement(id: number): Promise<boolean>;

  // Recovery Items
  getRecoveryItems(): Promise<RecoveryItem[]>;
  getRecoveryItem(id: number): Promise<RecoveryItem | undefined>;
  createRecoveryItem(item: InsertRecoveryItem): Promise<RecoveryItem>;
  updateRecoveryItem(id: number, item: Partial<InsertRecoveryItem>): Promise<RecoveryItem | undefined>;
  deleteRecoveryItem(id: number): Promise<boolean>;

  // Product Date Events
  getProductDateEvents(): Promise<ProductDateEvent[]>;
  getProductDateEventsByProduct(productId: number): Promise<ProductDateEvent[]>;
  getProductDateEvent(id: number): Promise<ProductDateEvent | undefined>;
  createProductDateEvent(event: InsertProductDateEvent): Promise<ProductDateEvent>;
  updateProductDateEvent(id: number, event: Partial<InsertProductDateEvent>): Promise<ProductDateEvent | undefined>;
  deleteProductDateEvent(id: number): Promise<boolean>;

  // Analytics
  getDashboardStats(): Promise<{
    totalInventory: number;
    monthlySales: number;
    activeClients: number;
    recoveryItems: number;
    lowStockItems: number;
    pendingOrders: number;
    salesGrowth: number;
    clientGrowth: number;
  }>;
}

export class PostgresStorage implements IStorage {
  private products: Map<number, Product> = new Map();
  private clients: Map<number, Client> = new Map();
  private sales: Map<number, Sale> = new Map();
  private clientRequirements: Map<number, ClientRequirement> = new Map();
  private recoveryItems: Map<number, RecoveryItem> = new Map();
  private productDateEvents: Map<number, ProductDateEvent> = new Map();
  
  private currentProductId = 1;
  private currentClientId = 1;
  private currentSaleId = 1;
  private currentRequirementId = 1;
  private currentRecoveryId = 1;
  private currentDateEventId = 1;


  // Products
  async getProducts(): Promise<Product[]> {
    console.log("Fetching products from database...");
    const res = await pool.query("SELECT * FROM products WHERE is_active = TRUE");
    console.log("Fetched products from database:", res.rows);
    return res.rows.map(row => ({
      id: row.id,
      brand: row.brand,
      name: row.name,
      sku: row.sku,
      model: row.model,
      category: row.category,
      condition: row.condition,
      price: row.price,
      cost: row.cost,
      stockQuantity: row.stock_quantity,
      specifications: row.specifications,
      description: row.description,
      isActive: row.is_active
    }));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => p.sku === sku);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      ...insertProduct, 
      id,
      description: insertProduct.description ?? null,
      specifications: insertProduct.specifications ?? null,
      stockQuantity: insertProduct.stockQuantity ?? 0,
      isActive: insertProduct.isActive ?? true
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    
    const updated: Product = { ...existing, ...productUpdate };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(c => c.isActive);
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientByEmail(email: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(c => c.email === email);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const client: Client = { 
      ...insertClient, 
      id,
      phone: insertClient.phone ?? null,
      address: insertClient.address ?? null,
      city: insertClient.city ?? null,
      state: insertClient.state ?? null,
      zipCode: insertClient.zipCode ?? null,
      company: insertClient.company ?? null,
      isActive: insertClient.isActive ?? true
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, clientUpdate: Partial<InsertClient>): Promise<Client | undefined> {
    const existing = this.clients.get(id);
    if (!existing) return undefined;
    
    const updated: Client = { ...existing, ...clientUpdate };
    this.clients.set(id, updated);
    return updated;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async getSalesWithDetails(): Promise<SaleWithDetails[]> {
    const sales = Array.from(this.sales.values());
    const salesWithDetails: SaleWithDetails[] = [];
    
    for (const sale of sales) {
      const client = this.clients.get(sale.clientId);
      const product = this.products.get(sale.productId);
      
      if (client && product) {
        salesWithDetails.push({ ...sale, client, product });
      }
    }
    
    return salesWithDetails.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  }

  async getSale(id: number): Promise<Sale | undefined> {
    return this.sales.get(id);
  }

  async getSalesByClient(clientId: number): Promise<Sale[]> {
    return Array.from(this.sales.values()).filter(s => s.clientId === clientId);
  }

  async getSalesByProduct(productId: number): Promise<Sale[]> {
    return Array.from(this.sales.values()).filter(s => s.productId === productId);
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = this.currentSaleId++;
    const sale: Sale = { 
      ...insertSale, 
      id,
      notes: insertSale.notes ?? null,
      status: insertSale.status ?? "completed"
    };
    this.sales.set(id, sale);
    
    // Update product stock
    const product = this.products.get(sale.productId);
    if (product) {
      const updatedProduct = { ...product, stockQuantity: product.stockQuantity - sale.quantity };
      this.products.set(product.id, updatedProduct);
    }
    
    return sale;
  }

  async updateSale(id: number, saleUpdate: Partial<InsertSale>): Promise<Sale | undefined> {
    const existing = this.sales.get(id);
    if (!existing) return undefined;
    
    const updated: Sale = { ...existing, ...saleUpdate };
    this.sales.set(id, updated);
    return updated;
  }

  async deleteSale(id: number): Promise<boolean> {
    return this.sales.delete(id);
  }

  // Client Requirements
  async getClientRequirements(): Promise<ClientRequirement[]> {
    return Array.from(this.clientRequirements.values());
  }

  async getClientRequirement(id: number): Promise<ClientRequirement | undefined> {
    return this.clientRequirements.get(id);
  }

  async getClientRequirementsByClient(clientId: number): Promise<ClientRequirement[]> {
    return Array.from(this.clientRequirements.values()).filter(r => r.clientId === clientId);
  }

  async createClientRequirement(insertRequirement: InsertClientRequirement): Promise<ClientRequirement> {
    const id = this.currentRequirementId++;
    const requirement: ClientRequirement = { 
      ...insertRequirement, 
      id,
      specifications: insertRequirement.specifications ?? null,
      budgetMin: insertRequirement.budgetMin ?? null,
      budgetMax: insertRequirement.budgetMax ?? null,
      timeframe: insertRequirement.timeframe ?? null,
      notes: insertRequirement.notes ?? null,
      status: insertRequirement.status ?? "pending",
      priority: insertRequirement.priority ?? "medium"
    };
    this.clientRequirements.set(id, requirement);
    return requirement;
  }

  async updateClientRequirement(id: number, requirementUpdate: Partial<InsertClientRequirement>): Promise<ClientRequirement | undefined> {
    const existing = this.clientRequirements.get(id);
    if (!existing) return undefined;
    
    const updated: ClientRequirement = { ...existing, ...requirementUpdate };
    this.clientRequirements.set(id, updated);
    return updated;
  }

  async deleteClientRequirement(id: number): Promise<boolean> {
    return this.clientRequirements.delete(id);
  }

  // Recovery Items
  async getRecoveryItems(): Promise<RecoveryItem[]> {
    return Array.from(this.recoveryItems.values());
  }

  async getRecoveryItem(id: number): Promise<RecoveryItem | undefined> {
    return this.recoveryItems.get(id);
  }

  async createRecoveryItem(insertItem: InsertRecoveryItem): Promise<RecoveryItem> {
    const id = this.currentRecoveryId++;
    const item: RecoveryItem = { 
      ...insertItem, 
      id,
      originalProductId: insertItem.originalProductId ?? null,
      clientId: insertItem.clientId ?? null,
      estimatedValue: insertItem.estimatedValue ?? null,
      repairCost: insertItem.repairCost ?? null,
      notes: insertItem.notes ?? null,
      status: insertItem.status ?? "pending"
    };
    this.recoveryItems.set(id, item);
    return item;
  }

  async updateRecoveryItem(id: number, itemUpdate: Partial<InsertRecoveryItem>): Promise<RecoveryItem | undefined> {
    const existing = this.recoveryItems.get(id);
    if (!existing) return undefined;
    
    const updated: RecoveryItem = { ...existing, ...itemUpdate };
    this.recoveryItems.set(id, updated);
    return updated;
  }

  async deleteRecoveryItem(id: number): Promise<boolean> {
    return this.recoveryItems.delete(id);
  }

  // Product Date Events
  async getProductDateEvents(): Promise<ProductDateEvent[]> {
    return Array.from(this.productDateEvents.values());
  }

  async getProductDateEventsByProduct(productId: number): Promise<ProductDateEvent[]> {
    return Array.from(this.productDateEvents.values()).filter(e => e.productId === productId);
  }

  async getProductDateEvent(id: number): Promise<ProductDateEvent | undefined> {
    return this.productDateEvents.get(id);
  }

  async createProductDateEvent(insertEvent: InsertProductDateEvent): Promise<ProductDateEvent> {
    const id = this.currentDateEventId++;
    const now = new Date().toISOString();
    const event: ProductDateEvent = { 
      ...insertEvent, 
      id,
      clientId: insertEvent.clientId ?? null,
      notes: insertEvent.notes ?? null,
      createdAt: now
    };
    this.productDateEvents.set(id, event);
    return event;
  }

  async updateProductDateEvent(id: number, eventUpdate: Partial<InsertProductDateEvent>): Promise<ProductDateEvent | undefined> {
    const existing = this.productDateEvents.get(id);
    if (!existing) return undefined;
    
    const updated: ProductDateEvent = { ...existing, ...eventUpdate };
    this.productDateEvents.set(id, updated);
    return updated;
  }

  async deleteProductDateEvent(id: number): Promise<boolean> {
    return this.productDateEvents.delete(id);
  }

  // Analytics
  async getDashboardStats() {
    const products = Array.from(this.products.values()).filter(p => p.isActive);
    const sales = Array.from(this.sales.values());
    const clients = Array.from(this.clients.values()).filter(c => c.isActive);
    const recovery = Array.from(this.recoveryItems.values());

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlySales = sales
      .filter(s => {
        const saleDate = new Date(s.saleDate);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      })
      .reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);

    const lowStockItems = products.filter(p => p.stockQuantity < 10).length;
    const pendingOrders = sales.filter(s => s.status === "pending").length;
    
    // Simple growth calculation (mock data for now)
    const salesGrowth = 8.5;
    const clientGrowth = -2;

    return {
      totalInventory: products.reduce((sum, p) => sum + p.stockQuantity, 0),
      monthlySales,
      activeClients: clients.length,
      recoveryItems: recovery.length,
      lowStockItems,
      pendingOrders,
      salesGrowth,
      clientGrowth,
    };
  }
}

export const storage = new PostgresStorage();
