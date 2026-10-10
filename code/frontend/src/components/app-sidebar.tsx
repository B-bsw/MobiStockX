"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Contact,
  LayoutDashboard,
  Smartphone,
  PlusSquare,
  Package,
  ShoppingCart,
  PackagePlus,
  ReceiptText,
  LogOut,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ROLE_LABEL, useAuth } from "@/lib/auth-context";
import { ROLE_ROUTES, type AppRoute } from "@/lib/permissions";
import Image from "next/image";
import logo from "@/../public/logo.png";

interface NavItem {
  href: AppRoute;
  label: string;
  icon: LucideIcon;
}

/**
 * Grouped so the destinations read as a few decisions instead of one
 * undifferentiated list. What each role actually sees is filtered from
 * ROLE_ROUTES below, so this stays the full catalogue.
 */
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "ภาพรวม",
    items: [{ href: "/", label: "แดชบอร์ด", icon: LayoutDashboard }],
  },
  {
    label: "สินค้าและสต๊อก",
    items: [
      { href: "/products", label: "สินค้า", icon: Smartphone },
      { href: "/products/add", label: "เพิ่มสินค้า", icon: PlusSquare },
      { href: "/stock-in", label: "จัดการสต๊อก", icon: Package },
      { href: "/receive", label: "รับสินค้าเข้า", icon: PackagePlus },
    ],
  },
  {
    label: "การขาย",
    items: [
      { href: "/customers", label: "ข้อมูลลูกค้า", icon: Contact },
      { href: "/pos", label: "ขายสินค้า / POS", icon: ShoppingCart },
      { href: "/sales", label: "ประวัติการขาย", icon: ReceiptText },
    ],
  },
  {
    label: "ผู้ใช้งาน",
    items: [{ href: "/users", label: "จัดการผู้ใช้", icon: Users }],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { user, logout } = useAuth();

  // Only the destinations this role may open. A group with nothing left in it
  // drops out entirely rather than leaving an orphan heading.
  const allowed = user ? ROLE_ROUTES[user.role] : [];
  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => allowed.includes(item.href)),
  })).filter((group) => group.items.length > 0);

  const visibleItems = groups.flatMap((group) => group.items);

  // Longest matching prefix wins, so /products/add does not also light up /products.
  const activeHref = visibleItems.filter(
    ({ href }) =>
      pathname === href || (href !== "/" && pathname.startsWith(href + "/")),
  ).sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="relative gap-0 px-4 pb-4 pt-5">
        <div className="flex items-center gap-4">
          <Image src={logo} alt="logo" width={60} height={60} />
          <div>
            <Link
              href="/"
              onClick={() => setOpenMobile(false)}
              className="w-fit rounded-md text-lg font-semibold tracking-tight text-sidebar-foreground"
            >
              Mobistock
            </Link>
            <p className="text-sm text-sidebar-muted">ระบบจัดการคลังสินค้า</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="ปิดเมนู"
          onClick={() => setOpenMobile(false)}
          className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-lg text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-6">
        <nav aria-label="เมนูหลัก">
          {groups.map((group) => (
            <SidebarGroup key={group.label} className="px-0 py-1.5">
              <SidebarGroupLabel className="px-3 text-xs font-medium text-sidebar-muted">
                {group.label}
              </SidebarGroupLabel>
              <SidebarMenu className="gap-0.5">
                {group.items.map(({ href, label, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeHref === href}
                      // Active and hover colors come from the sidebar theme.
                      className="h-11 gap-3 rounded-lg px-3 text-sm data-active:bg-sidebar-primary data-active:font-semibold data-active:text-sidebar-primary-foreground [&_svg]:size-4.5"
                    >
                      <Link
                        href={href}
                        aria-current={activeHref === href ? "page" : undefined}
                        onClick={() => setOpenMobile(false)}
                      >
                        <Icon aria-hidden="true" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>

      <SidebarFooter className="gap-0 px-4 pb-4 pt-2">
        <div className="mb-2 flex items-center gap-3 border-t border-sidebar-border px-3 pt-4">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground"
          >
            <UserRound size={18} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.fullName ?? "ยังไม่เข้าสู่ระบบ"}
            </p>
            <p className="truncate text-xs text-sidebar-muted">
              {user ? ROLE_LABEL[user.role] : "—"}
            </p>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-11 gap-3 rounded-lg px-3 text-sm [&_svg]:size-4.5"
              onClick={() => {
                setOpenMobile(false);
                logout();
              }}
            >
              <LogOut aria-hidden="true" />
              <span>ออกจากระบบ</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
