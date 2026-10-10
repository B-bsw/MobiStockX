"use client";

import { useEffect, useState } from "react";
import { Plus, SearchX, Wrench } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ClaimDialog } from "@/components/claims/claim-dialog";
import { ClaimStatusDialog } from "@/components/claims/claim-status-dialog";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardField,
  CardFields,
  DataTable,
  type Column,
} from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { SearchInput } from "@/components/ui/search-input";
import {
  CLAIM_STATUS_LABEL,
  CLAIM_STATUS_TONE,
  CLAIM_TRANSITIONS,
  type ClaimRecord,
  type ClaimStatus,
} from "@/types/claims/types";

export default function Page() {
  const { user } = useAuth();

  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<ClaimRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/claims", { params: { size: 200 } });
        setClaims(response.data.data.content ?? []);
      } catch {
        setError("ไม่สามารถโหลดรายการเคลมได้");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  async function createClaim(values: { imei: string; symptom: string }) {
    if (!user) return;

    setSaving(true);
    setSaveError("");

    try {
      const response = await api.post("/claims", {
        imei: values.imei,
        symptom: values.symptom,
        createdByUserId: user.userId,
      });
      const created: ClaimRecord = response.data.data;

      setClaims((current) => [created, ...current]);
      setNotice(`บันทึกการเคลม ${created.claimCode} แล้ว`);
      setCreateOpen(false);
    } catch (caught) {
      const detail = (caught as { response?: { data?: { message?: string } } })
        .response?.data?.message;
      setSaveError(detail ?? "บันทึกการเคลมไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(values: {
    claimStatus: ClaimStatus;
    resolution: string;
  }) {
    if (!statusTarget) return;

    setSaving(true);
    setSaveError("");

    try {
      const response = await api.patch(
        `/claims/${statusTarget.claimId}/status`,
        {
          claimStatus: values.claimStatus,
          resolution: values.resolution || null,
        },
      );
      const updated: ClaimRecord = response.data.data;

      setClaims((current) =>
        current.map((claim) =>
          claim.claimId === updated.claimId ? updated : claim,
        ),
      );
      setNotice(
        `${updated.claimCode} เปลี่ยนเป็น ${CLAIM_STATUS_LABEL[updated.claimStatus]}`,
      );
      setStatusTarget(null);
    } catch (caught) {
      const detail = (caught as { response?: { data?: { message?: string } } })
        .response?.data?.message;
      setSaveError(detail ?? "อัปเดตสถานะไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  const keyword = search.trim().toLowerCase();
  const filtered = claims.filter((claim) =>
    [
      claim.claimCode,
      claim.itemImei,
      claim.modelName ?? "",
      claim.customerName ?? "",
      CLAIM_STATUS_LABEL[claim.claimStatus],
    ].some((value) => value.toLowerCase().includes(keyword)),
  );

  const openCount = claims.filter((claim) =>
    ["OPEN", "UNDER_REPAIR"].includes(claim.claimStatus),
  ).length;

  const actions = (claim: ClaimRecord, className?: string) => {
    if (CLAIM_TRANSITIONS[claim.claimStatus].length === 0) {
      return null;
    }

    return (
      <div className={className}>
        <div className="flex items-center justify-end">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setSaveError("");
              setStatusTarget(claim);
            }}
          >
            อัปเดตสถานะ
          </Button>
        </div>
      </div>
    );
  };

  const columns: Column<ClaimRecord>[] = [
    {
      id: "claimCode",
      header: "เลขที่เคลม",
      cell: (claim) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground">{claim.claimCode}</p>
          <p className="text-xs tabular-nums text-muted-foreground">
            {claim.claimDate}
          </p>
        </div>
      ),
    },
    {
      id: "device",
      header: "เครื่อง / IMEI",
      cell: (claim) => (
        <div className="min-w-0">
          <p className="truncate text-foreground">{claim.modelName || "—"}</p>
          <p className="truncate text-xs tabular-nums text-muted-foreground">
            {claim.itemImei}
          </p>
        </div>
      ),
    },
    {
      id: "customer",
      header: "ลูกค้า",
      className: "hidden lg:table-cell",
      cell: (claim) => (
        <span className="text-muted-foreground">
          {claim.customerName || "ลูกค้าทั่วไป"}
        </span>
      ),
    },
    {
      id: "symptom",
      header: "อาการเสีย",
      className: "hidden xl:table-cell",
      cell: (claim) => (
        <span className="line-clamp-2 text-muted-foreground">
          {claim.symptom}
        </span>
      ),
    },
    {
      id: "status",
      header: "สถานะ",
      cell: (claim) => (
        <Badge tone={CLAIM_STATUS_TONE[claim.claimStatus]}>
          {CLAIM_STATUS_LABEL[claim.claimStatus]}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">การจัดการ</span>,
      align: "end",
      cell: (claim) => actions(claim),
    },
  ];

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title="เคลมสินค้า / ประกัน"
        description={`การเคลมทั้งหมด ${claims.length} รายการ · ค้างดำเนินการ ${openCount} รายการ`}
        actions={
          <Button size="touch" onClick={() => {
            setSaveError("");
            setCreateOpen(true);
          }}>
            <Plus aria-hidden="true" />
            แจ้งเคลม
          </Button>
        }
      />

      {notice !== "" ? (
        <div className="px-4 pt-4 sm:px-6">
          <Alert tone="success" live="status">
            {notice}
          </Alert>
        </div>
      ) : null}

      {error !== "" && claims.length > 0 ? (
        <div className="px-4 pt-4 sm:px-6">
          <Alert tone="danger">{error}</Alert>
        </div>
      ) : null}

      <div className="border-b px-4 py-3 sm:px-6">
        <SearchInput
          label="ค้นหาการเคลม"
          placeholder="ค้นหาเลขที่เคลม IMEI รุ่น หรือชื่อลูกค้า"
          value={search}
          onValueChange={setSearch}
          className="sm:max-w-sm"
        />
      </div>

      <DataTable
        caption="รายการเคลมสินค้าพร้อมสถานะการซ่อมและข้อมูลประกัน"
        columns={columns}
        rows={filtered}
        rowKey={(claim) => claim.claimId}
        loading={loading}
        error={claims.length === 0 ? error : ""}
        minWidthClass="min-w-[60rem]"
        maxHeightClass="max-h-144"
        mobileCard={(claim) => (
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {claim.claimCode}
                </p>
                <p className="truncate text-xs tabular-nums text-muted-foreground">
                  {claim.itemImei}
                </p>
              </div>
              <Badge tone={CLAIM_STATUS_TONE[claim.claimStatus]}>
                {CLAIM_STATUS_LABEL[claim.claimStatus]}
              </Badge>
            </div>
            <CardFields>
              <CardField label="รุ่น">{claim.modelName || "—"}</CardField>
              <CardField label="ลูกค้า">
                {claim.customerName || "ลูกค้าทั่วไป"}
              </CardField>
              <CardField label="อาการเสีย">{claim.symptom}</CardField>
              <CardField label="ประกันหมดอายุ">
                {claim.warrantyExpireDate}
              </CardField>
            </CardFields>
            {actions(claim, "mt-3")}
          </div>
        )}
        empty={
          keyword !== "" ? (
            <EmptyState
              icon={SearchX}
              title="ไม่พบการเคลมที่ค้นหา"
              description={`ไม่มีรายการที่ตรงกับ "${search.trim()}" ลองพิมพ์สั้นลงหรือล้างคำค้นหา`}
            />
          ) : (
            <EmptyState
              icon={Wrench}
              title="ยังไม่มีรายการเคลม"
              description="กดแจ้งเคลมเพื่อตรวจสอบสิทธิ์ประกันจาก IMEI แล้วเปิดเรื่องซ่อม"
            />
          )
        }
      />

      <ClaimDialog
        open={createOpen}
        saving={saving}
        error={saveError}
        onOpenChange={setCreateOpen}
        onSave={createClaim}
      />

      <ClaimStatusDialog
        open={statusTarget !== null}
        claim={statusTarget}
        saving={saving}
        error={saveError}
        onOpenChange={(open) => {
          if (!open) setStatusTarget(null);
        }}
        onSave={updateStatus}
      />
    </Panel>
  );
}
