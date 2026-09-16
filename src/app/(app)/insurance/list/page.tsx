"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  SquarePen,
  Mail,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { juiceFetch } from "@/lib/api";

export const dynamic = "force-dynamic";

type PaymentRow = {
  id: string;
  payeeName: string;
  amount: string;
  title: string;
  subtitle: string;
  status: string;
  datetime: string;
};

function formatDateTime(raw: unknown): string {
  if (!raw) return "";
  const s = String(raw).trim();
  if (!s) return "";
  if (/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}/.test(s)) return s;
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  return s;
}

function toPaymentRow(raw: Record<string, unknown>, index: number): PaymentRow {
  const id = String(raw.id ?? raw._id ?? raw.paymentId ?? raw.payment_id ?? raw.referenceNumber ?? raw.reference_number ?? `row-${index}`).trim();
  const payeeName = String(raw.payeeName ?? raw.payee_name ?? raw.payee ?? raw.name ?? raw.full_name ?? raw.payerName ?? "Unknown").trim() || "Unknown";
  const amountRaw = raw.amount ?? raw.totalAmount ?? raw.paymentAmount ?? 0;
  const amount = typeof amountRaw === "number" ? `$${amountRaw.toFixed(2)}` : String(amountRaw).trim().startsWith("$") ? String(amountRaw).trim() : `$${String(amountRaw).trim()}`;
  const title = String(raw.paymentTitle ?? raw.payment_title ?? raw.title ?? raw.name ?? raw.payeeName ?? "Payment").trim();
  const subtitle = String(raw.referenceNumber ?? raw.reference_number ?? raw.reference ?? raw.subtitle ?? raw.paymentId ?? raw.id ?? "").trim();
  const status = String(raw.status ?? raw.state ?? raw.paymentStatus ?? raw.action ?? "Draft").trim() || "Draft";
  const datetime = formatDateTime(raw.updatedAt ?? raw.updated_at ?? raw.lastUpdate ?? raw.last_update ?? raw.actionDate ?? raw.createdAt ?? raw.created_at ?? raw.date ?? raw.timestamp);
  return { id, payeeName, amount, title, subtitle, status, datetime };
}

function extractRows(json: unknown): Record<string, unknown>[] {
  if (!json || typeof json !== "object") return [];
  const j = json as Record<string, unknown>;
  if (Array.isArray(j)) return j as Record<string, unknown>[];
  const candidates: unknown[] = [
    j.data,
    (j.data as Record<string, unknown> | undefined)?.data,
    (j.data as Record<string, unknown> | undefined)?.payments,
    (j.data as Record<string, unknown> | undefined)?.insurance,
    (j.data as Record<string, unknown> | undefined)?.list,
    (j.data as Record<string, unknown> | undefined)?.rows,
    j.payments,
    j.insurance,
    j.list,
    j.rows,
    j.results,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c as Record<string, unknown>[];
    if (c && typeof c === "object" && Array.isArray((c as Record<string, unknown>).payments)) {
      return (c as Record<string, unknown>).payments as Record<string, unknown>[];
    }
  }
  if (Array.isArray(j.data)) return j.data as Record<string, unknown>[];
  return [];
}

const PENDING_DATA: PaymentRow[] = [
  { id: "1", payeeName: "konica arora", amount: "$0.01", title: "test claim", subtitle: "TESTING2", status: "Draft", datetime: "09/09/2026 14:41:02" },
  { id: "2", payeeName: "Reeta Joomdev", amount: "$0.01", title: "title", subtitle: "TESTTEST0191", status: "Draft", datetime: "09/07/2026 15:31:03" },
  { id: "3", payeeName: "Satya P Verma", amount: "$0.02", title: "Demo Redis Commented", subtitle: "EY T45678", status: "Wallet Accessed", datetime: "09/03/2026 23:33:10" },
  { id: "4", payeeName: "Satya P Verma", amount: "$0.02", title: "Demo001", subtitle: "DEMO789", status: "Pending Approval", datetime: "09/03/2026 16:31:31" },
  { id: "5", payeeName: "Satya P Verma", amount: "$0.02", title: "Demo", subtitle: "DEMO34567", status: "Pending Approval", datetime: "09/03/2026 16:28:09" },
  { id: "6", payeeName: "Satya P Verma", amount: "$0.02", title: "Payment Demo", subtitle: "DEMO456789", status: "Pending Approval", datetime: "09/03/2026 18:20:13" },
  { id: "7", payeeName: "Satya P Verma", amount: "$0.03", title: "Demo Pay2", subtitle: "DEM567890", status: "Pending Approval", datetime: "09/03/2026 15:44:08" },
  { id: "8", payeeName: "Satya P Verma", amount: "$0.03", title: "Demo", subtitle: "DEMO23456789", status: "Pending Approval", datetime: "09/03/2026 15:40:23" },
  { id: "9", payeeName: "Satya P Verma", amount: "$0.02", title: "Test Payment", subtitle: "FGHJ456789", status: "Pending Approval", datetime: "09/03/2026 15:36:42" },
  { id: "10", payeeName: "Satya P Verma", amount: "$0.50", title: "Demo Payment", subtitle: "4567890", status: "Link Opened", datetime: "09/03/2026 15:04:29" },
  { id: "11", payeeName: "Aarav Singh", amount: "$1.20", title: "Invoice 101", subtitle: "INV101", status: "Draft", datetime: "09/02/2026 10:11:12" },
  { id: "12", payeeName: "Neha Gupta", amount: "$0.75", title: "Claim A", subtitle: "CLAIM-A", status: "Pending Approval", datetime: "09/01/2026 09:05:22" },
];

