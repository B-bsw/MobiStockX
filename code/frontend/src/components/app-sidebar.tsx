"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Smartphone,
  PlusSquare,
  Package,
  ShoppingCart,
  PackagePlus,
  ReceiptText,
  LogOut,
  UserRound,
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

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Grouped so the seven destinations read as three decisions instead of one
 * undifferentiated list.
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
      { href: "/pos", label: "ขายสินค้า / POS", icon: ShoppingCart },
      { href: "/sales", label: "ประวัติการขาย", icon: ReceiptText },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { user, logout } = useAuth();

  // Longest matching prefix wins, so /products/add does not also light up /products.
  const activeHref = ALL_ITEMS.filter(
    ({ href }) =>
      pathname === href || (href !== "/" && pathname.startsWith(href + "/")),
  ).sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="relative gap-0 px-4 pb-4 pt-5">
        <Link
          href="/"
          onClick={() => setOpenMobile(false)}
          className="w-fit rounded-md text-lg font-semibold tracking-tight text-sidebar-foreground"
        >
          Mobistock
        </Link>
        <p className="text-sm text-sidebar-muted">ระบบจัดการคลังสินค้า</p>
        <button
          type="button"
          aria-label="ปิดเมนู"
          onClick={() => setOpenMobile(false)}
          className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-lg text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-2">
        <nav aria-label="เมนูหลัก">
          {NAV_GROUPS.map((group) => (
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

      <SidebarFooter className="gap-0 px-2 pb-4 pt-2">
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
