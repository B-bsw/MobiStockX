import Link from "next/link"
import {
  LayoutDashboard,
  Smartphone,
  PlusSquare,
  Package,
  ShoppingCart,
  PackagePlus,
  LogOut,
} from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="hidden w-[320px] shrink-0 flex-col bg-[#78B8F2] px-5 py-8 md:flex">
        <div className="mb-12 text-center">
          <h1 className="text-[24px] font-semibold text-white">
            Mobistock
          </h1>

          <p className="text-[15px] text-white/80">
            ระบบจัดการคลังสินค้า
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link
            href="/"
            className="flex h-[60px] items-center gap-5 rounded-[25px] bg-white/25 px-7 text-white"
          >
            <LayoutDashboard size={26} />
            <span className="text-[20px]">แดชบอร์ด</span>
          </Link>

          <Link
            href="/products"
            className="flex h-[60px] items-center gap-5 rounded-[25px] px-7 text-white transition hover:bg-white/15"
          >
            <Smartphone size={26} />
            <span className="text-[20px]">สินค้า</span>
          </Link>

          <Link
            href="/products/add"
            className="flex h-[60px] items-center gap-5 rounded-[25px] px-7 text-white transition hover:bg-white/15"
          >
            <PlusSquare size={26} />
            <span className="text-[20px]">เพิ่มสินค้า</span>
          </Link>

          <Link
            href="/stock"
            className="flex h-[60px] items-center gap-5 rounded-[25px] px-7 text-white transition hover:bg-white/15"
          >
            <Package size={26} />
            <span className="text-[20px]">จัดการสต๊อก</span>
          </Link>

          <Link
            href="/pos"
            className="flex h-[60px] items-center gap-5 rounded-[25px] px-7 text-white transition hover:bg-white/15"
          >
            <ShoppingCart size={26} />
            <span className="text-[20px]">ขายสินค้า/POS</span>
          </Link>

          <Link
            href="/receive"
            className="flex h-[60px] items-center gap-5 rounded-[25px] px-7 text-white transition hover:bg-white/15"
          >
            <PackagePlus size={26} />
            <span className="text-[20px]">รับสินค้าเข้า</span>
          </Link>
        </nav>

        <div className="border-t border-white/30 pt-7">
          <div className="mb-6 flex items-center gap-5 px-2">
            <div className="h-[60px] w-[60px] shrink-0 rounded-full bg-white/25" />

            <div>
              <p className="text-[19px] text-white">
                Piyada ketmala
              </p>

              <p className="text-[14px] text-white/80">
                ผู้ดูแลระบบ
              </p>
            </div>
          </div>

          <Link
            href="/auth/login"
            className="flex h-[58px] w-full items-center gap-5 rounded-[25px] bg-white/25 px-7 text-white transition hover:bg-white/35"
          >
            <LogOut size={26} />
            <span className="text-[20px]">ออกจากระบบ</span>
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  )
}
