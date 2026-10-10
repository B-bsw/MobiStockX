import type { UserRole } from "@/lib/auth-context";


export type AppRoute =
  | "/"
  | "/products"
  | "/products/add"
  | "/products/edit"
  | "/stock-in"
  | "/receive"
  | "/customers"
  | "/pos"
  | "/sales"
  | "/claims"
  | "/users";


export const ROLE_ROUTES: Record<UserRole, readonly AppRoute[]> = {
  ADMIN: [
    "/",
    "/products",
    "/products/add",
    "/products/edit",
    "/stock-in",
    "/receive",
    "/customers",
    "/pos",
    "/sales",
    "/claims",
    "/users",
  ],
  MANAGER: [
    "/",
    "/products",
    "/products/add",
    "/products/edit",
    "/stock-in",
    "/receive",
    "/customers",
    "/pos",
    "/sales",
    "/claims",
  ],
  CASHIER: [
    "/",
    "/products",
    "/stock-in",
    "/customers",
    "/pos",
    "/sales",
    "/claims",
  ],
  TECHNICIAN: ["/", "/products", "/stock-in", "/receive", "/claims"],
};

export const ROUTE_LABEL: Record<AppRoute, string> = {
  "/": "แดชบอร์ด",
  "/products": "สินค้า",
  "/products/add": "เพิ่มสินค้า",
  "/products/edit": "แก้ไขสินค้า",
  "/stock-in": "จัดการสต๊อก",
  "/receive": "รับสินค้าเข้า",
  "/customers": "ข้อมูลลูกค้า",
  "/pos": "ขายสินค้า / POS",
  "/sales": "ประวัติการขาย",
  "/claims": "เคลมสินค้า / ประกัน",
  "/users": "จัดการผู้ใช้",
};

export function canAccess(role: UserRole, route: AppRoute) {
  return ROLE_ROUTES[role].includes(route);
}


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

export function landingRoute(role: UserRole): AppRoute {
  return ROLE_ROUTES[role][0] ?? "/";
}
