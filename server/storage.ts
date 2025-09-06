import {
  Product, InsertProduct,
  Client, InsertClient,
  Sale, InsertSale, SaleWithDetails,
  ClientRequirement, InsertClientRequirement,
  RecoveryItem, InsertRecoveryItem,
  ProductDateEvent, InsertProductDateEvent,
  Order, InsertOrder,
  SalesBuy, InsertSalesBuy,
  SalesRent, InsertSalesRent
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
  getSalesByProduct(adsId: string): Promise<Sale[]>;
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
  getProductDateEventsByProduct(adsId: string): Promise<ProductDateEvent[]>;
  getProductDateEvent(id: number): Promise<ProductDateEvent | undefined>;
  createProductDateEvent(event: InsertProductDateEvent): Promise<ProductDateEvent>;
  updateProductDateEvent(id: number, event: Partial<InsertProductDateEvent>): Promise<ProductDateEvent | undefined>;
  deleteProductDateEvent(id: number): Promise<boolean>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;

  // Sales Buy
  getSalesBuy(): Promise<SalesBuy[]>;
  createSalesBuy(salesBuy: InsertSalesBuy): Promise<SalesBuy>;

  // Sales Rent
  getSalesRent(): Promise<SalesRent[]>;
  createSalesRent(salesRent: InsertSalesRent): Promise<SalesRent>;

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

  // Products
  async getProducts(): Promise<Product[]> {

    const res = await pool.query("SELECT * FROM products WHERE is_active = TRUE");

    return res.rows.map(row => ({
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
      isActive: row.is_active,
      // New fields
      prodId: row.prod_id,
      prodHealth: row.prod_health,
      prodStatus: row.prod_status,
      lastAuditDate: row.last_audit_date,
      auditStatus: row.audit_status,
      returnDate: row.return_date,
      maintenanceDate: row.maintenance_date,
      maintenanceStatus: row.maintenance_status,
      orderStatus: row.order_status,
      createdBy: row.created_by
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
      isActive: row.is_active,
      // New fields
      prodId: row.prod_id,
      prodHealth: row.prod_health,
      prodStatus: row.prod_status,
      lastAuditDate: row.last_audit_date,
      auditStatus: row.audit_status,
      returnDate: row.return_date,
      maintenanceDate: row.maintenance_date,
      maintenanceStatus: row.maintenance_status,
      orderStatus: row.order_status,
      createdBy: row.created_by
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
    // Generate incremental 11-digit adsId starting from 10000000001
    const result = await pool.query(`
      SELECT COALESCE(MAX(CAST(ads_id AS BIGINT)), 10000000000) as max_id
      FROM products
    `);
    const maxId = Number(result.rows[0].max_id);
    const nextId = maxId + 1;
    const adsId = nextId.toString().padStart(11, '0');
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

      // Get the current max adsId once at the beginning
      const maxIdResult = await client.query(`
        SELECT COALESCE(MAX(CAST(ads_id AS BIGINT)), 10000000000) as max_id
        FROM products
      `);
      let currentMaxId = Number(maxIdResult.rows[0].max_id);

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
              (ads_id, event_type, event_date, notes, created_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              updatedProduct.adsId,
              'product_updated',
              new Date().toISOString(),
              `Product ${updatedProduct.name} updated via bulk upload`,
              new Date().toISOString()
            ]
          );
        } else {
          // Create new product
          // Generate incremental 11-digit adsId starting from 10000000001
          currentMaxId += 1;
          const adsId = currentMaxId.toString().padStart(11, '0');
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
              (ads_id, event_type, event_date, notes, created_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              createdProduct.adsId,
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
    // Soft delete: set isActive to false instead of hard delete
    const res = await pool.query("UPDATE products SET is_active = false WHERE ads_id = $1", [adsId]);
    const success = (res.rowCount ?? 0) > 0;

    if (success) {
      // Create product date event for deactivation
      await pool.query(
        `INSERT INTO product_date_events
          (ads_id, event_type, event_date, notes, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          adsId,
          'product_deactivated',
          new Date().toISOString(),
          `Product deactivated from inventory`,
          new Date().toISOString()
        ]
      );
    }

    return success;
  }

  async deleteProduct(id: number): Promise<boolean> {
    console.log(`Soft deleting product with ID: ${id}`);

    // First get the product to get its adsId for the event
    const product = await this.getProduct(id);
    if (!product) {
      console.log(`Product with ID ${id} not found`);
      return false;
    }

    // Soft delete: set isActive to false instead of hard delete
    const res = await pool.query("UPDATE products SET is_active = false WHERE id = $1", [id]);
    const success = (res.rowCount ?? 0) > 0;

    if (success) {
      // Create product date event for deactivation
      await pool.query(
        `INSERT INTO product_date_events
          (ads_id, event_type, event_date, notes, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          product.adsId,
          'product_deactivated',
          new Date().toISOString(),
          `Product ${product.name} deactivated from inventory`,
          new Date().toISOString()
        ]
      );
    }

    console.log(`Soft delete result: ${success}`);
    return success;
  }

  // Clients
  async getClients(): Promise<Client[]> {
    const res = await pool.query("SELECT * FROM clients WHERE is_active = TRUE ORDER BY name");
    return res.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      company: row.company,
      isActive: row.is_active
    }));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const res = await pool.query("SELECT * FROM clients WHERE id = $1", [id]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      company: row.company,
      isActive: row.is_active
    };
  }

  async getClientByEmail(email: string): Promise<Client | undefined> {
    const res = await pool.query("SELECT * FROM clients WHERE email = $1", [email]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      company: row.company,
      isActive: row.is_active
    };
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const res = await pool.query(
      `INSERT INTO clients
        (name, email, phone, address, city, state, zip_code, company, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        insertClient.name,
        insertClient.email,
        insertClient.phone ?? null,
        insertClient.address ?? null,
        insertClient.city ?? null,
        insertClient.state ?? null,
        insertClient.zipCode ?? null,
        insertClient.company ?? null,
        insertClient.isActive ?? true
      ]
    );

    const row = res.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      company: row.company,
      isActive: row.is_active
    };
  }

  async updateClient(id: number, clientUpdate: Partial<InsertClient>): Promise<Client | undefined> {
    // Build dynamic SET clause
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(clientUpdate)) {
      if (key === "zipCode") {
        fields.push(`zip_code = $${idx++}`);
        values.push(value);
      } else if (key === "isActive") {
        fields.push(`is_active = $${idx++}`);
        values.push(value);
      } else {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (fields.length === 0) return this.getClient(id);
    values.push(id);
    const sql = `UPDATE clients SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`;
    const res = await pool.query(sql, values);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      company: row.company,
      isActive: row.is_active
    };
  }

  async deleteClient(id: number): Promise<boolean> {
    const res = await pool.query("DELETE FROM clients WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    const res = await pool.query("SELECT * FROM sales ORDER BY sale_date DESC");
    return res.rows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      adsId: row.ads_id,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      totalAmount: row.total_amount,
      saleDate: row.sale_date,
      status: row.status,
      notes: row.notes
    }));
  }

  async getSalesWithDetails(): Promise<SaleWithDetails[]> {
    const res = await pool.query(`
      SELECT
        s.*,
        c.name as client_name, c.email as client_email,
        p.ads_id, p.name as product_name, p.brand, p.model, p.price
      FROM sales s
      JOIN clients c ON s.client_id = c.id
      JOIN products p ON s.ads_id = p.ads_id
      ORDER BY s.sale_date DESC
    `);

    return res.rows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      adsId: row.ads_id,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      totalAmount: row.total_amount,
      saleDate: row.sale_date,
      status: row.status,
      notes: row.notes,
      client: {
        id: row.client_id,
        name: row.client_name,
        email: row.client_email,
        phone: null,
        address: null,
        city: null,
        state: null,
        zipCode: null,
        company: null,
        isActive: true
      },
      product: {
        id: 0, // Not used with adsId
        adsId: row.ads_id,
        referenceNumber: `ADS${row.ads_id}`,
        name: row.product_name,
        sku: '',
        brand: row.brand,
        model: row.model,
        category: '',
        condition: '',
        price: row.price,
        cost: '0',
        stockQuantity: 0,
        specifications: null,
        description: null,
        isActive: true
      }
    }));
  }

  async getSale(id: number): Promise<Sale | undefined> {
    const res = await pool.query("SELECT * FROM sales WHERE id = $1", [id]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      clientId: row.client_id,
      adsId: row.ads_id,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      totalAmount: row.total_amount,
      saleDate: row.sale_date,
      status: row.status,
      notes: row.notes
    };
  }

  async getSalesByClient(clientId: number): Promise<Sale[]> {
    const res = await pool.query("SELECT * FROM sales WHERE client_id = $1 ORDER BY sale_date DESC", [clientId]);
    return res.rows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      adsId: row.ads_id,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      totalAmount: row.total_amount,
      saleDate: row.sale_date,
      status: row.status,
      notes: row.notes
    }));
  }

  async getSalesByProduct(adsId: string): Promise<Sale[]> {
    const res = await pool.query("SELECT * FROM sales WHERE ads_id = $1 ORDER BY sale_date DESC", [adsId]);
    return res.rows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      adsId: row.ads_id,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      totalAmount: row.total_amount,
      saleDate: row.sale_date,
      status: row.status,
      notes: row.notes
    }));
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const res = await pool.query(
      `INSERT INTO sales
        (client_id, ads_id, quantity, unit_price, total_amount, sale_date, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        insertSale.clientId,
        insertSale.adsId,
        insertSale.quantity,
        insertSale.unitPrice,
        insertSale.totalAmount,
        insertSale.saleDate,
        insertSale.status ?? "completed",
        insertSale.notes ?? null
      ]
    );

    const row = res.rows[0];
    const sale: Sale = {
      id: row.id,
      clientId: row.client_id,
      adsId: row.ads_id,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      totalAmount: row.total_amount,
      saleDate: row.sale_date,
      status: row.status,
      notes: row.notes
    };

    // Update product stock
    await pool.query(
      "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE ads_id = $2",
      [sale.quantity, sale.adsId]
    );

    return sale;
  }

  async updateSale(id: number, saleUpdate: Partial<InsertSale>): Promise<Sale | undefined> {
    // Build dynamic SET clause
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(saleUpdate)) {
      if (key === "adsId") {
        fields.push(`ads_id = $${idx++}`);
        values.push(value);
      } else if (key === "unitPrice") {
        fields.push(`unit_price = $${idx++}`);
        values.push(value);
      } else if (key === "totalAmount") {
        fields.push(`total_amount = $${idx++}`);
        values.push(value);
      } else if (key === "saleDate") {
        fields.push(`sale_date = $${idx++}`);
        values.push(value);
      } else {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (fields.length === 0) return this.getSale(id);
    values.push(id);
    const sql = `UPDATE sales SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`;
    const res = await pool.query(sql, values);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      clientId: row.client_id,
      adsId: row.ads_id,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      totalAmount: row.total_amount,
      saleDate: row.sale_date,
      status: row.status,
      notes: row.notes
    };
  }

  async deleteSale(id: number): Promise<boolean> {
    const res = await pool.query("DELETE FROM sales WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  }

  // Client Requirements
  async getClientRequirements(): Promise<ClientRequirement[]> {
    const res = await pool.query("SELECT * FROM client_requirements ORDER BY created_date DESC");
    return res.rows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      productCategory: row.product_category,
      specifications: row.specifications,
      budgetMin: row.budget_min,
      budgetMax: row.budget_max,
      timeframe: row.timeframe,
      priority: row.priority,
      status: row.status,
      notes: row.notes,
      createdDate: row.created_date
    }));
  }

  async getClientRequirement(id: number): Promise<ClientRequirement | undefined> {
    const res = await pool.query("SELECT * FROM client_requirements WHERE id = $1", [id]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      clientId: row.client_id,
      productCategory: row.product_category,
      specifications: row.specifications,
      budgetMin: row.budget_min,
      budgetMax: row.budget_max,
      timeframe: row.timeframe,
      priority: row.priority,
      status: row.status,
      notes: row.notes,
      createdDate: row.created_date
    };
  }

  async getClientRequirementsByClient(clientId: number): Promise<ClientRequirement[]> {
    const res = await pool.query("SELECT * FROM client_requirements WHERE client_id = $1 ORDER BY created_date DESC", [clientId]);
    return res.rows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      productCategory: row.product_category,
      specifications: row.specifications,
      budgetMin: row.budget_min,
      budgetMax: row.budget_max,
      timeframe: row.timeframe,
      priority: row.priority,
      status: row.status,
      notes: row.notes,
      createdDate: row.created_date
    }));
  }

  async createClientRequirement(insertRequirement: InsertClientRequirement): Promise<ClientRequirement> {
    const res = await pool.query(
      `INSERT INTO client_requirements
        (client_id, product_category, specifications, budget_min, budget_max, timeframe, priority, status, notes, created_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        insertRequirement.clientId,
        insertRequirement.productCategory,
        insertRequirement.specifications ?? null,
        insertRequirement.budgetMin ?? null,
        insertRequirement.budgetMax ?? null,
        insertRequirement.timeframe ?? null,
        insertRequirement.priority ?? "medium",
        insertRequirement.status ?? "active",
        insertRequirement.notes ?? null,
        insertRequirement.createdDate ?? new Date().toISOString()
      ]
    );

    const row = res.rows[0];
    return {
      id: row.id,
      clientId: row.client_id,
      productCategory: row.product_category,
      specifications: row.specifications,
      budgetMin: row.budget_min,
      budgetMax: row.budget_max,
      timeframe: row.timeframe,
      priority: row.priority,
      status: row.status,
      notes: row.notes,
      createdDate: row.created_date
    };
  }

  async updateClientRequirement(id: number, requirementUpdate: Partial<InsertClientRequirement>): Promise<ClientRequirement | undefined> {
    // Build dynamic SET clause
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(requirementUpdate)) {
      if (key === "budgetMin") {
        fields.push(`budget_min = $${idx++}`);
        values.push(value);
      } else if (key === "budgetMax") {
        fields.push(`budget_max = $${idx++}`);
        values.push(value);
      } else if (key === "productCategory") {
        fields.push(`product_category = $${idx++}`);
        values.push(value);
      } else if (key === "createdDate") {
        fields.push(`created_date = $${idx++}`);
        values.push(value);
      } else {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (fields.length === 0) return this.getClientRequirement(id);
    values.push(id);
    const sql = `UPDATE client_requirements SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`;
    const res = await pool.query(sql, values);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      clientId: row.client_id,
      productCategory: row.product_category,
      specifications: row.specifications,
      budgetMin: row.budget_min,
      budgetMax: row.budget_max,
      timeframe: row.timeframe,
      priority: row.priority,
      status: row.status,
      notes: row.notes,
      createdDate: row.created_date
    };
  }

  async deleteClientRequirement(id: number): Promise<boolean> {
    const res = await pool.query("DELETE FROM client_requirements WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  }

  // Recovery Items
  async getRecoveryItems(): Promise<RecoveryItem[]> {
    const res = await pool.query("SELECT * FROM recovery_items ORDER BY recovery_date DESC");
    return res.rows.map(row => ({
      id: row.id,
      adsId: row.ads_id,
      clientId: row.client_id,
      brand: row.brand,
      model: row.model,
      condition: row.condition,
      recoveryDate: row.recovery_date,
      estimatedValue: row.estimated_value,
      repairCost: row.repair_cost,
      status: row.status,
      notes: row.notes
    }));
  }

  async getRecoveryItem(id: number): Promise<RecoveryItem | undefined> {
    const res = await pool.query("SELECT * FROM recovery_items WHERE id = $1", [id]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      adsId: row.ads_id,
      clientId: row.client_id,
      brand: row.brand,
      model: row.model,
      condition: row.condition,
      recoveryDate: row.recovery_date,
      estimatedValue: row.estimated_value,
      repairCost: row.repair_cost,
      status: row.status,
      notes: row.notes
    };
  }

  async createRecoveryItem(insertItem: InsertRecoveryItem): Promise<RecoveryItem> {
    const res = await pool.query(
      `INSERT INTO recovery_items
        (ads_id, client_id, brand, model, condition, recovery_date, estimated_value, repair_cost, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        insertItem.adsId ?? null,
        insertItem.clientId ?? null,
        insertItem.brand,
        insertItem.model,
        insertItem.condition,
        insertItem.recoveryDate,
        insertItem.estimatedValue ?? null,
        insertItem.repairCost ?? null,
        insertItem.status ?? "received",
        insertItem.notes ?? null
      ]
    );

    const row = res.rows[0];
    return {
      id: row.id,
      adsId: row.ads_id,
      clientId: row.client_id,
      brand: row.brand,
      model: row.model,
      condition: row.condition,
      recoveryDate: row.recovery_date,
      estimatedValue: row.estimated_value,
      repairCost: row.repair_cost,
      status: row.status,
      notes: row.notes
    };
  }

  async updateRecoveryItem(id: number, itemUpdate: Partial<InsertRecoveryItem>): Promise<RecoveryItem | undefined> {
    // Build dynamic SET clause
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(itemUpdate)) {
      if (key === "adsId") {
        fields.push(`ads_id = $${idx++}`);
        values.push(value);
      } else if (key === "clientId") {
        fields.push(`client_id = $${idx++}`);
        values.push(value);
      } else if (key === "recoveryDate") {
        fields.push(`recovery_date = $${idx++}`);
        values.push(value);
      } else if (key === "estimatedValue") {
        fields.push(`estimated_value = $${idx++}`);
        values.push(value);
      } else if (key === "repairCost") {
        fields.push(`repair_cost = $${idx++}`);
        values.push(value);
      } else {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (fields.length === 0) return this.getRecoveryItem(id);
    values.push(id);
    const sql = `UPDATE recovery_items SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`;
    const res = await pool.query(sql, values);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      adsId: row.ads_id,
      clientId: row.client_id,
      brand: row.brand,
      model: row.model,
      condition: row.condition,
      recoveryDate: row.recovery_date,
      estimatedValue: row.estimated_value,
      repairCost: row.repair_cost,
      status: row.status,
      notes: row.notes
    };
  }

  async deleteRecoveryItem(id: number): Promise<boolean> {
    const res = await pool.query("DELETE FROM recovery_items WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  }

  // Product Date Events
  async getProductDateEvents(): Promise<ProductDateEvent[]> {
    const res = await pool.query("SELECT * FROM product_date_events ORDER BY created_at DESC");
    return res.rows.map(row => ({
      id: row.id,
      adsId: row.ads_id,
      clientId: row.client_id,
      eventType: row.event_type,
      eventDate: row.event_date,
      notes: row.notes,
      createdAt: row.created_at
    }));
  }

  async getProductDateEventsByProduct(adsId: string): Promise<ProductDateEvent[]> {
    const res = await pool.query("SELECT * FROM product_date_events WHERE ads_id = $1 ORDER BY created_at DESC", [adsId]);
    return res.rows.map(row => ({
      id: row.id,
      adsId: row.ads_id,
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
      adsId: row.ads_id,
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
        (ads_id, client_id, event_type, event_date, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        insertEvent.adsId,
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
      adsId: row.ads_id,
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
      if (key === "adsId") {
        fields.push(`ads_id = $${idx++}`);
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
      adsId: row.ads_id,
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

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    return res.rows.map(row => ({
      id: row.id,
      adsId: row.ads_id,
      customerId: row.customer_id,
      orderId: row.order_id,
      orderStatus: row.order_status,
      requiredPieces: row.required_pieces,
      deliveredPieces: row.delivered_pieces,
      paymentPerPiece: row.payment_per_piece,
      securityDeposit: row.security_deposit,
      totalPayment: row.total_payment,
      contractDate: row.contract_date,
      deliveryDate: row.delivery_date,
      quotedPrice: row.quoted_price,
      discount: row.discount,
      prodId: row.prod_id,
      prodName: row.prod_name,
      prodCategory: row.prod_category,
      createdAt: row.created_at
    }));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const res = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      adsId: row.ads_id,
      customerId: row.customer_id,
      orderId: row.order_id,
      orderStatus: row.order_status,
      requiredPieces: row.required_pieces,
      deliveredPieces: row.delivered_pieces,
      paymentPerPiece: row.payment_per_piece,
      securityDeposit: row.security_deposit,
      totalPayment: row.total_payment,
      contractDate: row.contract_date,
      deliveryDate: row.delivery_date,
      quotedPrice: row.quoted_price,
      discount: row.discount,
      prodId: row.prod_id,
      prodName: row.prod_name,
      prodCategory: row.prod_category,
      createdAt: row.created_at
    };
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const res = await pool.query(
      `INSERT INTO orders
        (ads_id, customer_id, order_id, order_status, required_pieces, delivered_pieces, payment_per_piece, security_deposit, total_payment, contract_date, delivery_date, quoted_price, discount, prod_id, prod_name, prod_category, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        insertOrder.adsId,
        insertOrder.customerId,
        insertOrder.orderId,
        insertOrder.orderStatus,
        insertOrder.requiredPieces,
        insertOrder.deliveredPieces ?? 0,
        insertOrder.paymentPerPiece,
        insertOrder.securityDeposit ?? null,
        insertOrder.totalPayment,
        insertOrder.contractDate,
        insertOrder.deliveryDate ?? null,
        insertOrder.quotedPrice ?? null,
        insertOrder.discount ?? null,
        insertOrder.prodId ?? null,
        insertOrder.prodName ?? null,
        insertOrder.prodCategory ?? null,
        insertOrder.createdAt ?? new Date().toISOString()
      ]
    );

    const row = res.rows[0];
    return {
      id: row.id,
      adsId: row.ads_id,
      customerId: row.customer_id,
      orderId: row.order_id,
      orderStatus: row.order_status,
      requiredPieces: row.required_pieces,
      deliveredPieces: row.delivered_pieces,
      paymentPerPiece: row.payment_per_piece,
      securityDeposit: row.security_deposit,
      totalPayment: row.total_payment,
      contractDate: row.contract_date,
      deliveryDate: row.delivery_date,
      quotedPrice: row.quoted_price,
      discount: row.discount,
      prodId: row.prod_id,
      prodName: row.prod_name,
      prodCategory: row.prod_category,
      createdAt: row.created_at
    };
  }

  async updateOrder(id: number, orderUpdate: Partial<InsertOrder>): Promise<Order | undefined> {
    // Build dynamic SET clause
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(orderUpdate)) {
      if (key === "adsId") {
        fields.push(`ads_id = $${idx++}`);
        values.push(value);
      } else if (key === "customerId") {
        fields.push(`customer_id = $${idx++}`);
        values.push(value);
      } else if (key === "orderId") {
        fields.push(`order_id = $${idx++}`);
        values.push(value);
      } else if (key === "orderStatus") {
        fields.push(`order_status = $${idx++}`);
        values.push(value);
      } else if (key === "requiredPieces") {
        fields.push(`required_pieces = $${idx++}`);
        values.push(value);
      } else if (key === "deliveredPieces") {
        fields.push(`delivered_pieces = $${idx++}`);
        values.push(value);
      } else if (key === "paymentPerPiece") {
        fields.push(`payment_per_piece = $${idx++}`);
        values.push(value);
      } else if (key === "securityDeposit") {
        fields.push(`security_deposit = $${idx++}`);
        values.push(value);
      } else if (key === "totalPayment") {
        fields.push(`total_payment = $${idx++}`);
        values.push(value);
      } else if (key === "contractDate") {
        fields.push(`contract_date = $${idx++}`);
        values.push(value);
      } else if (key === "deliveryDate") {
        fields.push(`delivery_date = $${idx++}`);
        values.push(value);
      } else if (key === "quotedPrice") {
        fields.push(`quoted_price = $${idx++}`);
        values.push(value);
      } else if (key === "prodId") {
        fields.push(`prod_id = $${idx++}`);
        values.push(value);
      } else if (key === "prodName") {
        fields.push(`prod_name = $${idx++}`);
        values.push(value);
      } else if (key === "prodCategory") {
        fields.push(`prod_category = $${idx++}`);
        values.push(value);
      } else if (key === "createdAt") {
        fields.push(`created_at = $${idx++}`);
        values.push(value);
      } else {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (fields.length === 0) return this.getOrder(id);
    values.push(id);
    const sql = `UPDATE orders SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`;
    const res = await pool.query(sql, values);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      adsId: row.ads_id,
      customerId: row.customer_id,
      orderId: row.order_id,
      orderStatus: row.order_status,
      requiredPieces: row.required_pieces,
      deliveredPieces: row.delivered_pieces,
      paymentPerPiece: row.payment_per_piece,
      securityDeposit: row.security_deposit,
      totalPayment: row.total_payment,
      contractDate: row.contract_date,
      deliveryDate: row.delivery_date,
      quotedPrice: row.quoted_price,
      discount: row.discount,
      prodId: row.prod_id,
      prodName: row.prod_name,
      prodCategory: row.prod_category,
      createdAt: row.created_at
    };
  }

  async deleteOrder(id: number): Promise<boolean> {
    const res = await pool.query("DELETE FROM orders WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  }

  // Sales Buy
  async getSalesBuy(): Promise<SalesBuy[]> {
    const res = await pool.query("SELECT * FROM sales_buy ORDER BY sales_date DESC");
    return res.rows.map(row => ({
      id: row.id,
      adsId: row.ads_id,
      salesDate: row.sales_date,
      costPrice: row.cost_price,
      sellingPrice: row.selling_price,
      customerId: row.customer_id,
      orderId: row.order_id,
      miscCost: row.misc_cost,
      empId: row.emp_id
    }));
  }

  async createSalesBuy(insertSalesBuy: InsertSalesBuy): Promise<SalesBuy> {
    const res = await pool.query(
      `INSERT INTO sales_buy
        (ads_id, sales_date, cost_price, selling_price, customer_id, order_id, misc_cost, emp_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        insertSalesBuy.adsId,
        insertSalesBuy.salesDate,
        insertSalesBuy.costPrice,
        insertSalesBuy.sellingPrice,
        insertSalesBuy.customerId,
        insertSalesBuy.orderId ?? null,
        insertSalesBuy.miscCost ?? null,
        insertSalesBuy.empId ?? null
      ]
    );

    const row = res.rows[0];
    return {
      id: row.id,
      adsId: row.ads_id,
      salesDate: row.sales_date,
      costPrice: row.cost_price,
      sellingPrice: row.selling_price,
      customerId: row.customer_id,
      orderId: row.order_id,
      miscCost: row.misc_cost,
      empId: row.emp_id
    };
  }

  // Sales Rent
  async getSalesRent(): Promise<SalesRent[]> {
    const res = await pool.query("SELECT * FROM sales_rent ORDER BY payment_date DESC");
    return res.rows.map(row => ({
      id: row.id,
      adsId: row.ads_id,
      prodId: row.prod_id,
      customerId: row.customer_id,
      paymentDate: row.payment_date,
      paymentDueDate: row.payment_due_date,
      paymentStatus: row.payment_status,
      leasedQuantity: row.leased_quantity,
      leaseAmount: row.lease_amount,
      paymentFrequency: row.payment_frequency,
      paymentTotalNumber: row.payment_total_number,
      empId: row.emp_id
    }));
  }

  async createSalesRent(insertSalesRent: InsertSalesRent): Promise<SalesRent> {
    const res = await pool.query(
      `INSERT INTO sales_rent
        (ads_id, prod_id, customer_id, payment_date, payment_due_date, payment_status, leased_quantity, lease_amount, payment_frequency, payment_total_number, emp_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        insertSalesRent.adsId,
        insertSalesRent.prodId ?? null,
        insertSalesRent.customerId,
        insertSalesRent.paymentDate,
        insertSalesRent.paymentDueDate,
        insertSalesRent.paymentStatus,
        insertSalesRent.leasedQuantity,
        insertSalesRent.leaseAmount,
        insertSalesRent.paymentFrequency,
        insertSalesRent.paymentTotalNumber,
        insertSalesRent.empId ?? null
      ]
    );

    const row = res.rows[0];
    return {
      id: row.id,
      adsId: row.ads_id,
      prodId: row.prod_id,
      customerId: row.customer_id,
      paymentDate: row.payment_date,
      paymentDueDate: row.payment_due_date,
      paymentStatus: row.payment_status,
      leasedQuantity: row.leased_quantity,
      leaseAmount: row.lease_amount,
      paymentFrequency: row.payment_frequency,
      paymentTotalNumber: row.payment_total_number,
      empId: row.emp_id
    };
  }

  // Analytics
  async getDashboardStats() {
    try {
      // Get total inventory
      const inventoryRes = await pool.query(
        "SELECT SUM(stock_quantity) as total FROM products WHERE is_active = TRUE"
      );
      const totalInventory = parseInt(inventoryRes.rows[0]?.total || '0');

      // Get monthly sales
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // PostgreSQL months are 1-based
      const currentYear = currentDate.getFullYear();

      const monthlySalesRes = await pool.query(
        `SELECT SUM(total_amount) as total FROM sales
         WHERE EXTRACT(MONTH FROM sale_date::date) = $1
         AND EXTRACT(YEAR FROM sale_date::date) = $2`,
        [currentMonth, currentYear]
      );
      const monthlySales = parseFloat(monthlySalesRes.rows[0]?.total || '0');

      // Get active clients count
      const clientsRes = await pool.query(
        "SELECT COUNT(*) as count FROM clients WHERE is_active = TRUE"
      );
      const activeClients = parseInt(clientsRes.rows[0]?.count || '0');

      // Get recovery items count
      const recoveryRes = await pool.query(
        "SELECT COUNT(*) as count FROM recovery_items"
      );
      const recoveryItems = parseInt(recoveryRes.rows[0]?.count || '0');

      // Get low stock items
      const lowStockRes = await pool.query(
        "SELECT COUNT(*) as count FROM products WHERE is_active = TRUE AND stock_quantity < 10"
      );
      const lowStockItems = parseInt(lowStockRes.rows[0]?.count || '0');

      // Get pending orders
      const pendingRes = await pool.query(
        "SELECT COUNT(*) as count FROM sales WHERE status = 'pending'"
      );
      const pendingOrders = parseInt(pendingRes.rows[0]?.count || '0');

      // Calculate growth (simplified - you can enhance this)
      const salesGrowth = 8.5; // Placeholder - implement actual calculation
      const clientGrowth = -2;  // Placeholder - implement actual calculation

      return {
        totalInventory,
        monthlySales,
        activeClients,
        recoveryItems,
        lowStockItems,
        pendingOrders,
        salesGrowth,
        clientGrowth,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values if query fails
      return {
        totalInventory: 0,
        monthlySales: 0,
        activeClients: 0,
        recoveryItems: 0,
        lowStockItems: 0,
        pendingOrders: 0,
        salesGrowth: 0,
        clientGrowth: 0,
      };
    }
  }
}

export const storage = new PostgresStorage();
