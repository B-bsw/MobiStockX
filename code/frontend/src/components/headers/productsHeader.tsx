import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PanelHeader } from "@/components/ui/panel";
import { formatMoney } from "@/lib/format";

interface ProductsHeaderProps {
  totalProducts: number;
  onAdd?: () => void;
}

export function ProductsHeader({ totalProducts, onAdd }: ProductsHeaderProps) {
  return (
    <PanelHeader
      title="สินค้า"
      description={`มีสินค้าทั้งหมด ${formatMoney(totalProducts)} รายการ`}
      actions={
        <Button size="touch" onClick={onAdd} className="w-full sm:w-auto">
          <Plus aria-hidden="true" />
          เพิ่มสินค้า
        </Button>
      }
    />
  );
}
