export type Role = "customer" | "admin";

export type OrderStatus =
  | "pending"
  | "approved"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Category {
  _id: string;
  name: string;
  image: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Food {
  _id: string;
  name: string;
  description: string;
  price: number;
  /** Populated to `{ _id, name }` by the list/detail endpoints. */
  category: Category | { _id: string; name: string } | string | null;
  /** The kitchen cooks to order — a dish is simply on the menu today, or off. */
  available: boolean;
  image: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  _id: string;
  quantity: number;
  /** Populated with a subset of Food fields by the cart endpoints. */
  food: Pick<Food, "_id" | "name" | "price" | "available" | "image"> | null;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

export interface OrderItem {
  food: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  user: string | Pick<User, "name" | "email"> | null;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
}

/** Resolves the category name whether it arrives populated or as a raw id. */
export function categoryName(category: Food["category"]): string {
  if (!category) return "Uncategorised";
  if (typeof category === "string") return "Uncategorised";
  return category.name ?? "Uncategorised";
}

export function categoryId(category: Food["category"]): string | null {
  if (!category) return null;
  if (typeof category === "string") return category;
  return category._id ?? null;
}

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "approved",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Tailwind classes per status — shared by the customer and admin views. */
export const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-sky-50 text-sky-700 ring-sky-200",
  preparing: "bg-carrot-50 text-carrot-700 ring-carrot-200",
  ready: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  completed: "bg-ink-100 text-ink-700 ring-ink-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

/** Ordered journey shown as a progress rail on the customer's order card. */
export const STATUS_FLOW: OrderStatus[] = [
  "pending",
  "approved",
  "preparing",
  "ready",
  "completed",
];
