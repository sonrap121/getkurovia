import type { SerializedOrder } from "@/components/order-summary";
import type { OrderWithItems } from "@/lib/data";

export function serializeOrder(order: OrderWithItems): SerializedOrder {
  return {
    orderNumber: order.orderNumber,
    email: order.email,
    fullName: order.fullName,
    phone: order.phone,
    addressLine1: order.addressLine1,
    addressLine2: order.addressLine2,
    city: order.city,
    state: order.state,
    postalCode: order.postalCode,
    countryCode: order.countryCode,
    countryName: order.countryName,
    shippingMethod: order.shippingMethod,
    carrier: order.carrier,
    etaMinDays: order.etaMinDays,
    etaMaxDays: order.etaMaxDays,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    totalCents: order.totalCents,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    cardLast4: order.cardLast4,
    trackingNumber: order.trackingNumber,
    customerNotes: order.customerNotes,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      productSlug: item.productSlug,
      productImage: item.productImage,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
      lineTotalCents: item.lineTotalCents,
    })),
  };
}
