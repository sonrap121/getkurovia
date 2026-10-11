"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { categories, contactMessages, orders, products } from "@/db/schema";
import { ADMIN_COOKIE, createSessionToken, isAdminAuthenticated, passwordMatches } from "@/lib/admin-auth";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/shipping";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!passwordMatches(password)) {
    redirect("/admin/login?error=1");
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
    secure: process.env.ADMIN_COOKIE_SECURE === "true",
  });
  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function updateOrderAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("orderId"));
  const status = String(formData.get("status") ?? "");
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const carrier = String(formData.get("carrier") ?? "").trim();
  if (!Number.isInteger(id) || !ORDER_STATUSES.includes(status as OrderStatus)) return;

  await db
    .update(orders)
    .set({
      status,
      trackingNumber: trackingNumber || null,
      carrier: carrier || null,
      paymentStatus: status === "cancelled" ? "refunded" : "paid",
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id));

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("productId"));
  const stock = Number(formData.get("stock"));
  const price = Number(formData.get("price"));
  const compareAt = String(formData.get("compareAtPrice") ?? "").trim();
  const isActive = formData.get("isActive") === "on";
  const isFeatured = formData.get("isFeatured") === "on";
  if (!Number.isInteger(id)) return;

  await db
    .update(products)
    .set({
      stock: Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : undefined,
      priceCents: Number.isFinite(price) && price > 0 ? Math.round(price * 100) : undefined,
      compareAtPriceCents: compareAt === "" ? null : Number.isFinite(Number(compareAt)) ? Math.round(Number(compareAt) * 100) : undefined,
      isActive,
      isFeatured,
    })
    .where(eq(products.id, id));

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const categoryId = Number(formData.get("categoryId"));
  const price = Number(formData.get("price"));
  const compareAt = String(formData.get("compareAtPrice") ?? "").trim();
  const stock = Number(formData.get("stock"));
  const weight = Number(formData.get("weightGrams"));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const highlights = String(formData.get("highlights") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => slugify(tag))
    .filter(Boolean);

  if (name.length < 3 || !Number.isInteger(categoryId) || !Number.isFinite(price) || price <= 0 || !imageUrl) {
    redirect("/admin/products?error=invalid");
  }

  const [category] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, categoryId)).limit(1);
  if (!category) redirect("/admin/products?error=category");

  const baseSlug = slugify(name) || `product-${Date.now()}`;
  const existing = await db.select({ id: products.id }).from(products).where(eq(products.slug, baseSlug)).limit(1);
  const slug = existing.length ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;
  const sku = `KV-${Date.now().toString(36).toUpperCase()}`;

  await db.insert(products).values({
    name,
    slug,
    sku,
    brand: brand || null,
    categoryId,
    priceCents: Math.round(price * 100),
    compareAtPriceCents: compareAt && Number.isFinite(Number(compareAt)) ? Math.round(Number(compareAt) * 100) : null,
    stock: Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0,
    weightGrams: Number.isFinite(weight) && weight > 0 ? Math.floor(weight) : 500,
    imageUrl,
    gallery: [imageUrl],
    shortDescription: shortDescription || null,
    description: description || null,
    highlights,
    tags,
    rating: 5,
    reviewCount: 0,
    isFeatured: formData.get("isFeatured") === "on",
    isActive: true,
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/products?created=1");
}

export async function resolveMessageAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("messageId"));
  if (!Number.isInteger(id)) return;
  await db.update(contactMessages).set({ isResolved: true }).where(eq(contactMessages.id, id));
  revalidatePath("/admin/messages");
}
