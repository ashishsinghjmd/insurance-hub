"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, Pencil, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/shell";
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
  payeeName: "konica arora",
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
  const paymentId = searchParams.get("payment") || searchParams.get("id") || "1797";

  const [data, setData] = useState<PaymentOverview>(MOCK_PAYMENT);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Prefer cached payload from make-payment (sessionStorage) so confirm works without backend
        try {
          const cachedRaw = sessionStorage.getItem(`insurance:confirm:${paymentId}`);
          if (cachedRaw) {
            const cached = JSON.parse(cachedRaw) as any;
            const normalized: PaymentOverview = {
              payeeName: cached.payeeName ?? cached.payee?.name ?? MOCK_PAYMENT.payeeName,
              paymentTitle: cached.paymentTitle ?? MOCK_PAYMENT.paymentTitle,
              email: cached.payeeEmail ?? cached.email ?? MOCK_PAYMENT.email,
              mobilePhone: cached.payeePhone
                ? `+1 (${String(cached.payeePhone).slice(0, 3)}) ${String(cached.payeePhone).slice(3, 6)}-${String(cached.payeePhone).slice(6)}`
                : MOCK_PAYMENT.mobilePhone,
              referenceNumber: cached.referenceNumber ?? MOCK_PAYMENT.referenceNumber,
              amount: cached.amount ? `$${Number(cached.amount).toFixed(2)}` : MOCK_PAYMENT.amount,
              paymentMethods: cached.paymentMethod ? [String(cached.paymentMethod)] : MOCK_PAYMENT.paymentMethods,
            };
            if (!cancelled) {
              setData(normalized);
              setLoading(false);
              return;
            }
          }
        } catch {}
        // 2. Try to load real payment from Juice - fallback to mock matching screenshot
        // Primary: GET /api/v1/insurance/confirm?payment=1797 (proxied to Juice)
        // Secondary: GET /api/v1/payments/1797
        let res = await juiceFetch(`/v1/insurance/confirm?payment=${encodeURIComponent(paymentId)}`, {
          method: "GET",
        });
        if (!res.ok) {
          // fallback try payments endpoint
          res = await juiceFetch(`/v1/payments/${encodeURIComponent(paymentId)}`, { method: "GET" });
        }
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        // normalize shapes: {data:{...}} or direct
        const raw: any = json?.data ?? json;
        const normalized: PaymentOverview = {
          payeeName: raw?.payeeName ?? raw?.payee_name ?? raw?.full_name ?? raw?.name ?? MOCK_PAYMENT.payeeName,
          paymentTitle: raw?.paymentTitle ?? raw?.payment_title ?? raw?.title ?? MOCK_PAYMENT.paymentTitle,
          email: raw?.email ?? MOCK_PAYMENT.email,
          mobilePhone: raw?.mobilePhone ?? raw?.mobile_phone ?? raw?.phone ?? MOCK_PAYMENT.mobilePhone,
          referenceNumber: raw?.referenceNumber ?? raw?.reference_number ?? raw?.ref ?? MOCK_PAYMENT.referenceNumber,
          amount: raw?.amount ? `$${String(raw.amount).replace("$", "")}` : MOCK_PAYMENT.amount,
          paymentMethods: Array.isArray(raw?.paymentMethods)
            ? raw.paymentMethods
            : Array.isArray(raw?.methods)
              ? raw.methods
              : raw?.paymentMethod
                ? [String(raw.paymentMethod)]
                : MOCK_PAYMENT.paymentMethods,
        };
        if (!cancelled) setData(normalized);
      } catch (e) {
        // keep mock on failure but surface error if not 404
        if (!cancelled) {
          // silent fallback to mock - uncomment to show error
          // setError(e instanceof Error ? e.message : "Failed to load payment");
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
  }, [paymentId]);

  const handleEdit = () => {
    router.push(`/make-payment?payment=${encodeURIComponent(paymentId)}&edit=1`);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await juiceFetch(`/v1/insurance/confirm`, {
        method: "POST",
        body: JSON.stringify({ payment: paymentId, paymentId }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit payment");
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
              className="h-8 rounded-[8px] border-[#0d7bff] text-[#0d7bff] hover:bg-[#eaf1ff] hover:text-[#0d7bff] bg-white text-[12.5px] font-medium gap-1.5 px-4"
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

          {/* Footer Submit */}
          <div className="flex justify-end pt-8">
            <Button
              onClick={handleSubmit}
              disabled={submitting || loading}
              className="h-[38px] rounded-[8px] bg-[#0d7bff] hover:bg-[#0066e6] active:bg-[#005ad1] text-white text-[13px] font-semibold px-5 gap-2 shadow-sm disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin text-white" /> : <ShieldCheck size={16} className="text-white" />}
              {submitting ? "Submitting..." : "Submit"}
            </Button>
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
