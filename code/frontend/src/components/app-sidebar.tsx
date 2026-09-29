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
  X,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ROLE_LABEL, useAuth } from "@/lib/auth-context";

const navigation = [
  { href: "/", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/products", label: "สินค้า", icon: Smartphone },
  { href: "/products/add", label: "เพิ่มสินค้า", icon: PlusSquare },
  { href: "/stock-in", label: "จัดการสต๊อก", icon: Package },
  { href: "/pos", label: "ขายสินค้า/POS", icon: ShoppingCart },
  { href: "/receive", label: "รับสินค้าเข้า", icon: PackagePlus },
  { href: "/sales", label: "ประวัติการขาย", icon: ReceiptText },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { user, logout } = useAuth();
  const activeHref = navigation
    .filter(
      ({ href }) =>
        pathname === href || (href !== "/" && pathname.startsWith(href + "/")),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <Sidebar collapsible="offcanvas" className="border-none">
      <SidebarHeader className="relative px-5 pb-10 pt-8 text-center">
        <Link
          href="/"
          onClick={() => setOpenMobile(false)}
          className="text-[24px] font-semibold"
        >
          Mobistock
        </Link>
        <p className="text-[15px] text-white/80">ระบบจัดการคลังสินค้า</p>
        <button
          type="button"
          aria-label="ปิดเมนู"
          onClick={() => setOpenMobile(false)}
          className="absolute right-2 top-2 rounded-md p-2 hover:bg-white/15 md:hidden"
        >
          <X size={20} />
        </button>
      </SidebarHeader>
      <SidebarContent className="px-5">
        <nav aria-label="เมนูหลัก">
          <SidebarMenu className="gap-2">
            {navigation.map(({ href, label, icon: Icon }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  isActive={activeHref === href}
                  className="h-15 gap-5 rounded-[25px] px-7 text-[20px] [&_svg]:size-[26px]"
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
        </nav>
      </SidebarContent>
      <SidebarFooter className="px-5 pb-8 pt-5">
        <div className="border-t border-white/30 pt-7">
          <div className="mb-6 flex items-center gap-5 px-2">
            <div
              className="size-15 shrink-0 rounded-full bg-white/25"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="truncate text-[19px]">
                {user?.fullName ?? "ยังไม่เข้าสู่ระบบ"}
              </p>
              <p className="text-[14px] text-white/80">
                {user ? ROLE_LABEL[user.role] : "-"}
              </p>
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="h-14.5 gap-5 rounded-[25px] bg-white/25 px-7 text-[20px] hover:bg-white/35 [&_svg]:size-[26px]"
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
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
