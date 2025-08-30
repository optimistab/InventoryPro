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
  getProductByAdsId(adsId: string): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  createProducts(products: InsertProduct[]): Promise<{ products: Product[], created: number, updated: number }>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  updateProductByAdsId(adsId: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  deleteProductByAdsId(adsId: string): Promise<boolean>;

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

  private clients = new Map<number, Client>();
  private products = new Map<number, Product>();
  private sales = new Map<number, Sale>();
  private clientRequirements = new Map<number, ClientRequirement>();
  private recoveryItems = new Map<number, RecoveryItem>();
  private productDateEvents = new Map<number, ProductDateEvent>();

  private currentClientId = 1;
  private currentProductId = 1;
  private currentSaleId = 1;
  private currentRequirementId = 1;
  private currentRecoveryId = 1;
  private currentDateEventId = 1;

  // Products
  async getProducts(): Promise<Product[]> {

    const res = await pool.query("SELECT * FROM products WHERE is_active = TRUE");

    return res.rows.map(row => ({
      id: row.id, //
      adsId: row.ads_id, //
      referenceNumber: row.reference_number, //
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
      isActive: row.is_active //
    }));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const res = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      adsId: row.ads_id,
      referenceNumber: row.reference_number,
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
    };
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const res = await pool.query("SELECT * FROM products WHERE sku = $1", [sku]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      adsId: row.ads_id,
      referenceNumber: row.reference_number,
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
    };
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Generate 11-digit adsId
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // 4 random digits
    const adsId = (timestamp + random).padStart(11, '0'); // Ensure exactly 11 digits
    const referenceNumber = `ADS${adsId}`;

    const res = await pool.query(
      `INSERT INTO products
        (ads_id, reference_number, brand, name, sku, model, category, condition, price, cost, stock_quantity, specifications, description, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        adsId,
        referenceNumber,
        product.brand,
        product.name,
        product.sku,
        product.model,
        product.category,
        product.condition,
        (product.price),
        (product.cost),
        product.stockQuantity ?? 0,
        product.specifications ?? null,
        product.description ?? null,
        product.isActive ?? true
      ]
    );

    const row = res.rows[0];
    return {
      id: row.id,
      adsId: row.ads_id,
      referenceNumber: row.reference_number,
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
    };
  }

  async createProducts(products: InsertProduct[]): Promise<{ products: Product[], created: number, updated: number }> {
    if (products.length === 0) return { products: [], created: 0, updated: 0 };

    const processedProducts: Product[] = [];
    let createdCount = 0;
    let updatedCount = 0;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const product of products) {
        // Check if product with this SKU already exists
        const existingProduct = await client.query(
          'SELECT * FROM products WHERE sku = $1',
          [product.sku]
        );

        if (existingProduct.rows.length > 0) {
          // Update existing product
          const existing = existingProduct.rows[0];
          const res = await client.query(
            `UPDATE products SET
              brand = $1, name = $2, model = $3, category = $4, condition = $5,
              price = $6, cost = $7, stock_quantity = $8, specifications = $9,
              description = $10, is_active = $11
             WHERE sku = $12
             RETURNING *`,
            [
              product.brand,
              product.name,
              product.model,
              product.category,
              product.condition,
              (product.price),
              (product.cost),
              product.stockQuantity ?? 0,
              product.specifications ?? null,
              product.description ?? null,
              product.isActive ?? true,
              product.sku
            ]
          );

          const row = res.rows[0];
          const updatedProduct: Product = {
            id: row.id,
            adsId: row.ads_id,
            referenceNumber: row.reference_number,
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
          };

          processedProducts.push(updatedProduct);
          updatedCount++;

          // Create product date event for updated product
          await client.query(
            `INSERT INTO product_date_events
              (product_id, event_type, event_date, notes, created_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              updatedProduct.id,
              'product_updated',
              new Date().toISOString(),
              `Product ${updatedProduct.name} updated via bulk upload`,
              new Date().toISOString()
            ]
          );
        } else {
          // Create new product
          // Generate 11-digit adsId
          const timestamp = Date.now().toString().slice(-8);
          const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          const adsId = (timestamp + random).padStart(11, '0');
          const referenceNumber = `ADS${adsId}`;

          const res = await client.query(
            `INSERT INTO products
              (ads_id, reference_number, brand, name, sku, model, category, condition, price, cost, stock_quantity, specifications, description, is_active)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
             RETURNING *`,
            [
              adsId,
              referenceNumber,
              product.brand,
              product.name,
              product.sku,
              product.model,
              product.category,
              product.condition,
              (product.price),
              (product.cost),
              product.stockQuantity ?? 0,
              product.specifications ?? null,
              product.description ?? null,
              product.isActive ?? true
            ]
          );

          const row = res.rows[0];
          const createdProduct: Product = {
            id: row.id,
            adsId: row.ads_id,
            referenceNumber: row.reference_number,
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
          };

          processedProducts.push(createdProduct);
          createdCount++;

          // Create product date event for new product
          await client.query(
            `INSERT INTO product_date_events
              (product_id, event_type, event_date, notes, created_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              createdProduct.id,
              'product_added',
              new Date().toISOString(),
              `Product ${createdProduct.name} added to inventory via bulk upload`,
              new Date().toISOString()
            ]
          );
        }
      }

      await client.query('COMMIT');
      return { products: processedProducts, created: createdCount, updated: updatedCount };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    // Build dynamic SET clause
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(product)) {
      if (key === "stockQuantity") {
        fields.push(`stock_quantity = $${idx++}`);
        values.push(value);
      } else if (key === "isActive") {
        fields.push(`is_active = $${idx++}`);
        values.push(value);
      } else {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (fields.length === 0) return this.getProduct(id);
    values.push(id);
    const sql = `UPDATE products SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`;
    const res = await pool.query(sql, values);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      adsId: row.ads_id,
      referenceNumber: row.reference_number,
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
    };
  }

  async getProductByAdsId(adsId: string): Promise<Product | undefined> {
    const res = await pool.query("SELECT * FROM products WHERE ads_id = $1", [adsId]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      adsId: row.ads_id,
      referenceNumber: row.reference_number,
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
    };
  }

  async updateProductByAdsId(adsId: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    // Build dynamic SET clause
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(product)) {
      if (key === "stockQuantity") {
        fields.push(`stock_quantity = $${idx++}`);
        values.push(value);
      } else if (key === "isActive") {
        fields.push(`is_active = $${idx++}`);
        values.push(value);
      } else {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (fields.length === 0) return this.getProductByAdsId(adsId);
    values.push(adsId);
    const sql = `UPDATE products SET ${fields.join(", ")} WHERE ads_id = $${values.length} RETURNING *`;
    const res = await pool.query(sql, values);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      adsId: row.ads_id,
      referenceNumber: row.reference_number,
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
    };
  }

  async deleteProductByAdsId(adsId: string): Promise<boolean> {
    const res = await pool.query("DELETE FROM products WHERE ads_id = $1", [adsId]);
    return (res.rowCount ?? 0) > 0;
  }

  async deleteProduct(id: number): Promise<boolean> {
    console.log(`Deleting product with ID: ${id}`);
    const res = await pool.query("DELETE FROM products WHERE id = $1", [id]);
    console.log(`Delete result: ${res}`);
    return (res.rowCount ?? 0) > 0;
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
    const res = await pool.query("SELECT * FROM product_date_events ORDER BY created_at DESC");
    return res.rows.map(row => ({
      id: row.id,
      productId: row.product_id,
      clientId: row.client_id,
      eventType: row.event_type,
      eventDate: row.event_date,
      notes: row.notes,
      createdAt: row.created_at
    }));
  }

  async getProductDateEventsByProduct(productId: number): Promise<ProductDateEvent[]> {
    const res = await pool.query("SELECT * FROM product_date_events WHERE product_id = $1 ORDER BY created_at DESC", [productId]);
    return res.rows.map(row => ({
      id: row.id,
      productId: row.product_id,
      clientId: row.client_id,
      eventType: row.event_type,
      eventDate: row.event_date,
      notes: row.notes,
      createdAt: row.created_at
    }));
  }

  async getProductDateEvent(id: number): Promise<ProductDateEvent | undefined> {
    const res = await pool.query("SELECT * FROM product_date_events WHERE id = $1", [id]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      productId: row.product_id,
      clientId: row.client_id,
      eventType: row.event_type,
      eventDate: row.event_date,
      notes: row.notes,
      createdAt: row.created_at
    };
  }

  async createProductDateEvent(insertEvent: InsertProductDateEvent): Promise<ProductDateEvent> {
    const res = await pool.query(
      `INSERT INTO product_date_events
        (product_id, client_id, event_type, event_date, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        insertEvent.productId,
        insertEvent.clientId ?? null,
        insertEvent.eventType,
        insertEvent.eventDate,
        insertEvent.notes ?? null,
        new Date().toISOString()
      ]
    );

    const row = res.rows[0];
    return {
      id: row.id,
      productId: row.product_id,
      clientId: row.client_id,
      eventType: row.event_type,
      eventDate: row.event_date,
      notes: row.notes,
      createdAt: row.created_at
    };
  }

  async updateProductDateEvent(id: number, eventUpdate: Partial<InsertProductDateEvent>): Promise<ProductDateEvent | undefined> {
    // Build dynamic SET clause
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(eventUpdate)) {
      if (key === "productId") {
        fields.push(`product_id = $${idx++}`);
        values.push(value);
      } else if (key === "clientId") {
        fields.push(`client_id = $${idx++}`);
        values.push(value);
      } else if (key === "eventType") {
        fields.push(`event_type = $${idx++}`);
        values.push(value);
      } else if (key === "eventDate") {
        fields.push(`event_date = $${idx++}`);
        values.push(value);
      } else {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (fields.length === 0) return this.getProductDateEvent(id);
    values.push(id);
    const sql = `UPDATE product_date_events SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`;
    const res = await pool.query(sql, values);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      productId: row.product_id,
      clientId: row.client_id,
      eventType: row.event_type,
      eventDate: row.event_date,
      notes: row.notes,
      createdAt: row.created_at
    };
  }

  async deleteProductDateEvent(id: number): Promise<boolean> {
    const res = await pool.query("DELETE FROM product_date_events WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
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
