"use client";

import { PanelHeader } from "@/components/ui/panel";
import { Segmented } from "@/components/ui/segmented";
import type { PosTab } from "@/types/pos/types";

const TABS: readonly { value: PosTab; label: string }[] = [
  { value: "sale", label: "หน้าขาย" },
  { value: "history", label: "ประวัติการขาย" },
];

interface PosHeaderProps {
  activeTab: PosTab;
  onTabChange: (tab: PosTab) => void;
}

export function PosHeader({ activeTab, onTabChange }: PosHeaderProps) {
  return (
    <PanelHeader
      title="ขายสินค้า / POS"
      description="บันทึกการขายและดูประวัติการขาย"
      actions={
        <Segmented
          label="สลับมุมมองการขาย"
          options={TABS}
          value={activeTab}
          onValueChange={onTabChange}
          className="rounded-full border border-border bg-card px-1"
        />
      }
    />
  );
}
