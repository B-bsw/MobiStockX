"use client";

import { useState } from "react";
import { ReceiveHeader } from "@/components/receive/receive-header";
import { ReceiveForm } from "@/components/receive/receive-form";
import { ReceiveHistory } from "@/components/receive/receive-history";
import { initialReceiveHistory } from "@/datas/receive/data";

export default function Page() {
  const [history, setHistory] = useState(initialReceiveHistory);

  return (
    <div className="min-h-[calc(100dvh-48px)] overflow-hidden rounded-[20px] bg-[#F8F9FB]">
      <ReceiveHeader />
      <div className="space-y-5 p-5">
        <ReceiveForm onReceive={(records) => setHistory((current) => [...records, ...current])} />
        <ReceiveHistory records={history} />
      </div>
    </div>
  );
}