const PROCESSED_DATA: PaymentRow[] = [
  { id: "p1", payeeName: "Biswajit Ghosh", amount: "$0.32", title: "CP-010", subtitle: "CP-010", status: "Approved", datetime: "09/14/2026 20:03:02" },
  { id: "p2", payeeName: "Biswajit Ghosh", amount: "$0.01", title: "CP-009", subtitle: "CP-009", status: "Approved", datetime: "09/14/2026 19:55:32" },
  { id: "p3", payeeName: "Finicity Expld", amount: "$0.10", title: "CP-008", subtitle: "CP-008", status: "Link Opened", datetime: "09/14/2026 19:32:12" },
  { id: "p4", payeeName: "Rahul Mehta", amount: "$0.45", title: "CP-007", subtitle: "CP-007", status: "Approved", datetime: "09/13/2026 18:12:01" },
  { id: "p5", payeeName: "Anjali Rao", amount: "$0.88", title: "CP-006", subtitle: "CP-006", status: "Wallet Accessed", datetime: "09/13/2026 17:40:10" },
  { id: "p6", payeeName: "Kunal Shah", amount: "$0.12", title: "CP-005", subtitle: "CP-005", status: "Approved", datetime: "09/12/2026 16:22:05" },
];

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  let cls = "bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]";
  if (normalized === "approved") cls = "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]";
  else if (normalized === "wallet accessed" || normalized === "pending approval" || normalized === "link opened" || normalized.includes("pending")) {
    cls = "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]";
  } else if (normalized === "draft") cls = "bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]";
  return (
    <span className={`inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold leading-none ${cls}`}>
      {status}
    </span>
  );
}

