import { and, asc, desc, eq, getTableColumns, gte, ilike, inArray, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { categories, orderItems, orders, products, type Category, type Order, type OrderItem, type Product } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";

export type ProductWithCategory = Product & { categoryName: string; categorySlug: string };

export { SORT_OPTIONS, type SortValue } from "@/lib/catalog";

export interface ProductFilters {
  q?: string;
  category?: string;
  sort?: string;
  minCents?: number;
  maxCents?: number;
  tag?: string;
  includeInactive?: boolean;
}

const productSelection = {
  ...getTableColumns(products),
  categoryName: categories.name,
  categorySlug: categories.slug,
};

function baseProductQuery() {
  return db.select(productSelection).from(products).innerJoin(categories, eq(products.categoryId, categories.id));
}

export async function getCategories(): Promise<Category[]> {
  await ensureSeeded();
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  await ensureSeeded();
  const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return rows[0];
}

export async function getCategoriesWithCounts(): Promise<Array<Category & { productCount: number }>> {
  await ensureSeeded();
  const rows = await db
    .select({
      ...getTableColumns(categories),
      productCount: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .leftJoin(products, and(eq(products.categoryId, categories.id), eq(products.isActive, true)))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder));
  return rows;
}

export async function getFeaturedProducts(limit = 8): Promise<ProductWithCategory[]> {
  await ensureSeeded();
  return baseProductQuery()
    .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
    .orderBy(desc(products.reviewCount))
    .limit(limit);
}

export async function getNewArrivals(limit = 4): Promise<ProductWithCategory[]> {
  await ensureSeeded();
  return baseProductQuery().where(eq(products.isActive, true)).orderBy(desc(products.createdAt), desc(products.id)).limit(limit);
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductWithCategory[]> {
  await ensureSeeded();
  const conditions: SQL[] = [];
  if (!filters.includeInactive) conditions.push(eq(products.isActive, true));
  if (filters.category) conditions.push(eq(categories.slug, filters.category));
  if (filters.minCents !== undefined) conditions.push(gte(products.priceCents, filters.minCents));
  if (filters.maxCents !== undefined) conditions.push(lte(products.priceCents, filters.maxCents));
  if (filters.tag) conditions.push(sql`${products.tags} @> ${JSON.stringify([filters.tag])}::jsonb`);
  if (filters.q) {
    const term = `%${filters.q.trim()}%`;
    const search = or(
      ilike(products.name, term),
      ilike(products.brand, term),
      ilike(products.shortDescription, term),
      ilike(categories.name, term),
    );
    if (search) conditions.push(search);
  }

  const orderBy = (() => {
    switch (filters.sort) {
      case "newest":
        return [desc(products.createdAt), desc(products.id)];
      case "price-asc":
        return [asc(products.priceCents)];
      case "price-desc":
        return [desc(products.priceCents)];
      case "rating":
        return [desc(products.rating), desc(products.reviewCount)];
      default:
        return [desc(products.isFeatured), desc(products.reviewCount)];
    }
  })();

  return baseProductQuery()
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...orderBy);
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | undefined> {
  await ensureSeeded();
  const rows = await baseProductQuery().where(eq(products.slug, slug)).limit(1);
  return rows[0];
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  return db.select().from(products).where(inArray(products.id, ids));
}

export async function getRelatedProducts(categoryId: number, excludeId: number, limit = 4): Promise<ProductWithCategory[]> {
  return baseProductQuery()
    .where(and(eq(products.isActive, true), eq(products.categoryId, categoryId), ne(products.id, excludeId)))
    .orderBy(desc(products.reviewCount))
    .limit(limit);
}

export async function getAllProductSlugs(): Promise<Array<{ slug: string; createdAt: Date }>> {
  await ensureSeeded();
  return db.select({ slug: products.slug, createdAt: products.createdAt }).from(products).where(eq(products.isActive, true));
}

export type OrderWithItems = Order & { items: OrderItem[] };

export async function getOrderByNumber(orderNumber: string): Promise<OrderWithItems | undefined> {
  const rows = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber.trim().toUpperCase())).limit(1);
  const order = rows[0];
  if (!order) return undefined;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)).orderBy(asc(orderItems.id));
  return { ...order, items };
}

export async function getOrderForTracking(orderNumber: string, email: string): Promise<OrderWithItems | undefined> {
  const order = await getOrderByNumber(orderNumber);
  if (!order) return undefined;
  if (order.email.toLowerCase() !== email.trim().toLowerCase()) return undefined;
  return order;
}

/* ---------- Admin ---------- */

export async function getAdminStats() {
  await ensureSeeded();
  const [orderStats] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      revenueCents: sql<number>`coalesce(sum(case when ${orders.status} <> 'cancelled' then ${orders.totalCents} else 0 end), 0)::int`,
      openOrders: sql<number>`count(*) filter (where ${orders.status} in ('processing', 'packed'))::int`,
      countries: sql<number>`count(distinct ${orders.countryCode})::int`,
    })
    .from(orders);

  const [productStats] = await db
    .select({
      totalProducts: sql<number>`count(*)::int`,
      lowStock: sql<number>`count(*) filter (where ${products.stock} <= 10)::int`,
    })
    .from(products);

  return { ...orderStats, ...productStats };
}

export async function getRecentOrders(limit = 50): Promise<Order[]> {
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
}

export async function getOrdersWithItems(limit = 100): Promise<OrderWithItems[]> {
  const orderRows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
  if (orderRows.length === 0) return [];
  const itemRows = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderRows.map((o) => o.id)))
    .orderBy(asc(orderItems.id));
  const byOrder = new Map<number, OrderItem[]>();
  for (const item of itemRows) {
    const list = byOrder.get(item.orderId) ?? [];
    list.push(item);
    byOrder.set(item.orderId, list);
  }
  return orderRows.map((order) => ({ ...order, items: byOrder.get(order.id) ?? [] }));
}

export async function getTopCountries(limit = 6) {
  return db
    .select({
      countryCode: orders.countryCode,
      countryName: orders.countryName,
      orderCount: sql<number>`count(*)::int`,
      revenueCents: sql<number>`coalesce(sum(${orders.totalCents}), 0)::int`,
    })
    .from(orders)
    .where(ne(orders.status, "cancelled"))
    .groupBy(orders.countryCode, orders.countryName)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}
