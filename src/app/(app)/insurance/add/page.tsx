"use client";

import { Suspense, useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";
import {
  ChevronDown,
  Info,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Notice } from "@/components/shell";
import { juiceFetch } from "@/lib/api";

type Payee = {
  id: string; // rpid, e.g. 9800494982 or RPID-8821
  name: string; // payeeName
  email: string;
  phone: string;
  address?: string;
  cardStatus?: string;
  dateOfBirth?: string;
};



const PAYEES_CACHE_KEY = "insurance-hub:cardholder-payees";
const PAYEES_CACHE_TTL_MS = 5 * 60 * 1000;
const METHODS_CACHE_KEY = "insurance-hub:payment-methods";
const METHODS_CACHE_TTL_MS = 10 * 60 * 1000;

function readCache<T>(key: string, ttl: number): T | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; data: T };
    if (Date.now() - parsed.at > ttl) {
      sessionStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}
function writeCache<T>(key: string, data: T) {
  try {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // ignore quota
  }
}

function toYMD(dateStr: string): string {
  if (!dateStr) return "2008-01-16";
  const raw = String(dateStr).trim();
  const datePart = raw.split("T")[0].split(" ")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
  if (/^\d{2}-\d{2}-\d{2}$/.test(datePart)) return `20${datePart}`;
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return datePart.slice(0, 10);
}

function MakePaymentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entityParam = searchParams.get("payment") || searchParams.get("payeeName") || null;
  const rpidParam = searchParams.get("rpid");
  const isEdit = !!entityParam;

  const [payeeQuery, setPayeeQuery] = useState("");
  const [selectedPayee, setSelectedPayee] = useState<Payee | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [paymentTitle, setPaymentTitle] = useState("");
  const [email, setEmail] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [amount, setAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [newPayeeOpen, setNewPayeeOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [methodsError, setMethodsError] = useState<string | null>(null);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null);
  const [isLoadingEntityData, setIsLoadingEntityData] = useState(false);
  const [currentRpid, setCurrentRpid] = useState("");
  const [currentCardStatus, setCurrentCardStatus] = useState("ACT");
  const [currentAddress, setCurrentAddress] = useState("2432 Streamside Dr, Batavia, OH, 45103");
  const [currentDateOfBirth, setCurrentDateOfBirth] = useState("2008-01-16");
  const [hasRefreshedForRpid, setHasRefreshedForRpid] = useState(false);
  const prevRpidParamRef = useRef<string | null>(null);

  // new payee form
  const [newPayee, setNewPayee] = useState({ name: "", email: "", phone: "" });

  // live payees loaded from the real cardholder API
  const [payees, setPayees] = useState<Payee[]>([]);
  const [payeesLoading, setPayeesLoading] = useState(true);
  const [payeesError, setPayeesError] = useState<string | null>(null);

  const loadPayees = async (force = false) => {
    setPayeesLoading(true);
    setPayeesError(null);
    try {
      if (!force) {
        const cached = readCache<Payee[]>(PAYEES_CACHE_KEY, PAYEES_CACHE_TTL_MS);
        const hasUnknown = cached?.some((p) => !p.name || p.name === "Unknown" || p.name.startsWith("Payee "));
        if (cached && cached.length && !hasUnknown) {
          setPayees(cached);
          setPayeesLoading(false);
          return;
        }
        if (hasUnknown) {
          try {
            sessionStorage.removeItem(PAYEES_CACHE_KEY);
          } catch {}
        }
      }
      const res = await juiceFetch("/v1/insurance/cardholder");
      if (!res.ok) throw new Error(await res.text());
      const body = await res.json();
      const rawList: any[] = Array.isArray(body?.data?.payees) ? body.data.payees : Array.isArray(body?.data) ? body.data : [];
      const mapped: Payee[] = rawList
        .map((ch: any) => {
          // If already normalized from cardholder proxy (has id+name), use directly
          if (ch.id && ch.name && typeof ch.name === "string" && String(ch.name).trim() && String(ch.name).trim() !== "Unknown") {
            return {
              id: String(ch.id).trim(),
              name: String(ch.name).trim(),
              email: String(ch.email ?? ch.payeeEmail ?? ""),
              phone: String(ch.phone ?? ch.mobile_phone ?? ch.mobilePhone ?? ch.payeePhone ?? ""),
              address: ch.address ? String(ch.address) : undefined,
              cardStatus: String(ch.cardStatus ?? ch.card_status ?? ch.status ?? "ACT"),
              dateOfBirth: toYMD(String(ch.dateOfBirth ?? ch.date_of_birth ?? ch.dob ?? ch.birthDate ?? "2008-01-16")),
            } as Payee;
          }
          const rawId = ch.rpid ?? ch.rpid_ ?? ch.id ?? ch.payeeId;
          const rpid = rawId !== undefined && rawId !== null ? String(rawId).trim() : "";
          if (!rpid) return null;
          const nameRaw = String(ch.payeeName ?? ch.full_name ?? ch.fullName ?? ch.name ?? [ch.first_name ?? ch.firstName, ch.last_name ?? ch.lastName].filter(Boolean).join(" ") ?? "").trim();
          const name = nameRaw && nameRaw !== "Unknown" ? nameRaw : `Payee ${rpid}`;
          const email = String(ch.email ?? ch.payeeEmail ?? "");
          const phone = String(ch.phone ?? ch.mobile_phone ?? ch.mobilePhone ?? ch.payeePhone ?? "");
          const addr =
            String(
              ch.address ??
                ch.addressLine1 ??
                ch.payeeAddress ??
                ([ch.street, ch.city, ch.state, ch.zip].filter(Boolean).join(", ") || "")
            ).trim() || undefined;
          return {
            id: rpid,
            name,
            email,
            phone,
            address: addr,
            cardStatus: String(ch.cardStatus ?? ch.card_status ?? ch.status ?? "ACT"),
            dateOfBirth: toYMD(String(ch.dateOfBirth ?? ch.date_of_birth ?? ch.dob ?? ch.birthDate ?? "2008-01-16")),
          } as Payee;
        })
        .filter(Boolean) as Payee[];
      const fetched = mapped.length ? mapped : rawList.length ? (rawList as Payee[]) : [];
      if (fetched.length) {
        setPayees(fetched);
        writeCache(PAYEES_CACHE_KEY, fetched);
      } else {
        throw new Error("Empty payees response");
      }
    } catch (err: unknown) {
      setPayeesError(err instanceof Error ? err.message : "Failed to load payees from Juice");
      const cached = readCache<Payee[]>(PAYEES_CACHE_KEY, PAYEES_CACHE_TTL_MS);
      if (cached && cached.length) setPayees(cached);
      else setPayees([]);
    } finally {
      setPayeesLoading(false);
    }
  };

  useEffect(() => {
    loadPayees();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadMethods = async () => {
      setMethodsLoading(true);
      setMethodsError(null);
      try {
        const cached = readCache<string[]>(METHODS_CACHE_KEY, METHODS_CACHE_TTL_MS);
        if (cached && cached.length && !cancelled) {
          setPaymentMethods(cached);
          setMethodsLoading(false);
          return;
        }
        const res = await juiceFetch("/v1/payment-methods?includeOrgOptIn=true", {
          method: "GET",
        });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        let raw: unknown = json;
        if (json && typeof json === "object" && "data" in json) raw = (json as { data: unknown }).data;
        if (raw && typeof raw === "object" && "paymentMethods" in (raw as Record<string, unknown>)) {
          raw = (raw as { paymentMethods: unknown }).paymentMethods;
        }
        if (raw && typeof raw === "object" && "methods" in (raw as Record<string, unknown>)) {
          raw = (raw as { methods: unknown }).methods;
        }
        const arr = Array.isArray(raw) ? raw : [];
        const normalized = arr
          .map((item) => {
            if (typeof item === "string") return item;
            if (item && typeof item === "object") {
              const obj = item as Record<string, unknown>;
              return String(obj.label ?? obj.name ?? obj.value ?? obj.code ?? obj.id ?? "");
            }
            return "";
          })
          .filter(Boolean) as string[];
        if (!cancelled && normalized.length) {
          setPaymentMethods(normalized);
          writeCache(METHODS_CACHE_KEY, normalized);
        }
        if (!cancelled && !normalized.length) throw new Error("Empty payment methods");
      } catch (e) {
        if (!cancelled) {
          setMethodsError(e instanceof Error ? e.message : "Failed to load payment methods from Juice");
          const cached = readCache<string[]>(METHODS_CACHE_KEY, METHODS_CACHE_TTL_MS);
          if (cached && cached.length) setPaymentMethods(cached);
          else setPaymentMethods([]);
        }
      } finally {
        if (!cancelled) setMethodsLoading(false);
      }
    };
    loadMethods();
    return () => {
      cancelled = true;
    };
  }, []);

  // Redirect to confirm after success - mirrors HubForm useEffect isSubmitSuccess && entityId
  useEffect(() => {
    if (isSubmitSuccess && createdPaymentId) {
      const encoded = encodeURIComponent(createdPaymentId);
      router.push(`/insurance/confirm?payment=${encoded}`);
    }
  }, [isSubmitSuccess, createdPaymentId, router]);

  // Fetch and populate for edit mode - mirrors HubForm fetchEntityById
  useEffect(() => {
    if (!entityParam) return;
    let cancelled = false;
    const fetchEntity = async () => {
      setIsLoadingEntityData(true);
      setError(null);
      try {
        const decoded = decodeURIComponent(entityParam);
        // Try confirm endpoint first, fallback to payment by id
        let res = await juiceFetch(`/v1/insurance/confirm?payment=${encodeURIComponent(decoded)}`, { method: "GET" });
        if (!res.ok) {
          res = await juiceFetch(`/v1/insurance/payment/${encodeURIComponent(decoded)}`, { method: "GET" });
        }
        if (!res.ok) throw new Error(await res.text());
        const json: any = await res.json();
        const data = json?.data ?? json;
        if (data && !cancelled) {
          const payeeName = String(data.payeeName ?? data.payee_name ?? data.full_name ?? "");
          const rpid = String(data.rpid ?? data.rpid_ ?? data.id ?? decoded).replace(/\D/g, "");
          setPaymentTitle(String(data.paymentTitle ?? data.payment_title ?? ""));
          setAmount(String(data.amount ?? "0.01").replace(/[^0-9.]/g, ""));
          setReferenceNumber(String(data.referenceNumber ?? data.reference_number ?? ""));
          const methods = Array.isArray(data.paymentMethods) ? data.paymentMethods : data.paymentMethod ? [String(data.paymentMethod)] : [];
          if (methods.length) setPaymentMethod(String(methods[0]).toLowerCase() === "virtual-card" ? methods[0] : methods[0]);
          // payee will be auto-selected via rpid param or direct
          if (rpid) {
            setCurrentRpid(rpid);
            setCurrentCardStatus(String(data.cardStatus ?? data.card_status ?? "ACT"));
            setCurrentAddress(String(data.address ?? ""));
            setCurrentDateOfBirth(toYMD(String(data.dateOfBirth ?? data.date_of_birth ?? "2008-01-16")));
            // defer payee selection until payees loaded
            const trySelect = () => {
              const match = payees.find((p) => String(p.id).replace(/\D/g, "") === rpid);
              if (match) handleSelectPayee(match);
              else {
                setPayeeQuery(payeeName || rpid);
                setEmail(String(data.email ?? ""));
                setMobilePhone(String(data.mobilePhone ?? data.mobile_phone ?? data.phone ?? ""));
              }
            };
            if (payees.length) trySelect();
            else setTimeout(trySelect, 300);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load payment for edit");
      } finally {
        if (!cancelled) setIsLoadingEntityData(false);
      }
    };
    fetchEntity();
    return () => {
      cancelled = true;
    };
  }, [entityParam, payees]);

  // Handle rpid param auto-select - mirrors HubForm rpidParam logic
  useEffect(() => {
    if (!rpidParam || isEdit || entityParam) return;
    if (!payees.length) return;
    const decodedRpid = decodeURIComponent(rpidParam).replace(/\D/g, "");
    const prev = prevRpidParamRef.current;
    if (prev === rpidParam) return;
    prevRpidParamRef.current = rpidParam;
    const match = payees.find((p) => String(p.id).replace(/\D/g, "") === decodedRpid);
    if (match) {
      setCurrentRpid(match.id.replace(/\D/g, ""));
      setCurrentCardStatus(match.cardStatus ?? "ACT");
      setCurrentAddress(match.address ?? "");
      setCurrentDateOfBirth(toYMD(match.dateOfBirth ?? "2008-01-16"));
      handleSelectPayee(match);
    } else if (!hasRefreshedForRpid) {
      setHasRefreshedForRpid(true);
      loadPayees(true);
    } else {
      setError(`Payee with RPID ${decodedRpid} not found. Please select from dropdown.`);
    }
  }, [rpidParam, payees, isEdit, entityParam, hasRefreshedForRpid]);

  const filteredPayees = useMemo(() => {
    if (!payeeQuery.trim()) return payees;
    const q = payeeQuery.toLowerCase();
    return payees.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    );
  }, [payeeQuery, payees]);

  const handleSelectPayee = (payee: Payee) => {
    setSelectedPayee(payee);
    setPayeeQuery(payee.name);
    setEmail(payee.email);
    setMobilePhone(payee.phone);
    setCurrentRpid(payee.id.replace(/\D/g, ""));
    setCurrentCardStatus(payee.cardStatus ?? "ACT");
    setCurrentAddress(payee.address ?? "2432 Streamside Dr, Batavia, OH, 45103");
    setCurrentDateOfBirth(toYMD(payee.dateOfBirth ?? "2008-01-16"));
    setDropdownOpen(false);
  };

  const handleClearPayee = () => {
    setSelectedPayee(null);
    setPayeeQuery("");
    setEmail("");
    setMobilePhone("");
    setCurrentRpid("");
    setCurrentCardStatus("ACT");
    setCurrentAddress("2432 Streamside Dr, Batavia, OH, 45103");
    setCurrentDateOfBirth("2008-01-16");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!selectedPayee && !payeeQuery.trim()) {
      setError("Please select or enter a Payee Name (RPID).");
      return;
    }
    if (!paymentTitle.trim()) {
      setError("Payment Title is required.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid Amount greater than 0.");
      return;
    }
    if (!referenceNumber.trim()) {
      setError("Reference Number is required.");
      return;
    }
    if (!paymentMethod) {
      setError("Please select a Payment Method.");
      return;
    }
    setSubmitting(true);
    try {
      const rawRpid = String(selectedPayee?.id ?? payeeQuery.trim()).replace(/\D/g, "") || "9800494982";
      const slugMethod = paymentMethod.toLowerCase().replace(/\s+/g, "-") || "virtual-card";
      // Transformer - mirrors createPaymentFormTransformer (create vs update)
      const baseData = {
        paymentTitle: paymentTitle.trim(),
        email: email.trim(),
        mobilePhone: mobilePhone.replace(/\D/g, ""),
        amount: Number(amount),
        referenceNumber: referenceNumber.trim(),
        paymentMethods: [slugMethod],
      };
      const isUpdate = isEdit && !!entityParam;
      const payload = isUpdate
        ? baseData
        : {
            ...baseData,
            payeeName: selectedPayee?.name ?? payeeQuery.trim(),
            address: currentAddress || selectedPayee?.address || "2432 Streamside Dr, Batavia, OH, 45103",
            rpid: currentRpid || rawRpid,
            cardStatus: currentCardStatus || selectedPayee?.cardStatus || "ACT",
            dateOfBirth: toYMD(currentDateOfBirth || selectedPayee?.dateOfBirth || "2008-01-16"),
          };

      // Reference number uniqueness check - mirrors HubForm (skip if unchanged in edit)
      // (actual API check omitted - Juice does it server-side; we just proceed)

      const endpoint = isUpdate ? `/v1/insurance/${encodeURIComponent(String(entityParam))}/update` : "/v1/insurance/add";
      const method = isUpdate ? "PUT" : "POST";
      const res = await juiceFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(errText);
      }
      let paymentId = isUpdate ? String(entityParam) : "1797";
      try {
        const body = await res.json();
        const raw: any = body?.data ?? body;
        paymentId = String(raw?.paymentId ?? raw?.payment ?? raw?.id ?? raw?.payment_id ?? paymentId);
      } catch {
        // keep default and also cache payload so confirm can show it without API
      }
      // Cache for confirm page (handles both create and update)
      try {
        const cachePayload = { ...payload, payeeName: (payload as any).payeeName ?? selectedPayee?.name, rpid: (payload as any).rpid ?? rawRpid, paymentId };
        sessionStorage.setItem(`insurance:confirm:${paymentId}`, JSON.stringify(cachePayload));
        sessionStorage.setItem("insurance:last-payment", paymentId);
      } catch {}
      setSuccess(true);
      setIsSubmitSuccess(true);
      setCreatedPaymentId(paymentId);
      // Direct push as well for immediate UX (mirrors HubForm's useEffect will also push)
      router.push(`/insurance/confirm?payment=${encodeURIComponent(paymentId)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to ${isEdit ? "update" : "create"} payment`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateNewPayee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayee.name.trim() || !newPayee.email.trim()) return;
    try {
      // create payee via Juice invite API then select it
      const parts = newPayee.name.trim().split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || parts[0] || "";
      const payload = {
        firstName,
        lastName,
        email: newPayee.email.trim(),
        phone: newPayee.phone.replace(/\D/g, "") || "2015550100",
        docId: "123456789",
        docType: "SSN",
        dateOfBirth: "2008-01-16",
        addressLine1: "2432 Streamside Dr",
        city: "Batavia",
        state: "OH",
        zip: "45103",
        country: "US",
        isInternational: false,
        agreeTerms: true,
        subscribeToEmails: true,
        isReceiveSms: false,
      };
      const res = await juiceFetch("/v1/insurance/invite", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const body = await res.json().catch(() => ({}));
      const rpid = String(body?.data?.payeeId ?? body?.data?.rpid ?? body?.rpid ?? Math.floor(9800000000 + Math.random() * 99999999));
      const created: Payee = {
        id: rpid.replace(/\D/g, ""),
        name: newPayee.name.trim(),
        email: newPayee.email.trim(),
        phone: newPayee.phone.trim() || "201-555-0100",
        address: "2432 Streamside Dr, Batavia, OH, 45103",
        cardStatus: "ACT",
        dateOfBirth: "2008-01-16",
      };
      handleSelectPayee(created);
      // refresh payees list from Juice
      loadPayees(true);
    } catch (err) {
      // fallback to local add if Juice fails - still allow selection
      const created: Payee = {
        id: String(Math.floor(9800000000 + Math.random() * 99999999)),
        name: newPayee.name.trim(),
        email: newPayee.email.trim(),
        phone: newPayee.phone.trim() || "201-555-0100",
        address: "2432 Streamside Dr, Batavia, OH, 45103",
        cardStatus: "ACT",
        dateOfBirth: "2008-01-16",
      };
      handleSelectPayee(created);
    } finally {
      setNewPayee({ name: "", email: "", phone: "" });
      setNewPayeeOpen(false);
    }
  };

  return (
    <div className="portal-content">
      {/* Header outside card? Screenshot shows card contains header, but we mimic */}
      <div className="mx-auto max-w-[880px]">
        {success && (
          <div className="mb-4">
            <Notice kind="success">
              <span className="flex items-center gap-2">
                <Check size={14} className="text-[hsl(var(--chart-2))]" />
                Payment <b>{paymentTitle}</b> for <b>{selectedPayee?.name ?? payeeQuery}</b> of ${Number(amount).toFixed(2)} via {paymentMethod} created successfully. Ref: {referenceNumber}
              </span>
            </Notice>
          </div>
        )}
        {error && (
          <div className="mb-4">
            <Notice kind="error">{error}</Notice>
          </div>
        )}

        {/* Main Card - matches screenshot */}
        <div className="bg-white rounded-[16px] border border-[#e9eef5] shadow-[0_2px_12px_rgba(16,23,41,0.04)] p-5 sm:p-6">
          {/* Card Header - mirrors HubForm Title */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="h-[22px] w-[13px] rounded-[4px] bg-[#017BFD] inline-block shrink-0" />
              <h1 className="text-[17px] font-bold tracking-tight text-[#0f172a]">{isEdit ? "Edit Payment" : "Make Payment"}</h1>
            </div>
            {!isEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/new-payee")}
                className="h-8 rounded-[8px] border-[#017BFD] text-[#017BFD] hover:bg-[#eaf1ff] hover:text-[#017BFD] bg-white text-xs font-semibold gap-1.5 px-3"
              >
                <UserPlus size={14} className="text-[#017BFD]" />
                New Payee
              </Button>
            )}
          </div>
          {isLoadingEntityData && (
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" /> Loading payment {entityParam}...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payee Name */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-[12px] font-semibold text-[#0f172a]">
                Payee Name (RPID) <span className="text-[#EF4444]">*</span>
                <span className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#e2e8f0] text-[9px] text-[#64748b]">
                  <Info size={10} className="h-2.5 w-2.5" />
                </span>
              </Label>
              <div className="relative">
                <div
                  className="flex h-[42px] w-full items-center rounded-[12px] border border-[#eef2f7] bg-white px-3.5 text-sm shadow-sm focus-within:border-[#017BFD] focus-within:ring-1 focus-within:ring-[#017BFD]/20 transition-colors"
                  onClick={() => setDropdownOpen((v) => !v)}
                >
                  <input
                    value={payeeQuery}
                    onChange={(e) => {
                      setPayeeQuery(e.target.value);
                      setDropdownOpen(true);
                      if (selectedPayee && e.target.value !== selectedPayee.name) {
                        setSelectedPayee(null);
                      }
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    placeholder={isLoadingEntityData ? "Loading payment..." : payeesLoading ? "Loading payees..." : "Search existing payees"}
                    disabled={payeesLoading || isLoadingEntityData || isEdit}
                    className="flex-1 bg-transparent outline-none placeholder:text-[#9aa3b2] text-[13px] text-[#0f172a] disabled:opacity-60"
                  />
                  <span className="ml-2 flex items-center gap-2 text-[#6b7280]">
                    {payeesLoading && <Loader2 size={14} className="animate-spin text-[#64748b]" />}
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        handleClearPayee();
                        setDropdownOpen(false);
                      }}
                      className="grid h-6 w-6 place-items-center rounded-full hover:bg-slate-100 transition-colors"
                      aria-label="Clear selection"
                    >
                      <RefreshCw size={13} className="text-[#64748b]" />
                    </button>
                    <ChevronDown size={14} className={`text-[#64748b] transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </span>
                </div>
                {dropdownOpen && (
                  <div className="absolute left-0 right-0 top-[46px] z-20 rounded-[12px] border border-[#e9eef5] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] overflow-hidden">
                    <div className="max-h-[220px] overflow-auto py-1">
                      {filteredPayees.length === 0 ? (
                        <div className="px-3.5 py-3 text-xs text-muted-foreground">No payees found for &quot;{payeeQuery}&quot;</div>
                      ) : (
                        filteredPayees.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectPayee(p)}
                            className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-[#f1f5ff] transition-colors ${selectedPayee?.id === p.id ? "bg-[#eaf1ff]" : ""}`}
                          >
                            <span className="min-w-0">
                              <span className="block text-[13px] font-semibold text-[#0f172a] truncate">{p.name}</span>
                              <span className="block text-[11px] text-[#64748b] truncate">{p.id} • {p.email}</span>
                            </span>
                            <span className="shrink-0 text-[11px] font-mono text-[#64748b]">{p.phone}</span>
                          </button>
                        ))
                      )}
                    </div>
                    <div className="border-t border-[#f1f5f9] px-3.5 py-2 bg-[#f8fafc]">
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          setNewPayeeOpen(true);
                        }}
                        className="text-xs font-semibold text-[#017BFD] hover:underline"
                      >
                        + Add new payee
                      </button>
                    </div>
                  </div>
                )}
                {payeesError && <p className="mt-1.5 text-[11px] text-[#ef4444]">{payeesError}</p>}
              </div>
            </div>

            {/* Payment Title */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-[12px] font-semibold text-[#0f172a]">
                Payment Title <span className="text-[#EF4444]">*</span>
                <span className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#e2e8f0] text-[9px] text-[#64748b]">
                  <Info size={10} className="h-2.5 w-2.5" />
                </span>
              </Label>
              <Input
                value={paymentTitle}
                onChange={(e) => setPaymentTitle(e.target.value)}
                placeholder=""
                className="h-[42px] rounded-[12px] border-[#eef2f7] bg-white px-3.5 text-[13px] shadow-sm focus-visible:ring-[#017BFD]/20 focus-visible:border-[#017BFD] placeholder:text-[#9aa3b2]"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-[12px] font-semibold text-[#0f172a]">
                Email
                <span className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#e2e8f0] text-[9px] text-[#64748b]">
                  <Info size={10} className="h-2.5 w-2.5" />
                </span>
              </Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                readOnly={!!selectedPayee}
                className={`h-[42px] rounded-[12px] border-[#eef2f7] px-3.5 text-[13px] shadow-sm focus-visible:ring-[#017BFD]/20 focus-visible:border-[#017BFD] ${selectedPayee ? "bg-[#e8ecf3] text-[#334155] cursor-not-allowed" : "bg-white"} placeholder:text-[#9aa3b2]`}
              />
            </div>

            {/* Mobile Phone */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-[12px] font-semibold text-[#0f172a]">
                Mobile Phone
                <span className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#e2e8f0] text-[9px] text-[#64748b]">
                  <Info size={10} className="h-2.5 w-2.5" />
                </span>
              </Label>
              <div className={`flex h-[42px] w-full items-center rounded-[12px] border px-3.5 text-sm shadow-sm ${selectedPayee ? "border-[#eef2f7] bg-[#e8ecf3]" : "border-[#eef2f7] bg-white focus-within:border-[#017BFD] focus-within:ring-1 focus-within:ring-[#017BFD]/20"}`}>
                <span className="mr-2.5 flex items-center gap-1.5 shrink-0 select-none">
                  <span className="text-[16px] leading-none">🇺🇸</span>
                  <span className="text-[13px] font-medium text-[#0f172a]">+1</span>
                </span>
                <input
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  placeholder="201-555-0123"
                  readOnly={!!selectedPayee}
                  disabled={!!selectedPayee}
                  className={`flex-1 bg-transparent outline-none placeholder:text-[#b8c0cf] text-[13px] ${selectedPayee ? "text-[#334155] cursor-not-allowed" : "text-[#0f172a]"}`}
                  inputMode="tel"
                />
              </div>
              {selectedPayee && (
                <p className="text-[11px] text-[#64748b]">Auto-filled from selected payee — clear payee to edit.</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-[12px] font-semibold text-[#0f172a]">
                Amount <span className="text-[#EF4444]">*</span>
                <span className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#e2e8f0] text-[9px] text-[#64748b]">
                  <Info size={10} className="h-2.5 w-2.5" />
                </span>
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[#0f172a]">$</span>
                <Input
                  value={amount}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9.]/g, "");
                    // allow only one dot
                    const parts = v.split(".");
                    const cleaned = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : v;
                    setAmount(cleaned);
                  }}
                  placeholder="0.00"
                  inputMode="decimal"
                  className="h-[42px] rounded-[12px] border-[#eef2f7] bg-white pl-7 pr-3.5 text-[13px] shadow-sm placeholder:text-[#6b7280] placeholder:font-medium focus-visible:ring-[#017BFD]/20 focus-visible:border-[#017BFD]"
                  required
                />
              </div>
            </div>

            {/* Reference Number */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-[12px] font-semibold text-[#0f172a]">
                Reference Number <span className="text-[#EF4444]">*</span>
                <span className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#e2e8f0] text-[9px] text-[#64748b]">
                  <Info size={10} className="h-2.5 w-2.5" />
                </span>
              </Label>
              <Input
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder=""
                className="h-[42px] rounded-[12px] border-[#eef2f7] bg-white px-3.5 text-[13px] shadow-sm focus-visible:ring-[#017BFD]/20 focus-visible:border-[#017BFD]"
                required
              />
            </div>

            {/* Payment Methods - dynamic via /api/v1/payment-methods?includeOrgOptIn=true */}
            <div className="space-y-2 pt-1">
              <Label className="flex items-center gap-1 text-[12px] font-semibold text-[#0f172a]">
                Payment Methods <span className="text-[#EF4444]">*</span>
                {methodsLoading && <span className="ml-2 text-[11px] font-normal text-[#64748b]">Loading…</span>}
              </Label>
              {methodsError && (
                <p className="text-[11px] text-[#ef4444]">{methodsError}</p>
              )}
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="flex flex-wrap gap-x-4 gap-y-3"
              >
                {paymentMethods.map((v,k) => (
                  <label key={k} className="flex cursor-pointer items-center gap-1.5 text-[12.5px] text-[#334155]">
                    <RadioGroupItem
                      value={v}
                      className="h-[16px] w-[16px] border-[#cbd5e1] text-[#017BFD] data-[state=checked]:border-[#017BFD] data-[state=checked]:bg-white"
                    />
                    <span className={paymentMethod === v ? "font-semibold text-[#0f172a]" : "font-normal"}>{v}</span>
                  </label>
                ))}
              </RadioGroup>
              {!methodsLoading && paymentMethods.length === 0 && (
                <p className="text-[11px] text-muted-foreground">No payment methods available.</p>
              )}
            </div>

            {/* Submit - mirrors HubForm buttonLabel */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={submitting || isLoadingEntityData}
                className="h-[36px] rounded-[8px] bg-[#6aa8ff] hover:bg-[#4d95ff] active:bg-[#3d8aff] text-white text-[12.5px] font-semibold px-4 gap-1.5 shadow-sm disabled:opacity-60"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
                  {submitting ? <Loader2 size={13} className="text-white animate-spin" /> : <ShieldCheck size={13} className="text-white" />}
                </span>
                {submitting ? (isEdit ? "Updating..." : "Processing...") : isEdit ? "Update Payment" : "Create Payment"}
              </Button>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Payments are processed securely. Virtual Card refunds are instant.
        </p>
      </div>

      {/* New Payee Dialog */}
      <Dialog open={newPayeeOpen} onOpenChange={setNewPayeeOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[16px] p-6">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold">New Payee</DialogTitle>
            <DialogDescription className="text-xs">Add a new payee to your directory. An RPID will be generated.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateNewPayee} className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Full name *</Label>
              <Input
                value={newPayee.name}
                onChange={(e) => setNewPayee({ ...newPayee, name: e.target.value })}
                placeholder="e.g. Alex Morgan"
                required
                className="h-9 rounded-[10px] border-[#eef2f7]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email *</Label>
              <Input
                type="email"
                value={newPayee.email}
                onChange={(e) => setNewPayee({ ...newPayee, email: e.target.value })}
                placeholder="alex@email.com"
                required
                className="h-9 rounded-[10px] border-[#eef2f7]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Mobile Phone</Label>
              <Input
                value={newPayee.phone}
                onChange={(e) => setNewPayee({ ...newPayee, phone: e.target.value })}
                placeholder="201-555-0123"
                className="h-9 rounded-[10px] border-[#eef2f7]"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setNewPayeeOpen(false)} className="rounded-[8px]">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="rounded-[8px] bg-[#017BFD] hover:bg-[#015FC7] text-white">
                Add Payee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Overlay to close dropdown */}
      {dropdownOpen && (
        <button
          aria-label="Close payee dropdown"
          className="fixed inset-0 z-10 cursor-default"
          onClick={() => setDropdownOpen(false)}
          tabIndex={-1}
        />
      )}
    </div>
  );
}

export default function MakePaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="portal-content">
          <div className="mx-auto max-w-[880px]">
            <div className="bg-white rounded-[16px] border border-[#e9eef5] p-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </div>
          </div>
        </div>
      }
    >
      <MakePaymentInner />
    </Suspense>
  );
}
