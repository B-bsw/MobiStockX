//โยย่า

"use client";

import { useState } from "react";

export default function Page() {

  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");

    return (
      
    <div className="min-h-screen bg-[#dae8ff] p-6">

      <div className="min-h-[calc(100vh-64px)] rounded-[20px] bg-white shadow-md">
        
        <div className="flex items-center justify-between border-b border-[#EBEBEB] px-10 py-5">

          <div>
            <h1 className="text-[24px] font-medium text-gray-900">
              สินค้า
            </h1>
            <p className="text-[14px] text-gray-600">
              มีสินค้าทั้งหมด 8 รายการ
            </p>
          </div>
          
          <button className="rounded-full bg-[#7FBFFF] px-7 py-2 text-[20px] text-white">
            + เพิ่มสินค้า
          </button>

        </div>

        <div className="flex items-center gap-5 px-10 py-4">

          <div className="flex h-[45px] flex-1 items-center rounded-full border border-[#EBEBEB] px-6">
            <span className="text-[20px] text-gray-500">
              🔍
            </span>

            <input
              type="text"
              placeholder="ค้นหาสินค้า"
              className="ml-4 flex-1 bg-transparent text-[16px] outline-none placeholder:text-gray-300"
            />
          </div>

          <div className="flex h-[45px] items-center rounded-full border border-[#E5E7EB] px-2">

            <button
              onClick={() => setActiveCategory("ทั้งหมด")}
              className={`rounded-full px-8 py-1 text-[18px] transition-all duration-300 ${
              activeCategory === "ทั้งหมด"
              ? "bg-[#78B8F2] text-white"
              : "text-gray-500 hover:bg-gray-100"
              }`}
            >
                ทั้งหมด
            </button>

            <button
              onClick={() => setActiveCategory("Flagship")}
              className={`rounded-full px-8 py-1 text-[18px] transition-all duration-300 ${
              activeCategory === "Flagship"
              ? "bg-[#78B8F2] text-white"
              : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              Flagship
            </button>

            <button
              onClick={() => setActiveCategory("Mid-Range")}
              className={`rounded-full px-8 py-1 text-[18px] transition-all duration-300 ${
              activeCategory === "Mid-Range"
              ? "bg-[#78B8F2] text-white"
              : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              Mid-Range
            </button>

          <button
              onClick={() => setActiveCategory("Budget")}
              className={`rounded-full px-8 py-1 text-[18px] transition-all duration-300 ${
              activeCategory === "Budget"
              ? "bg-[#78B8F2] text-white"
              : "text-gray-500 hover:bg-gray-100"
              }`}
              >
                Budget
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