function PaymentTable({
  title,
  data,
  actionHeader,
  isLoading,
}: {
  title: string;
  data: PaymentRow[];
  actionHeader: string;
  isLoading?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ kind: "success" | "error"; msg: string } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (r) =>
        r.payeeName.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.amount.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [data, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paged = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);



  const handleResend = async (id: string) => {
    setSendingId(id);
    setBanner(null);
    try {
      const res = await juiceFetch(`/v1/insurance/${encodeURIComponent(id)}/resend-approval-email`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      const text = await res.text();
      let parsed: Record<string, unknown> | null = null;
      try {
        parsed = JSON.parse(text) as Record<string, unknown>;
      } catch {
        parsed = null;
      }
      const msg = (parsed?.message as string) || (parsed?.msg as string) || (parsed?.detail as string) || text;
      if (!res.ok) throw new Error(msg || `Failed to resend for ${id}`);
      setBanner({ kind: "success", msg: typeof msg === "string" && msg.trim() ? msg : `Approval email resent for ${id}` });
    } catch (e) {
      const m = e instanceof Error ? e.message : "Failed to resend approval email";
      setBanner({ kind: "error", msg: m });
    } finally {
      setSendingId(null);
      setTimeout(() => setBanner(null), 4000);
    }
  };

  return (
    <div className="bg-white rounded-[12px] border border-[#e9eef5] shadow-[0_2px_10px_rgba(16,23,41,0.04)] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-[#f1f5f9]">
        <div className="flex items-center gap-3">
          <span className="h-[18px] w-[9px] rounded-[4px] bg-[#0d7bff] inline-block shrink-0" />
          <h2 className="text-[13px] font-bold text-[#0f172a] tracking-tight">{title}</h2>
          <div className="relative hidden sm:flex items-center">
            <Search size={13} className="absolute left-2.5 text-[#94a3b8]" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search..."
              className="h-7 w-[190px] rounded-full bg-[#f1f5f9] border-[#e2e8f0] pl-7 pr-3 text-[12px] placeholder:text-[#94a3b8] focus-visible:ring-[#0d7bff]/20 focus-visible:border-[#0d7bff]"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative sm:hidden flex items-center">
            <Search size={13} className="absolute left-2.5 text-[#94a3b8]" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search..."
              className="h-7 w-[150px] rounded-full bg-[#f1f5f9] border-[#e2e8f0] pl-7 pr-3 text-[12px]"
            />
          </div>
      
   
   
        </div>
      </div>

      {banner && (
        <div className={`mx-4 mt-3 rounded-md border px-3 py-2 text-xs ${banner.kind === "success" ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]" : "border-[#fecaca] bg-[#fef2f2] text-[#dc2626]"}`}>
          {banner.msg}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[#e9eef5] text-left">
              <th className="px-3 py-2.5 text-[11px] font-semibold text-[#64748b] whitespace-nowrap">Payee Name</th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-[#64748b]">Amount</th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-[#64748b]">Payment Title</th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-[#64748b] text-center whitespace-nowrap">{actionHeader}</th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-[#64748b] text-right">Options</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" /> Loading {title.toLowerCase()}...
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {paged.map((row) => (
                  <tr key={row.id} className="border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc] transition-colors">
                    <td className="px-3 py-2 text-[12px] font-medium text-[#0f172a] whitespace-nowrap">{row.payeeName}</td>
                    <td className="px-3 py-2 text-[12px] text-[#0f172a] whitespace-nowrap">{row.amount}</td>
                    <td className="px-3 py-2">
                      <div className="text-[12px] font-semibold text-[#0f172a] leading-none">{row.title}</div>
                      <div className="text-[10px] text-[#64748b] mt-0.5">{row.subtitle}</div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <StatusPill status={row.status} />
                        <span className="text-[10px] text-[#94a3b8]">{row.datetime}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1.5 text-[#0d7bff]">
                        <button
                          onClick={() => router.push(`/insurance/add?payment=${encodeURIComponent(row.id)}`)}
                          className="grid h-6 w-6 place-items-center rounded hover:bg-[#eff6ff] transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={13} />
                        </button>
                        {row.status === "approved" && (
                          <button
                            onClick={() => handleResend(row.id)}
                            disabled={sendingId === row.id}
                            className="grid h-6 w-6 place-items-center rounded hover:bg-[#eff6ff] transition-colors disabled:opacity-50"
                            title="Resend approval email"
                          >
                            {sendingId === row.id ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      No payments found for &quot;{query}&quot;
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-white border-t border-[#f1f5f9]">
        <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="h-7 rounded-full border border-[#e2e8f0] bg-white px-2 pr-6 text-[11px] text-[#0f172a] focus:outline-none focus:border-[#0d7bff]"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 rounded-full border border-[#e2e8f0] bg-white px-2.5 py-1 text-[11px] text-[#64748b] disabled:opacity-40 hover:bg-[#f8fafc]"
          >
            <ChevronLeft size={12} /> Previous
          </button>
          {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
            const n = i + 1;
            if (totalPages > 5 && n === 4) {
              return (
                <span key="dots" className="px-1 text-[11px] text-[#94a3b8]">
                  ...
                </span>
              );
            }
            const pageNum = totalPages > 5 && n === 5 ? totalPages : n;
            const isActive = page === pageNum;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`h-6 w-6 rounded-full text-[11px] font-semibold ${isActive ? "bg-[#0d7bff] text-white" : "bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"}`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 rounded-full border border-[#e2e8f0] bg-white px-2.5 py-1 text-[11px] text-[#64748b] disabled:opacity-40 hover:bg-[#f8fafc]"
          >
            Next <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InsuranceListPage() {
  const [pendingData, setPendingData] = useState<PaymentRow[]>(PENDING_DATA);
  const [processedData, setProcessedData] = useState<PaymentRow[]>(PROCESSED_DATA);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingProcessed, setLoadingProcessed] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchList = async (
      status: string,
      setter: React.Dispatch<React.SetStateAction<PaymentRow[]>>,
      setLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      try {
        const res = await juiceFetch(`/v1/insurance?status=${encodeURIComponent(status)}`);
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        const rows = extractRows(json)
          .map((r, i) => toPaymentRow(r, i))
          .filter((r) => r.id && r.payeeName);
        if (!cancelled && rows.length) setter(rows);
      } catch {
        // keep mock fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchList("pending", setPendingData, setLoadingPending);
    void fetchList("approved", setProcessedData, setLoadingProcessed);

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="portal-content bg-[#f8fafc] min-h-full">
      <div className="mx-auto max-w-[1100px] space-y-6">
        <PaymentTable title="Pending Payments" data={pendingData} actionHeader="Status" isLoading={loadingPending} />
        <PaymentTable title="Processed Payments" data={processedData} actionHeader="Action / Last Update" isLoading={loadingProcessed} />
      </div>
    </div>
  );
}
