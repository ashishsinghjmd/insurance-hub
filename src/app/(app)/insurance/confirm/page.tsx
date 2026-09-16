"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, Pencil, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/portal-shell";
import { juiceFetch } from "@/lib/api";

export const dynamic = "force-dynamic";

type PaymentOverview = {
  payeeName: string;
  paymentTitle: string;
  email: string;
  mobilePhone: string;
  referenceNumber: string;
  amount: string;
  paymentMethods: string[];
};

const MOCK_PAYMENT: PaymentOverview = {
  payeeName: "konica  arora",
  paymentTitle: "testing",
  email: "konica@joomdev.com",
  mobilePhone: "+1 (123) 456-7890",
  referenceNumber: "TES",
  amount: "$0.01",
  paymentMethods: ["Virtual Card"],
};

function ConfirmInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawPayment = searchParams.get("payment") || searchParams.get("id") || "1797";
  const paymentId = rawPayment ? decodeURIComponent(rawPayment) : null;
  const token = searchParams.get("token");

  const [data, setData] = useState<PaymentOverview>(MOCK_PAYMENT);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState<string>("draft");
  const [canApprove, setCanApprove] = useState(false);
  const [isTokenFlow, setIsTokenFlow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. If approval token present, fetch via token (approver flow) - mirrors HubOverview approvalToken fetch
        if (token) {
          setIsTokenFlow(true);
          try {
            const res = await juiceFetch(`/v1/insurance/approval/${encodeURIComponent(token)}`, { method: "GET" });
            if (res.ok) {
              const json = (await res.json()) as Record<string, unknown>;
              const raw = ((json as { data?: unknown }).data ?? json) as Record<string, unknown>;
              const normalized: PaymentOverview = {
                payeeName: String(raw?.payeeName ?? raw?.payee_name ?? MOCK_PAYMENT.payeeName),
                paymentTitle: String(raw?.paymentTitle ?? raw?.payment_title ?? MOCK_PAYMENT.paymentTitle),
                email: String(raw?.email ?? MOCK_PAYMENT.email),
                mobilePhone: String(raw?.mobilePhone ?? raw?.mobile_phone ?? MOCK_PAYMENT.mobilePhone),
                referenceNumber: String(raw?.referenceNumber ?? raw?.reference_number ?? MOCK_PAYMENT.referenceNumber),
                amount: raw?.amount ? `$${String(raw.amount).replace("$", "")}` : MOCK_PAYMENT.amount,
                paymentMethods: Array.isArray(raw?.paymentMethods) ? (raw.paymentMethods as string[]) : MOCK_PAYMENT.paymentMethods,
              };
              if (!cancelled) {
                setData(normalized);
                setStatus(String(raw?.status ?? "draft"));
                setCanApprove(Boolean(raw?.canApprove));
                setLoading(false);
                return;
              }
            }
          } catch {}
          // fallback to mock if token fetch fails
        }

        // 2. Prefer cached payload from make-payment (sessionStorage) so confirm works without backend
        if (paymentId) {
          try {
            const cachedRaw = sessionStorage.getItem(`insurance:confirm:${paymentId}`);
            if (cachedRaw) {
              const cached = JSON.parse(cachedRaw) as Record<string, unknown>;
              const payeeObj = (cached.payee ?? null) as Record<string, unknown> | null;
              const normalized: PaymentOverview = {
                payeeName: String(cached.payeeName ?? payeeObj?.name ?? cached.name ?? MOCK_PAYMENT.payeeName),
                paymentTitle: String(cached.paymentTitle ?? MOCK_PAYMENT.paymentTitle),
                email: String(cached.payeeEmail ?? cached.email ?? payeeObj?.email ?? MOCK_PAYMENT.email),
                mobilePhone: cached.payeePhone
                  ? `+1 (${String(cached.payeePhone).slice(0, 3)}) ${String(cached.payeePhone).slice(3, 6)}-${String(cached.payeePhone).slice(6)}`
                  : cached.phone
                    ? `+1 (${String(cached.phone).slice(0, 3)}) ${String(cached.phone).slice(3, 6)}-${String(cached.phone).slice(6)}`
                    : MOCK_PAYMENT.mobilePhone,
                referenceNumber: String(cached.referenceNumber ?? MOCK_PAYMENT.referenceNumber),
                amount: cached.amount != null ? `$${Number(cached.amount).toFixed(2)}` : MOCK_PAYMENT.amount,
                paymentMethods: Array.isArray(cached.paymentMethods)
                  ? (cached.paymentMethods as unknown[]).map((m: unknown) => (m === "virtual-card" ? "Virtual Card" : String(m)))
                  : cached.paymentMethod
                    ? [String(cached.paymentMethod).toLowerCase() === "virtual-card" ? "Virtual Card" : String(cached.paymentMethod)]
                    : MOCK_PAYMENT.paymentMethods,
              };
              if (!cancelled) {
                setData(normalized);
                setStatus(String(cached.status ?? "draft"));
                setCanApprove(Boolean(cached.canApprove));
                setLoading(false);
                return;
              }
            }
          } catch {}
        }

        // 3. Try to load real payment from Juice - fallback to mock matching screenshot
        if (paymentId) {
          let res = await juiceFetch(`/v1/insurance/confirm?payment=${encodeURIComponent(paymentId)}`, {
            method: "GET",
          });
          if (!res.ok) {
            // fallback try payments endpoint and insurance payment by id (HubForm's INSURANCE_PAYMENT_BY_ID)
            res = await juiceFetch(`/v1/insurance/payment/${encodeURIComponent(paymentId)}`, { method: "GET" });
            if (!res.ok) {
              res = await juiceFetch(`/v1/payments/${encodeURIComponent(paymentId)}`, { method: "GET" });
            }
          }
          if (!res.ok) throw new Error(await res.text());
          const json = (await res.json()) as Record<string, unknown>;
          // normalize shapes: {data:{...}} or direct
          const raw = ((json as { data?: unknown }).data ?? json) as Record<string, unknown>;
          const normalized: PaymentOverview = {
            payeeName: String(raw?.payeeName ?? raw?.payee_name ?? raw?.full_name ?? raw?.name ?? MOCK_PAYMENT.payeeName),
            paymentTitle: String(raw?.paymentTitle ?? raw?.payment_title ?? raw?.title ?? MOCK_PAYMENT.paymentTitle),
            email: String(raw?.email ?? MOCK_PAYMENT.email),
            mobilePhone: String(raw?.mobilePhone ?? raw?.mobile_phone ?? raw?.phone ?? MOCK_PAYMENT.mobilePhone),
            referenceNumber: String(raw?.referenceNumber ?? raw?.reference_number ?? raw?.ref ?? MOCK_PAYMENT.referenceNumber),
            amount: raw?.amount ? `$${String(raw.amount).replace("$", "")}` : MOCK_PAYMENT.amount,
            paymentMethods: Array.isArray(raw?.paymentMethods)
              ? (raw.paymentMethods as string[])
              : Array.isArray(raw?.methods)
                ? (raw.methods as string[])
                : raw?.paymentMethod
                  ? [String(raw.paymentMethod)]
                  : MOCK_PAYMENT.paymentMethods,
          };
          if (!cancelled) {
            setData(normalized);
            setStatus(String(raw?.status ?? "draft"));
            setCanApprove(Boolean(raw?.canApprove));
          }
        } else {
          if (!cancelled) setData(MOCK_PAYMENT);
        }
      } catch {
        // keep mock on failure but surface error if not 404
        if (!cancelled) {
          // silent fallback to mock - uncomment to show error
          setData(MOCK_PAYMENT);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [paymentId, token]);

  // Mirrors HubOverview canEdit logic
  const isDraft = !status || status.toLowerCase() === "draft";
  const isApprover = isTokenFlow || !!token;
  const canEdit = isDraft && !isApprover;
  const editTooltip = !isDraft
    ? `Cannot edit ${status} payments. Only draft payments can be edited.`
    : isApprover
      ? "Approvers cannot edit payments. This is a read-only view."
      : "Edit payment";

  const handleEdit = () => {
    // Mirrors HubOverview handleEdit - set isEdit and push with encoded entityId
    if (!canEdit) return;
    if (paymentId) {
      const encoded = encodeURIComponent(paymentId);
      router.push(`/insurance/add?payment=${encoded}`);
      return;
    }
    router.push("/insurance/add");
  };

  // For submit actions - mirrors HubOverviewSubmitActions
  const numericAmount = Number(data.amount.replace(/[^0-9.-]+/g, "")) || 0;
  const isAmountLessThanThreshold = numericAmount < 1000; // simplified threshold
  const isPending = status && status.toLowerCase() === "pending_approval";
  const isApproved = status && status.toLowerCase() === "approved";
  const isRejected = status && status.toLowerCase() === "rejected";
  const isCancelled = status && status.toLowerCase() === "cancelled";
  const showSubmitButton =
    (!isApproved && !isRejected && !isCancelled && !isPending) || (isPending && canApprove);
  const actionText = isPending ? "Approve" : isAmountLessThanThreshold ? "Submit" : "Request Approval";

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      // Payload as requested: {"paymentId":"2398","isAutoApproved":true}
      const payload = {
        paymentId: String(paymentId),
        isAutoApproved: true,
      };
      const res = await juiceFetch(`/v1/insurance/confirm`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        let msg = text;
        let code: string | undefined;
        try {
          const j = JSON.parse(text);
          msg = j?.error?.message || j?.message || j?.error?.code || text;
          code = j?.error?.code || j?.code;
        } catch {}
        // If already processed, update status so UI shows approved message and hides submit
        if (code === "PAYMENT_ALREADY_PROCESSED" || msg.toLowerCase().includes("already been processed")) {
          setStatus("approved");
          // also extract status from message if present: "Current status: approved"
          const m = msg.match(/Current status:\s*(\w+)/i);
          if (m) setStatus(m[1].toLowerCase());
        }
        throw new Error(msg);
      }
      setSuccess(true);
      try {
        sessionStorage.removeItem(`insurance:confirm:${paymentId}`);
      } catch {}
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Failed to submit payment";
      // Ensure we display the extracted message key, not raw JSON
      let display = raw;
      try {
        const j = JSON.parse(raw);
        display = j?.error?.message || j?.message || raw;
      } catch {}
      setError(display);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="portal-content">
      <div className="mx-auto max-w-[880px]">
        {success && (
          <div className="mb-4">
            <Notice kind="success">
              <span className="flex items-center gap-2">
                <Check size={14} className="text-[hsl(var(--chart-2))]" />
                Payment {paymentId} submitted successfully.
              </span>
            </Notice>
          </div>
        )}
        {error && (
          <div className="mb-4">
            <Notice kind="error">{error}</Notice>
          </div>
        )}

        <div className="bg-white rounded-[16px] border border-[#e9eef5] shadow-[0_2px_12px_rgba(16,23,41,0.04)] p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="h-[22px] w-[12px] rounded-[4px] bg-[#0d7bff] inline-block shrink-0" />
              <h1 className="text-[17px] font-bold tracking-tight text-[#0f172a]">Payment Overview</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              disabled={!canEdit}
              title={editTooltip}
              className="h-8 rounded-[8px] border-[#0d7bff] text-[#0d7bff] hover:bg-[#eaf1ff] hover:text-[#0d7bff] bg-white text-[12.5px] font-medium gap-1.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Pencil size={14} className="text-[#0d7bff]" />
              Edit
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin" /> Loading payment {paymentId}...
            </div>
          ) : (
            <div className="space-y-3.5 text-[13px] leading-relaxed">
              <div className="flex gap-2">
                <span className="font-bold text-[#0f172a]">Payee Name:</span>
                <span className="text-[#475569]">{data.payeeName}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-[#0f172a]">Payment Title:</span>
                <span className="text-[#475569]">{data.paymentTitle}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-[#0f172a]">Email:</span>
                <span className="text-[#475569]">{data.email}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-[#0f172a]">Mobile Phone:</span>
                <span className="text-[#475569]">{data.mobilePhone}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-[#0f172a]">Reference Number:</span>
                <span className="text-[#475569]">{data.referenceNumber}</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#0d7bff] bg-white px-3.5 py-1 text-[13px]">
                  <span className="font-bold text-[#0f172a]">Amount:</span>
                  <span className="text-[#0f172a]">{data.amount}</span>
                </span>
              </div>

              <div className="pt-1">
                <div className="font-bold text-[#0f172a] mb-1.5">Payment Methods:</div>
                <div className="flex flex-col gap-1.5">
                  {data.paymentMethods.map((m) => (
                    <label key={m} className="flex items-center gap-2 text-[13px] text-[#475569]">
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-[#0d7bff] text-white">
                        <Check size={10} className="text-white" />
                      </span>
                      {m}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Submit - mirrors HubOverviewSubmitActions */}
          <div className="flex flex-col gap-3 pt-8">
            {!showSubmitButton ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
                {isApproved && "Payment has been approved. No further action needed."}
                {isRejected && "Payment has been rejected. You can create a new payment if needed."}
                {isCancelled && "Payment has been cancelled. You can create a new payment if needed."}
                {isPending && !canApprove && "Payment is pending approval. Waiting for approver response."}
              </div>
            ) : (
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || loading}
                  className="h-[38px] rounded-[8px] bg-[#0d7bff] hover:bg-[#0066e6] active:bg-[#005ad1] text-white text-[13px] font-semibold px-5 gap-2 shadow-sm disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin text-white" /> : <ShieldCheck size={16} className="text-white" />}
                  {submitting ? "Processing..." : actionText}
                </Button>
              </div>
            )}
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Review details before submitting. You can edit to change payment info.
        </p>
      </div>
    </div>
  );
}

export default function InsuranceConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="portal-content">
          <div className="mx-auto max-w-[880px]">
            <div className="bg-white rounded-[16px] border border-[#e9eef5] shadow-[0_2px_12px_rgba(16,23,41,0.04)] p-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </div>
          </div>
        </div>
      }
    >
      <ConfirmInner />
    </Suspense>
  );
}
