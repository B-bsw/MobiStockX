export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-white">
      <div className="flex min-h-screen w-full">
        <section className="hidden w-1/2 items-center justify-center bg-[#78B8F2] md:flex">
          <div className="flex h-[92px] w-[92px] items-center justify-center rounded-[18px] bg-white/90">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[14px] bg-[#6AAEF0]">
              <span className="text-4xl text-white">Logo</span>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen w-full items-center justify-center bg-white px-6 md:w-1/2 md:px-10 lg:px-16">
          <div className="w-full max-w-[320px]">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                ยินดีต้อนรับ
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                เข้าสู่ระบบจัดการร้านของคุณ
              </p>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm text-gray-700">
                อีเมล
              </label>

              <input
                type="email"
                className="h-[40px] w-full rounded-full bg-[#eeeeee] px-5 text-sm outline-none transition focus:ring-2 focus:ring-[#78B8F2]"
              />
            </div>

            <div className="mb-7">
              <label className="mb-2 block text-sm text-gray-700">
                รหัสผ่าน
              </label>

              <input
                type="password"
                className="h-[40px] w-full rounded-full bg-[#eeeeee] px-5 text-sm outline-none transition focus:ring-2 focus:ring-[#78B8F2]"
              />
            </div>

            <button
              type="button"
              className="h-[40px] w-full rounded-full bg-[#78B8F2] text-sm font-medium text-white transition hover:bg-[#65acec] active:scale-[0.98]"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
