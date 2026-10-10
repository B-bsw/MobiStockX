import type { UserRole } from "@/lib/auth-context";

/**
 * Every guarded destination in the app. The sidebar and the route guard both
 * read this list, so a menu item can never appear without its page being
 * reachable, and a page can never be reachable without appearing in the menu.
 */
export type AppRoute =
  | "/"
  | "/products"
  | "/products/add"
  | "/products/edit"
  | "/stock-in"
  | "/receive"
  | "/pos"
  | "/sales"
  | "/users";

/**
 * What each role may open. Read as job descriptions:
 * - ADMIN   ผู้ดูแลระบบ — everything, plus user administration.
 * - MANAGER ผู้จัดการ — all stock and sales work, but not user accounts.
 * - CASHIER พนักงานขาย — sells and looks things up; does not author products.
 * - TECHNICIAN ช่างเทคนิค — needs stock on hand, has no business in the till.
 *
 * This mirrors the server: /api/v1/users is ADMIN-only there too.
 */
export const ROLE_ROUTES: Record<UserRole, readonly AppRoute[]> = {
  ADMIN: [
    "/",
    "/products",
    "/products/add",
    "/products/edit",
    "/stock-in",
    "/receive",
    "/pos",
    "/sales",
    "/users",
  ],
  MANAGER: [
    "/",
    "/products",
    "/products/add",
    "/products/edit",
    "/stock-in",
    "/receive",
    "/pos",
    "/sales",
  ],
  CASHIER: ["/", "/products", "/stock-in", "/pos", "/sales"],
  TECHNICIAN: ["/", "/products", "/stock-in", "/receive"],
};

/** Human-readable names, used when explaining a role's reach to an admin. */
export const ROUTE_LABEL: Record<AppRoute, string> = {
  "/": "แดชบอร์ด",
  "/products": "สินค้า",
  "/products/add": "เพิ่มสินค้า",
  "/products/edit": "แก้ไขสินค้า",
  "/stock-in": "จัดการสต๊อก",
  "/receive": "รับสินค้าเข้า",
  "/pos": "ขายสินค้า / POS",
  "/sales": "ประวัติการขาย",
  "/users": "จัดการผู้ใช้",
};

export function canAccess(role: UserRole, route: AppRoute) {
  return ROLE_ROUTES[role].includes(route);
}

/**
 * Resolves a pathname to the route that owns it, longest prefix first so
 * /products/add is not mistaken for /products.
 */
export function routeForPath(pathname: string): AppRoute | null {
  const routes = Object.values(ROLE_ROUTES).flat() as AppRoute[];

  return (
    routes
      .filter(
        (route) =>
          pathname === route ||
          (route !== "/" && pathname.startsWith(route + "/")),
      )
      .sort((a, b) => b.length - a.length)[0] ?? null
  );
}

/** Where to send a role that landed somewhere it may not be. */
export function landingRoute(role: UserRole): AppRoute {
  return ROLE_ROUTES[role][0] ?? "/";
}
