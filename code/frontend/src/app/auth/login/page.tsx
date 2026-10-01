"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import logo from "@/../public/logo.png";
import { api, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !password) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        username: username.trim(),
        password,
      });

      setToken(response.data.data.token);
      router.replace("/");
    } catch (err: unknown) {
      const status =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;

      setError(
        status === 401
          ? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
          : status === 403
            ? "บัญชีนี้ถูกปิดการใช้งาน"
            : "เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-white">
      <div className="flex min-h-screen w-full">
        <section className="hidden w-1/2 items-center justify-center bg-[#78B8F2] md:flex">
          <div className=" flex flex-col items-center">
            <Image
              src={logo}
              alt="MobistockX"
              className="h-auto w-40 lg:w-52 xl:w-64"
            />
            <div className="flex flex-col items-center text-white">
              <div className="font-bold text-2xl">MobistockX</div>
              <div className="font-medium">
                ระบบจัดการคลังสินค้าโทรศัพท์มือถือ
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen w-full items-center justify-center  bg-white px-6 py-36 md:w-1/2 md:px-10 lg:px-16">
          <div className="relative w-full max-w-[320px]">
            <div className="absolute bottom-full left-1/2 mb-10 -translate-x-1/2 flex flex-col w-full items-center md:hidden">
              <div className="font-bold text-2xl">MobistockX</div>
              <div className="font-medium">
                ระบบจัดการคลังสินค้าโทรศัพท์มือถือ
              </div>
            </div>

            <form onSubmit={handleLogin} className="w-full">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                  ยินดีต้อนรับ
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  เข้าสู่ระบบจัดการร้านของคุณ
                </p>
              </div>

              <div className="mb-5">
                <label
                  htmlFor="login-username"
                  className="mb-2 block text-sm text-gray-700"
                >
                  ชื่อผู้ใช้
                </label>

                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="h-[40px] w-full rounded-full bg-[#eeeeee] px-5 text-sm text-black outline-none transition focus:ring-2 focus:ring-[#78B8F2]"
                />
              </div>

              <div className="mb-7">
                <label
                  htmlFor="login-password"
                  className="mb-2 block text-sm text-gray-700"
                >
                  รหัสผ่าน
                </label>

                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-[40px] w-full rounded-full bg-[#eeeeee] px-5 text-sm text-black outline-none transition focus:ring-2 focus:ring-[#78B8F2]"
                />
              </div>

              {error && (
                <p role="alert" className="mb-4 text-sm text-[#E53935]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="h-[40px] w-full rounded-full bg-[#78B8F2] text-sm font-medium text-white transition hover:bg-[#65acec] active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
