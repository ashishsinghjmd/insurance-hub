"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Info,
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

type Payee = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

const MOCK_PAYEES: Payee[] = [
  { id: "RPID-8821", name: "John Carter", email: "john.carter@email.com", phone: "201-555-0123" },
  { id: "RPID-8822", name: "Sarah Kim", email: "sarah.kim@email.com", phone: "415-555-0199" },
  { id: "RPID-8823", name: "David Lee", email: "david.lee@email.com", phone: "312-555-0142" },
  { id: "RPID-8824", name: "Maria Gomez", email: "maria.gomez@email.com", phone: "713-555-0176" },
  { id: "RPID-8825", name: "James Wong", email: "james.wong@email.com", phone: "206-555-0188" },
];

const PAYMENT_METHODS = [
  "Virtual Card",
  "Wire Transfer",
  "ACH",
  "Paypal",
  "Crypto Account",
  "Venmo",
  "Check",
] as const;

export default function MakePaymentPage() {
  const router = useRouter();
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

  // new payee form
  const [newPayee, setNewPayee] = useState({ name: "", email: "", phone: "" });

  const filteredPayees = useMemo(() => {
    if (!payeeQuery.trim()) return MOCK_PAYEES;
    const q = payeeQuery.toLowerCase();
    return MOCK_PAYEES.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    );
  }, [payeeQuery]);

  const handleSelectPayee = (payee: Payee) => {
    setSelectedPayee(payee);
    setPayeeQuery(payee.name);
    setEmail(payee.email);
    setMobilePhone(payee.phone);
    setDropdownOpen(false);
  };

  const handleClearPayee = () => {
    setSelectedPayee(null);
    setPayeeQuery("");
    setEmail("");
    setMobilePhone("");
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    setSuccess(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateNewPayee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayee.name.trim() || !newPayee.email.trim()) return;
    const created: Payee = {
      id: `RPID-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newPayee.name.trim(),
      email: newPayee.email.trim(),
      phone: newPayee.phone.trim() || "201-555-0100",
    };
    handleSelectPayee(created);
    setNewPayee({ name: "", email: "", phone: "" });
    setNewPayeeOpen(false);
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
          {/* Card Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="h-[22px] w-[13px] rounded-[4px] bg-[#017BFD] inline-block shrink-0" />
              <h1 className="text-[17px] font-bold tracking-tight text-[#0f172a]">Make Payment</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/new-payee")}
              className="h-8 rounded-[8px] border-[#017BFD] text-[#017BFD] hover:bg-[#eaf1ff] hover:text-[#017BFD] bg-white text-xs font-semibold gap-1.5 px-3"
            >
              <UserPlus size={14} className="text-[#017BFD]" />
              New Payee
            </Button>
          </div>

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
                    placeholder="Search existing payees"
                    className="flex-1 bg-transparent outline-none placeholder:text-[#9aa3b2] text-[13px] text-[#0f172a]"
                  />
                  <span className="ml-2 flex items-center gap-2 text-[#6b7280]">
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
              <div className="flex h-[42px] w-full items-center rounded-[12px] border border-[#eef2f7] bg-white px-3.5 text-sm shadow-sm focus-within:border-[#017BFD] focus-within:ring-1 focus-within:ring-[#017BFD]/20">
                <span className="mr-2.5 flex items-center gap-1.5 shrink-0 select-none">
                  <span className="text-[16px] leading-none">🇺🇸</span>
                  <span className="text-[13px] font-medium text-[#0f172a]">+1</span>
                </span>
                <input
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  placeholder="201-555-0123"
                  className="flex-1 bg-transparent outline-none placeholder:text-[#b8c0cf] text-[13px] text-[#0f172a]"
                  inputMode="tel"
                />
              </div>
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

            {/* Payment Methods */}
            <div className="space-y-2 pt-1">
              <Label className="flex items-center gap-1 text-[12px] font-semibold text-[#0f172a]">
                Payment Methods <span className="text-[#EF4444]">*</span>
              </Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="flex flex-wrap gap-x-4 gap-y-3"
              >
                {PAYMENT_METHODS.map((m) => (
                  <label key={m} className="flex cursor-pointer items-center gap-1.5 text-[12.5px] text-[#334155]">
                    <RadioGroupItem
                      value={m}
                      className="h-[16px] w-[16px] border-[#cbd5e1] text-[#017BFD] data-[state=checked]:border-[#017BFD] data-[state=checked]:bg-white"
                    />
                    <span className={paymentMethod === m ? "font-semibold text-[#0f172a]" : "font-normal"}>{m}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                className="h-[36px] rounded-[8px] bg-[#6aa8ff] hover:bg-[#4d95ff] active:bg-[#3d8aff] text-white text-[12.5px] font-semibold px-4 gap-1.5 shadow-sm"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
                  <ShieldCheck size={13} className="text-white" />
                </span>
                Create Payment
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
