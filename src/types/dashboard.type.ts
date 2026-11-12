import type { PaymentMethod } from "./order.type";

export type DashboardPeriod = "today" | "7d" | "30d" | "month";

type Kpi = { value: number; change: number | null }; // change = % vs periode sebelumnya, null = sebelumnya 0

// GET /admin/dashboard/sales
export type DashboardSales = {
  range: { start: string; end: string; period: DashboardPeriod | "custom" };
  kpis: { revenue: Kpi; paidOrders: Kpi; averageOrderValue: Kpi; newBuyers: Kpi };
  series: { granularity: "hour" | "day"; points: { label: string; revenue: number; orders: number }[] };
  composition: { ready: number; custom: number; addons: number; shipping: number };
  topProducts: { name: string; slug: string | null; units: number; revenue: number }[];
  topCategories: { name: string; units: number; revenue: number }[];
  paymentMethods: { method: PaymentMethod | "UNKNOWN"; orders: number; revenue: number }[];
};

export type DashboardActivity = {
  kind: "order_placed" | "payment_received" | "order_expired" | "refund_needed" | "custom_message" | "catalog_change";
  createdAt: string;
  actorName: string;
  orderCode?: string;
  amount?: number;
  requestCode?: string;
  entity?: string;
  action?: string;
};

// GET /admin/dashboard
export type DashboardOverview = {
  actions: {
    manualVerification: number;
    toProcess: { count: number; oldest: { code: string; paidAt: string } | null };
    needTracking: number;
    customAwaitingReply: { count: number; overdue: number };
    customNearDeadline: number;
    refunds: number;
  };
  stock: {
    lowStockVariants: { variantId: string; label: string; stock: number; productName: string; productId: string }[];
    lowStockAddons: { id: string; name: string; stock: number }[];
    outOfStock: { id: string; name: string }[];
  };
  promo: {
    name: string;
    quota: number;
    used: number;
    reserved: number;
    remaining: number;
    redemptions: { status: "USED" | "RESERVED"; name: string; email: string; orderCode: string }[];
  } | null;
  activity: DashboardActivity[];
};
