import {
  Product, InsertProduct,
  Client, InsertClient,
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
  createProduct(product: InsertProduct): Promise<Product>;
  createProducts(products: InsertProduct[]): Promise<{ products: Product[], created: number, updated: number }>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  updateProductByAdsId(adsId: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  updateProductOrderStatus(adsId: string, orderStatus: string): Promise<boolean>;
  updateProductProdStatus(adsId: string, prodStatus: string): Promise<boolean>;
  deleteProduct(id: number): Promise<boolean>;
  deleteProductByAdsId(adsId: string): Promise<boolean>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  getClientByEmail(email: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;


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
    const res = await pool.query("SELECT * FROM products WHERE is_deleted = FALSE");

    return res.rows.map(row => ({
      adsId: row.ads_id,
      referenceNumber: row.reference_number,
      brand: row.brand,
      model: row.model,
      condition: row.condition,
      costPrice: row.cost,
      specifications: row.specifications,
      prodId: row.prod_id,
      prodHealth: row.prod_health,
      prodStatus: row.prod_status,
      lastAuditDate: row.last_audit_date,
      auditStatus: row.audit_status,
      returnDate: row.return_date,
      maintenanceDate: row.maintenance_date,
      maintenanceStatus: row.maintenance_status,
      orderStatus: row.order_status,
      productType: row.prod_type,
      createdBy: row.created_by,
      // Audit and soft delete fields
      auditTrail: row.audit_trail,
      lastModifiedBy: row.last_modified_by,
      lastModifiedAt: row.last_modified_at,
      isDeleted: row.is_deleted,
      deletedAt: row.deleted_at,
      deletedBy: row.deleted_by
    }));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    // Since products table no longer has 'id' field, this method needs to be updated
    // For now, return undefined as this method is not compatible with new schema
    console.warn("getProduct(id) method is not compatible with new schema - products use adsId as primary key");
    return undefined;
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

    // Initialize audit trail
    const auditTrail = JSON.stringify([{
      action: 'created',
      timestamp: new Date().toISOString(),
      user: product.createdBy || 'system',
      details: 'Product created'
    }]);

    const res = await pool.query(
      `INSERT INTO products
        (ads_id, reference_number, brand, model, condition, cost, specifications, prod_id, prod_health, prod_status, last_audit_date, audit_status, return_date, maintenance_date, maintenance_status, order_status, prod_type, created_by, audit_trail, last_modified_by, last_modified_at, is_deleted)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
       RETURNING *`,
      [
        adsId,
        referenceNumber,
        product.brand,
        product.model,
        product.condition,
        product.costPrice,
        product.specifications ?? null,
        product.prodId ?? null,
        product.prodHealth ?? 'working',
        product.prodStatus ?? 'available',
        product.lastAuditDate ?? null,
        product.auditStatus ?? null,
        product.returnDate ?? null,
        product.maintenanceDate ?? null,
        product.maintenanceStatus ?? null,
        product.orderStatus ?? 'INVENTORY',
        product.productType ?? null,
        product.createdBy ?? null,
        auditTrail,
        product.createdBy ?? null,
        new Date().toISOString(),
        false // is_deleted
      ]
    );

    const row = res.rows[0];
    return {
      adsId: row.ads_id,
      referenceNumber: row.reference_number,
      brand: row.brand,
      model: row.model,
      condition: row.condition,
      costPrice: row.cost,
      specifications: row.specifications,
      prodId: row.prod_id,
      prodHealth: row.prod_health,
      prodStatus: row.prod_status,
      lastAuditDate: row.last_audit_date,
      auditStatus: row.audit_status,
      returnDate: row.return_date,
      maintenanceDate: row.maintenance_date,
      maintenanceStatus: row.maintenance_status,
      orderStatus: row.order_status,
      productType: row.prod_type,
      createdBy: row.created_by,
      auditTrail: row.audit_trail,
      lastModifiedBy: row.last_modified_by,
      lastModifiedAt: row.last_modified_at,
      isDeleted: row.is_deleted,
      deletedAt: row.deleted_at,
      deletedBy: row.deleted_by
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
        // Check if product with this reference number already exists
        const existingProduct = await client.query(
          'SELECT * FROM products WHERE reference_number = $1',
          [`ADS${product.brand}${product.model}`] // Simple reference number generation
        );

        if (existingProduct.rows.length > 0) {
          // Update existing product
          const existing = existingProduct.rows[0];
          const res = await client.query(
            `UPDATE products SET
              brand = $1, model = $2, condition = $3, cost = $4,
              specifications = $5, prod_id = $6, prod_health = $7,
              prod_status = $8, last_audit_date = $9, audit_status = $10,
              return_date = $11, maintenance_date = $12, maintenance_status = $13,
              order_status = $14, prod_type = $15, last_modified_by = $16,
              last_modified_at = $17
             WHERE reference_number = $18
             RETURNING *`,
            [
              product.brand,
              product.model,
              product.condition,
              product.costPrice,
              product.specifications ?? null,
              product.prodId ?? null,
              product.prodHealth ?? 'working',
              product.prodStatus ?? 'available',
              product.lastAuditDate ?? null,
              product.auditStatus ?? null,
              product.returnDate ?? null,
              product.maintenanceDate ?? null,
              product.maintenanceStatus ?? null,
              product.orderStatus ?? 'INVENTORY',
              product.productType ?? null,
              product.createdBy ?? null,
              new Date().toISOString(),
              `ADS${product.brand}${product.model}`
            ]
          );

          const row = res.rows[0];
          const updatedProduct: Product = {
            adsId: row.ads_id,
            referenceNumber: row.reference_number,
            brand: row.brand,
            model: row.model,
            condition: row.condition,
            costPrice: row.cost,
            specifications: row.specifications,
            prodId: row.prod_id,
            prodHealth: row.prod_health,
            prodStatus: row.prod_status,
            lastAuditDate: row.last_audit_date,
            auditStatus: row.audit_status,
            returnDate: row.return_date,
            maintenanceDate: row.maintenance_date,
            maintenanceStatus: row.maintenance_status,
            orderStatus: row.order_status,
            productType: row.prod_type,
            createdBy: row.created_by,
            auditTrail: row.audit_trail,
            lastModifiedBy: row.last_modified_by,
            lastModifiedAt: row.last_modified_at,
            isDeleted: row.is_deleted,
            deletedAt: row.deleted_at,
            deletedBy: row.deleted_by
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
              `Product ${updatedProduct.brand} ${updatedProduct.model} updated via bulk upload`,
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
              (ads_id, reference_number, brand, model, condition, cost, specifications, prod_id, prod_health, prod_status, last_audit_date, audit_status, return_date, maintenance_date, maintenance_status, order_status, prod_type, created_by, audit_trail, last_modified_by, last_modified_at, is_deleted)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
             RETURNING *`,
            [
              adsId,
              referenceNumber,
              product.brand,
              product.model,
              product.condition,
              product.costPrice,
              product.specifications ?? null,
              product.prodId ?? null,
              product.prodHealth ?? 'working',
              product.prodStatus ?? 'available',
              product.lastAuditDate ?? null,
              product.auditStatus ?? null,
              product.returnDate ?? null,
              product.maintenanceDate ?? null,
              product.maintenanceStatus ?? null,
              product.orderStatus ?? 'INVENTORY',
              product.productType ?? null,
              product.createdBy ?? null,
              JSON.stringify([{
                action: 'created',
                timestamp: new Date().toISOString(),
                user: product.createdBy || 'system',
                details: 'Product created via bulk upload'
              }]),
              product.createdBy ?? null,
              new Date().toISOString(),
              false
            ]
          );

          const row = res.rows[0];
          const createdProduct: Product = {
            adsId: row.ads_id,
            referenceNumber: row.reference_number,
            brand: row.brand,
            model: row.model,
            condition: row.condition,
            costPrice: row.cost,
            specifications: row.specifications,
            prodId: row.prod_id,
            prodHealth: row.prod_health,
            prodStatus: row.prod_status,
            lastAuditDate: row.last_audit_date,
            auditStatus: row.audit_status,
            returnDate: row.return_date,
            maintenanceDate: row.maintenance_date,
            maintenanceStatus: row.maintenance_status,
            orderStatus: row.order_status,
            productType: row.prod_type,
            createdBy: row.created_by,
            auditTrail: row.audit_trail,
            lastModifiedBy: row.last_modified_by,
            lastModifiedAt: row.last_modified_at,
            isDeleted: row.is_deleted,
            deletedAt: row.deleted_at,
            deletedBy: row.deleted_by
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
              `Product ${createdProduct.brand} ${createdProduct.model} added to inventory via bulk upload`,
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
    const res = await pool.query("SELECT * FROM products WHERE ads_id = $1 AND is_deleted = FALSE", [adsId]);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      adsId: row.ads_id,
      referenceNumber: row.reference_number,
      brand: row.brand,
      model: row.model,
      condition: row.condition,
      costPrice: row.cost,
      specifications: row.specifications,
      prodId: row.prod_id,
      prodHealth: row.prod_health,
      prodStatus: row.prod_status,
      lastAuditDate: row.last_audit_date,
      auditStatus: row.audit_status,
      returnDate: row.return_date,
      maintenanceDate: row.maintenance_date,
      maintenanceStatus: row.maintenance_status,
      orderStatus: row.order_status,
      productType: row.prod_type,
      createdBy: row.created_by,
      auditTrail: row.audit_trail,
      lastModifiedBy: row.last_modified_by,
      lastModifiedAt: row.last_modified_at,
      isDeleted: row.is_deleted,
      deletedAt: row.deleted_at,
      deletedBy: row.deleted_by
    };
  }

  async updateProductByAdsId(adsId: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    // Build dynamic SET clause
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(product)) {
      if (key === "costPrice") {
        fields.push(`cost = $${idx++}`);
        values.push(value);
      } else if (key === "productType") {
        fields.push(`prod_type = $${idx++}`);
        values.push(value);
      } else if (key === "prodId") {
        fields.push(`prod_id = $${idx++}`);
        values.push(value);
      } else if (key === "prodHealth") {
        fields.push(`prod_health = $${idx++}`);
        values.push(value);
      } else if (key === "prodStatus") {
        fields.push(`prod_status = $${idx++}`);
        values.push(value);
      } else if (key === "lastAuditDate") {
        fields.push(`last_audit_date = $${idx++}`);
        values.push(value);
      } else if (key === "auditStatus") {
        fields.push(`audit_status = $${idx++}`);
        values.push(value);
      } else if (key === "returnDate") {
        fields.push(`return_date = $${idx++}`);
        values.push(value);
      } else if (key === "maintenanceDate") {
        fields.push(`maintenance_date = $${idx++}`);
        values.push(value);
      } else if (key === "maintenanceStatus") {
        fields.push(`maintenance_status = $${idx++}`);
        values.push(value);
      } else if (key === "orderStatus") {
        fields.push(`order_status = $${idx++}`);
        values.push(value);
      } else if (key === "createdBy") {
        fields.push(`created_by = $${idx++}`);
        values.push(value);
      } else if (key === "lastModifiedBy") {
        fields.push(`last_modified_by = $${idx++}`);
        values.push(value);
      } else {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }

    // Always update last_modified_at
    fields.push(`last_modified_at = $${idx++}`);
    values.push(new Date().toISOString());

    if (fields.length === 0) return this.getProductByAdsId(adsId);
    values.push(adsId);
    const sql = `UPDATE products SET ${fields.join(", ")} WHERE ads_id = $${values.length} AND is_deleted = FALSE RETURNING *`;
    const res = await pool.query(sql, values);
    if (res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      adsId: row.ads_id,
      referenceNumber: row.reference_number,
      brand: row.brand,
      model: row.model,
      condition: row.condition,
      costPrice: row.cost,
      specifications: row.specifications,
      prodId: row.prod_id,
      prodHealth: row.prod_health,
      prodStatus: row.prod_status,
      lastAuditDate: row.last_audit_date,
      auditStatus: row.audit_status,
      returnDate: row.return_date,
      maintenanceDate: row.maintenance_date,
      maintenanceStatus: row.maintenance_status,
      orderStatus: row.order_status,
      productType: row.prod_type,
      createdBy: row.created_by,
      auditTrail: row.audit_trail,
      lastModifiedBy: row.last_modified_by,
      lastModifiedAt: row.last_modified_at,
      isDeleted: row.is_deleted,
      deletedAt: row.deleted_at,
      deletedBy: row.deleted_by
    };
  }

  async updateProductOrderStatus(adsId: string, orderStatus: string): Promise<boolean> {
    const res = await pool.query(
      "UPDATE products SET order_status = $1, last_modified_at = $2 WHERE ads_id = $3",
      [orderStatus, new Date().toISOString(), adsId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async updateProductProdStatus(adsId: string, prodStatus: string): Promise<boolean> {
    const res = await pool.query(
      "UPDATE products SET prod_status = $1, last_modified_at = $2 WHERE ads_id = $3",
      [prodStatus, new Date().toISOString(), adsId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async deleteProductByAdsId(adsId: string): Promise<boolean> {
    // Soft delete: set is_deleted = true and deleted_at/deleted_by
    const res = await pool.query(
      "UPDATE products SET is_deleted = TRUE, deleted_at = $1, deleted_by = $2 WHERE ads_id = $3 AND is_deleted = FALSE",
      [new Date().toISOString(), 'system', adsId]
    );
    const success = (res.rowCount ?? 0) > 0;

    if (success) {
      // Create product date event for deletion
      await pool.query(
        `INSERT INTO product_date_events
          (ads_id, event_type, event_date, notes, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          adsId,
          'product_deleted',
          new Date().toISOString(),
          `Product ${adsId} soft deleted from inventory`,
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
      isActive: row.is_active,
      cxType: row.cx_type,
      gst: row.gst,
      idProof: row.id_proof,
      website: row.website,
      addressProof: row.address_proof,
      repeatCx: row.repeat_cx
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
      isActive: row.is_active,
      cxType: row.cx_type,
      gst: row.gst,
      idProof: row.id_proof,
      website: row.website,
      addressProof: row.address_proof,
      repeatCx: row.repeat_cx
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
      isActive: row.is_active,
      cxType: row.cx_type,
      gst: row.gst,
      idProof: row.id_proof,
      website: row.website,
      addressProof: row.address_proof,
      repeatCx: row.repeat_cx
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
      adsIds: row.ads_ids || [],
      customerId: row.customer_id,
      orderId: row.order_id,
      orderType: row.order_status, // Note: column is still order_status in DB but maps to orderType
      requiredPieces: row.required_pieces,
      deliveredPieces: row.delivered_pieces,
      paymentPerPiece: row.payment_per_piece,
      securityDeposit: row.security_deposit,
      totalPaymentReceived: row.total_payment, // Note: column is still total_payment in DB but maps to totalPaymentReceived
      contractDate: row.contract_date,
      deliveryDate: row.delivery_date,
      quotedPrice: row.quoted_price,
      discount: row.discount,
      productType: row.prod_type,
      createdBy: row.created_by,
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
      empId: row.emp_id,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async createSalesBuy(insertSalesBuy: InsertSalesBuy): Promise<SalesBuy> {
    const res = await pool.query(
      `INSERT INTO sales_buy
        (ads_id, sales_date, cost_price, selling_price, customer_id, order_id, misc_cost, emp_id, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        insertSalesBuy.adsId,
        insertSalesBuy.salesDate,
        insertSalesBuy.costPrice,
        insertSalesBuy.sellingPrice,
        insertSalesBuy.customerId,
        insertSalesBuy.orderId ?? null,
        insertSalesBuy.miscCost ?? null,
        insertSalesBuy.empId ?? null,
        insertSalesBuy.createdBy ?? null,
        new Date().toISOString(),
        new Date().toISOString()
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
      empId: row.emp_id,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
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
      empId: row.emp_id,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async createSalesRent(insertSalesRent: InsertSalesRent): Promise<SalesRent> {
    const res = await pool.query(
      `INSERT INTO sales_rent
        (ads_id, prod_id, customer_id, payment_date, payment_due_date, payment_status, leased_quantity, lease_amount, payment_frequency, payment_total_number, emp_id, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
        insertSalesRent.empId ?? null,
        insertSalesRent.createdBy ?? null,
        new Date().toISOString(),
        new Date().toISOString()
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
      empId: row.emp_id,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
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
