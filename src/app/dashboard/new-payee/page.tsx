"use client";

import { useState } from "react";
import { Calendar, Check, Info, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Notice } from "@/components/shell";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri",
  "Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

type FormState = {
  legalFirstName: string;
  middleName: string;
  legalLastName: string;
  secondSurname: string;
  email: string;
  dob: string;
  country: string;
  phone: string;
  documentId: string;
  address: string;
  aptSuite: string;
  zipCode: string;
  city: string;
  state: string;
  attested: boolean;
};

function FieldLabel({ children, required, info }: { children: React.ReactNode; required?: boolean; info?: boolean }) {
  return (
    <Label className="flex items-center gap-1 text-[11.5px] font-semibold text-[#0f172a] leading-none">
      {children} {required && <span className="text-[#EF4444]">*</span>}
      <span className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#e2e8f0] text-[#94a3b8]">
        <Info size={10} className="h-2.5 w-2.5" />
      </span>
      {!info && null}
    </Label>
  );
}

export default function NewPayeePage() {
  const [form, setForm] = useState<FormState>({
    legalFirstName: "",
    middleName: "",
    legalLastName: "",
    secondSurname: "",
    email: "",
    dob: "",
    country: "United States",
    phone: "",
    documentId: "",
    address: "",
    aptSuite: "",
    zipCode: "",
    city: "",
    state: "",
    attested: false,
  });
  const [countryOpen, setCountryOpen] = useState(false);
  const COUNTRIES = ["United States", "Canada", "Mexico", "United Kingdom", "Australia"];
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<FormState>) => setForm((p) => ({ ...p, ...patch }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.legalFirstName.trim()) return setError("Legal First Name is required.");
    if (!form.legalLastName.trim()) return setError("Legal Last Name is required.");
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) return setError("Valid Email is required.");
    if (!form.dob) return setError("Date Of Birth is required.");
    if (!form.country) return setError("Country is required.");
    if (!form.phone.trim()) return setError("Phone Number is required.");
    if (!form.address.trim()) return setError("Address is required.");
    if (!form.zipCode.trim()) return setError("ZIP Code is required.");
    if (!form.city.trim()) return setError("City is required.");
    if (!form.state) return setError("State is required.");
    if (!form.attested) return setError("You must attest that the information is correct.");

    setSuccess(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const inputClass =
    "h-[42px] rounded-[12px] border-[#eef2f7] bg-white px-3.5 text-[13px] shadow-sm placeholder:text-[#9aa3b2] focus-visible:border-[#017BFD] focus-visible:ring-[#017BFD]/20";

  return (
    <div className="portal-content">
      <div className="mx-auto max-w-[980px]">
        {success && (
          <div className="mb-4">
            <Notice kind="success">
              <span className="flex items-center gap-2">
                <Check size={14} className="text-[hsl(var(--chart-2))]" />
                Payee <b>{form.legalFirstName} {form.legalLastName}</b> saved successfully.
              </span>
            </Notice>
          </div>
        )}
        {error && (
          <div className="mb-4">
            <Notice kind="error">{error}</Notice>
          </div>
        )}

        {/* Card - matches screenshot: light grey page, white card with rounded 16 */}
        <div className="bg-[#f8f9fc] sm:bg-white rounded-[16px] border border-[#e9eef5] shadow-[0_2px_12px_rgba(16,23,41,0.04)] p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-6">
            <span className="h-[22px] w-[12px] rounded-[4px] bg-[#017BFD] inline-block shrink-0" />
            <h1 className="text-[17px] font-bold tracking-tight text-[#0f172a]">New Payee</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Legal First Name / Middle Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FieldLabel required>Legal First Name</FieldLabel>
                <Input
                  value={form.legalFirstName}
                  onChange={(e) => update({ legalFirstName: e.target.value })}
                  placeholder="Enter first name"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Middle Name</FieldLabel>
                <Input
                  value={form.middleName}
                  onChange={(e) => update({ middleName: e.target.value })}
                  placeholder="Enter middle name"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Row 2: Legal Last Name / Second Surname */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FieldLabel required>Legal Last Name</FieldLabel>
                <Input
                  value={form.legalLastName}
                  onChange={(e) => update({ legalLastName: e.target.value })}
                  placeholder="Enter last name"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Second Surname</FieldLabel>
                <Input
                  value={form.secondSurname}
                  onChange={(e) => update({ secondSurname: e.target.value })}
                  placeholder="Enter surname"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Row 3: Email / Date Of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FieldLabel required>Email</FieldLabel>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update({ email: e.target.value })}
                  placeholder="Enter email"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel required>Date Of Birth</FieldLabel>
                <div className="relative">
                  <Input
                    type="date"
                    value={form.dob}
                    onChange={(e) => update({ dob: e.target.value })}
                    className={`${inputClass} pr-9 [&::-webkit-calendar-picker-indicator]:opacity-0`}
                    placeholder="Select date of birth"
                  />
                  <Calendar size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                </div>
              </div>
            </div>

            {/* Row 4: Country / Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-[11.5px] font-semibold text-[#0f172a] leading-none">
                  Country <span className="text-[#EF4444]">*</span>
                </Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCountryOpen((v) => !v)}
                    className="flex h-[42px] w-full items-center justify-between rounded-[12px] border border-[#eef2f7] bg-white px-3.5 text-[13px] shadow-sm"
                  >
                    <span className="font-medium text-[#0f172a]">{form.country || "Select country"}</span>
                    {form.country ? (
                      <span
                        onClick={(ev) => { ev.stopPropagation(); update({ country: "" }); setCountryOpen(false); }}
                        className="grid h-5 w-5 place-items-center rounded-full hover:bg-slate-100"
                      >
                        <X size={12} className="text-[#64748b]" />
                      </span>
                    ) : null}
                  </button>
                  {countryOpen && (
                    <div className="absolute left-0 right-0 top-[46px] z-20 rounded-[12px] border border-[#e9eef5] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] overflow-hidden">
                      {COUNTRIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { update({ country: c }); setCountryOpen(false); }}
                          className={`flex w-full px-3.5 py-2.5 text-left text-[13px] hover:bg-[#f1f5ff] ${form.country===c ? "bg-[#eaf1ff] font-semibold" : ""}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <FieldLabel required>Phone Number</FieldLabel>
                <div className="flex h-[42px] w-full items-center rounded-[12px] border border-[#eef2f7] bg-white px-3.5 text-sm shadow-sm focus-within:border-[#017BFD] focus-within:ring-1 focus-within:ring-[#017BFD]/20">
                  <span className="mr-2.5 flex items-center gap-1.5 shrink-0 select-none">
                    <span className="text-[16px] leading-none">🇺🇸</span>
                    <span className="text-[13px] font-medium text-[#0f172a]">+1</span>
                  </span>
                  <input
                    value={form.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                    placeholder="Enter phone number"
                    inputMode="tel"
                    className="flex-1 bg-transparent outline-none placeholder:text-[#9aa3b2] text-[13px] text-[#0f172a]"
                  />
                </div>
              </div>
            </div>

            {/* Row 5: Document ID / Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-[11.5px] font-semibold text-[#0f172a] leading-none">
                  Document ID
                  <span className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#e2e8f0] text-[#94a3b8]">
                    <Info size={10} className="h-2.5 w-2.5" />
                  </span>
                </Label>
                <Input
                  value={form.documentId}
                  onChange={(e) => update({ documentId: e.target.value })}
                  placeholder="Enter SSN"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel required>Address</FieldLabel>
                <Input
                  value={form.address}
                  onChange={(e) => update({ address: e.target.value })}
                  placeholder="Enter address"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Row 6: Apt/Suite / ZIP Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-[11.5px] font-semibold text-[#0f172a] leading-none">
                  Apt/Suite
                  <span className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#e2e8f0] text-[#94a3b8]">
                    <Info size={10} className="h-2.5 w-2.5" />
                  </span>
                </Label>
                <Input
                  value={form.aptSuite}
                  onChange={(e) => update({ aptSuite: e.target.value })}
                  placeholder="Enter Apt/Suite (optional)"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel required>ZIP Code</FieldLabel>
                <Input
                  value={form.zipCode}
                  onChange={(e) => update({ zipCode: e.target.value })}
                  placeholder="Enter ZIP code"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Row 7: City / State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FieldLabel required>City</FieldLabel>
                <Input
                  value={form.city}
                  onChange={(e) => update({ city: e.target.value })}
                  placeholder="Enter city"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel required>State</FieldLabel>
                <Select value={form.state} onValueChange={(v) => update({ state: v })}>
                  <SelectTrigger className="h-[42px] rounded-[12px] border-[#eef2f7] bg-white px-3.5 text-[13px] shadow-sm data-[placeholder]:text-[#9aa3b2] focus:ring-[#017BFD]/20 focus:border-[#017BFD]">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[12px]">
                    {US_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Attestation */}
            <label className="flex items-start gap-2.5 pt-3 cursor-pointer select-none">
              <span
                onClick={() => update({ attested: !form.attested })}
                className={`mt-0.5 grid h-[16px] w-[16px] shrink-0 place-items-center rounded-full border ${form.attested ? "bg-[#017BFD] border-[#017BFD]" : "bg-white border-[#cbd5e1]"} transition-colors`}
              >
                {form.attested && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <input
                type="checkbox"
                checked={form.attested}
                onChange={(e) => update({ attested: e.target.checked })}
                className="sr-only"
              />
              <span className="text-[12px] leading-[1.5] text-[#334155]">
                I attest that the information and documentation submitted herein is complete, correct, and accurate to the best of my knowledge
              </span>
            </label>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                className="h-[36px] rounded-[8px] bg-[#6aa8ff] hover:bg-[#4d95ff] active:bg-[#3d8aff] text-white text-[12.5px] font-semibold px-5 gap-1.5 shadow-sm"
              >
                <UserPlus size={14} className="text-white" />
                Save Payee
              </Button>
            </div>
          </form>
        </div>
      </div>

      {countryOpen && (
        <button
          aria-label="Close country dropdown"
          className="fixed inset-0 z-10 cursor-default"
          onClick={() => setCountryOpen(false)}
          tabIndex={-1}
        />
      )}
    </div>
  );
}
