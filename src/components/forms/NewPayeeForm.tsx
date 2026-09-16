"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Info, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { US_STATES } from "@/lib/data/usStates";
import { INT_DOC_TYPE_OPTIONS } from "@/lib/data/internationalDocTypes";
import { payeeFormSchema, type PayeeFormData, defaultPayeeFormValues } from "@/lib/forms/constants/payeeFormConstants";
import { stripPhoneFormatting } from "@/lib/utils/phone";
import { COUNTRY_OPTIONS, COUNTRY_NAME_MAP } from "@/lib/data/countries";
import { lookupByZipCode } from "@/lib/utils/geographyLookup";
import PhoneInput from "@/components/ui/phone-input/PhoneInput";

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Label className="flex items-center gap-1 text-[11.5px] font-semibold text-[#0f172a] leading-none">
      {children} {required && <span className="text-[#EF4444]">*</span>}
      <span className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#e2e8f0] text-[#94a3b8]">
        <Info size={10} className="h-2.5 w-2.5" />
      </span>
    </Label>
  );
}

interface Props {
  defaultValues?: Partial<PayeeFormData>;
  onSubmit: (data: PayeeFormData) => Promise<void>;
  submitting?: boolean;
}

export default function NewPayeeForm({ defaultValues, onSubmit, submitting }: Props) {
  const [countryOpen, setCountryOpen] = useState(false);
  const form = useForm<PayeeFormData>({
    resolver: zodResolver(payeeFormSchema) as never,
    defaultValues: { ...defaultPayeeFormValues, ...defaultValues },
    mode: "onBlur",
  });

  const country = form.watch("country") || "US";
  const zipValue = form.watch("zipCode");
  const isUS = country === "US";
  const zipDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCountryRef = useRef(country);

  useEffect(() => {
    if (prevCountryRef.current !== country) {
      form.setValue("phone", "", { shouldValidate: false });
      if (country === "US") {
        form.setValue("intDocId", "", { shouldValidate: false });
        form.setValue("intDocType", "", { shouldValidate: false });
      } else {
        form.setValue("documentId", "", { shouldValidate: false });
      }
      prevCountryRef.current = country;
    }
  }, [country, form]);

  useEffect(() => {
    if (!isUS || !zipValue || zipValue.replace(/\D/g, "").length < 5) return;
    if (zipDebounceRef.current) clearTimeout(zipDebounceRef.current);
    zipDebounceRef.current = setTimeout(() => {
      const loc = lookupByZipCode(zipValue);
      if (loc) {
        if (loc.city) form.setValue("city", loc.city, { shouldValidate: true });
        if (loc.state) form.setValue("state", loc.state, { shouldValidate: true });
      }
    }, 300);
    return () => {
      if (zipDebounceRef.current) clearTimeout(zipDebounceRef.current);
    };
  }, [zipValue, isUS, form]);

  const handleSubmit = form.handleSubmit(async (data) => {
    const normalized = { ...data, phone: stripPhoneFormatting(data.phone ?? "") };
    await onSubmit(normalized as unknown as PayeeFormData);
  });

  const inputClass = "h-[42px] rounded-[12px] border-[#eef2f7] bg-white px-3.5 text-[13px] shadow-sm placeholder:text-[#9aa3b2] focus-visible:border-[#017BFD] focus-visible:ring-[#017BFD]/20";
  const err = (name: keyof PayeeFormData) => form.formState.errors[name]?.message as string | undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <FieldLabel required>Legal First Name</FieldLabel>
          <Input placeholder="Enter first name" className={inputClass} {...form.register("legalFirstName")} />
          {err("legalFirstName") && <p className="text-[11px] text-[#ef4444]">{err("legalFirstName")}</p>}
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Middle Name</FieldLabel>
          <Input placeholder="Enter middle name" className={inputClass} {...form.register("middleName")} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <FieldLabel required>Legal Last Name</FieldLabel>
          <Input placeholder="Enter last name" className={inputClass} {...form.register("legalLastName")} />
          {err("legalLastName") && <p className="text-[11px] text-[#ef4444]">{err("legalLastName")}</p>}
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Second Surname</FieldLabel>
          <Input placeholder="Enter surname" className={inputClass} {...form.register("secondSurname")} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <FieldLabel required>Email</FieldLabel>
          <Input type="email" placeholder="Enter email" className={inputClass} {...form.register("email")} />
          {err("email") && <p className="text-[11px] text-[#ef4444]">{err("email")}</p>}
        </div>
        <div className="space-y-1.5">
          <FieldLabel required>Date Of Birth</FieldLabel>
          <div className="relative">
            <Input type="date" className={`${inputClass} pr-9 [&::-webkit-calendar-picker-indicator]:opacity-0`} {...form.register("dateOfBirth")} />
            <Calendar size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          </div>
          {err("dateOfBirth") && <p className="text-[11px] text-[#ef4444]">{err("dateOfBirth")}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1 text-[11.5px] font-semibold text-[#0f172a] leading-none">Country <span className="text-[#EF4444]">*</span></Label>
          <div className="relative">
            <button type="button" onClick={() => setCountryOpen((v) => !v)} className="flex h-[42px] w-full items-center justify-between rounded-[12px] border border-[#eef2f7] bg-white px-3.5 text-[13px] shadow-sm">
              <span className="font-medium text-[#0f172a]">{COUNTRY_NAME_MAP[country] ?? country ?? "Select country"}</span>
              {country ? <span onClick={(ev) => { ev.stopPropagation(); form.setValue("country", "" as unknown as string); setCountryOpen(false); }} className="grid h-5 w-5 place-items-center rounded-full hover:bg-slate-100"><X size={12} className="text-[#64748b]" /></span> : null}
            </button>
            {countryOpen && (
              <div className="absolute left-0 right-0 top-[46px] z-20 rounded-[12px] border border-[#e9eef5] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] overflow-hidden max-h-[280px] overflow-y-auto">
                {COUNTRY_OPTIONS.map((c) => (
                  <button key={c.value} type="button" onClick={() => { form.setValue("country", c.value, { shouldValidate: true }); setCountryOpen(false); }} className={`flex w-full px-3.5 py-2.5 text-left text-[13px] hover:bg-[#f1f5ff] ${country === c.value ? "bg-[#eaf1ff] font-semibold" : ""}`}>{c.label}</button>
                ))}
              </div>
            )}
          </div>
          {err("country") && <p className="text-[11px] text-[#ef4444]">{err("country")}</p>}
        </div>
        <div className="space-y-1.5">
          <FieldLabel required>Phone Number</FieldLabel>
          <Controller
            name="phone"
            control={form.control}
            render={({ field }) => (
              <PhoneInput
                value={field.value ?? ""}
                onChange={(v) => field.onChange(v)}
                onBlur={field.onBlur}
                initialCountry={country.toLowerCase()}
                onCountryChange={(iso2) => {
                  form.setValue("country", iso2.toUpperCase(), { shouldValidate: true });
                }}
                error={!!err("phone")}
                placeholder={country === "US" ? "(201) 555-0123" : "Enter phone number"}
                className="h-[42px] rounded-[12px] !border-[#eef2f7] bg-white text-[13px] shadow-sm"
              />
            )}
          />
          {err("phone") && <p className="text-[11px] text-[#ef4444]">{err("phone")}</p>}
        </div>
      </div>

      {isUS ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1 text-[11.5px] font-semibold text-[#0f172a] leading-none">Document ID<span className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#e2e8f0] text-[#94a3b8]"><Info size={10} className="h-2.5 w-2.5" /></span></Label>
            <Input placeholder="Enter SSN" className={inputClass} {...form.register("documentId")} />
          </div>
          <div className="space-y-1.5">
            <FieldLabel required>Address</FieldLabel>
            <Input placeholder="Enter address" className={inputClass} {...form.register("address")} />
            {err("address") && <p className="text-[11px] text-[#ef4444]">{err("address")}</p>}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FieldLabel required>International Document ID</FieldLabel>
              <Input placeholder="Enter document ID (e.g., passport number)" className={inputClass} {...form.register("intDocId")} />
              {err("intDocId") && <p className="text-[11px] text-[#ef4444]">{err("intDocId")}</p>}
            </div>
            <div className="space-y-1.5">
              <FieldLabel required>International Document Type</FieldLabel>
              <Select value={form.watch("intDocType") ?? ""} onValueChange={(v) => form.setValue("intDocType", v, { shouldValidate: true })}>
                <SelectTrigger className="h-[42px] rounded-[12px] border-[#eef2f7] bg-white px-3.5 text-[13px] shadow-sm data-[placeholder]:text-[#9aa3b2] focus:ring-[#017BFD]/20 focus:border-[#017BFD]">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent className="rounded-[12px]">
                  {INT_DOC_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {err("intDocType") && <p className="text-[11px] text-[#ef4444]">{err("intDocType")}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FieldLabel required>Address</FieldLabel>
              <Input placeholder="Enter address" className={inputClass} {...form.register("address")} />
              {err("address") && <p className="text-[11px] text-[#ef4444]">{err("address")}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-[11.5px] font-semibold text-[#0f172a] leading-none">Apt/Suite<span className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#e2e8f0] text-[#94a3b8]"><Info size={10} className="h-2.5 w-2.5" /></span></Label>
              <Input placeholder="Enter Apt/Suite (optional)" className={inputClass} {...form.register("aptSuite")} />
            </div>
          </div>
        </>
      )}

      {isUS && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1 text-[11.5px] font-semibold text-[#0f172a] leading-none">Apt/Suite<span className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#e2e8f0] text-[#94a3b8]"><Info size={10} className="h-2.5 w-2.5" /></span></Label>
            <Input placeholder="Enter Apt/Suite (optional)" className={inputClass} {...form.register("aptSuite")} />
          </div>
          <div className="space-y-1.5">
            <FieldLabel required>{isUS ? "ZIP Code" : "ZIP / Postal Code"}</FieldLabel>
            <Input placeholder={isUS ? "Enter ZIP code" : "Enter ZIP / postal code"} className={inputClass} {...form.register("zipCode")} />
            {err("zipCode") && <p className="text-[11px] text-[#ef4444]">{err("zipCode")}</p>}
          </div>
        </div>
      )}
      {!isUS && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <FieldLabel required>ZIP / Postal Code</FieldLabel>
            <Input placeholder="Enter ZIP / postal code" className={inputClass} {...form.register("zipCode")} />
            {err("zipCode") && <p className="text-[11px] text-[#ef4444]">{err("zipCode")}</p>}
          </div>
          <div className="space-y-1.5 hidden sm:block" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <FieldLabel required>City</FieldLabel>
          <Input placeholder="Enter city" className={inputClass} {...form.register("city")} />
          {err("city") && <p className="text-[11px] text-[#ef4444]">{err("city")}</p>}
        </div>
        <div className="space-y-1.5">
          {isUS ? (
            <>
              <FieldLabel required>State</FieldLabel>
              <Select value={form.watch("state") ?? ""} onValueChange={(v) => form.setValue("state", v, { shouldValidate: true })}>
                <SelectTrigger className="h-[42px] rounded-[12px] border-[#eef2f7] bg-white px-3.5 text-[13px] shadow-sm data-[placeholder]:text-[#9aa3b2] focus:ring-[#017BFD]/20 focus:border-[#017BFD]">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="rounded-[12px]">
                  {US_STATES.map((s) => <SelectItem key={s.code} value={s.code}>{s.name} ({s.code})</SelectItem>)}
                </SelectContent>
              </Select>
              {err("state") && <p className="text-[11px] text-[#ef4444]">{err("state")}</p>}
            </>
          ) : (
            <>
              <Label className="flex items-center gap-1 text-[11.5px] font-semibold text-[#0f172a] leading-none">State/Province/Region<span className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#e2e8f0] text-[#94a3b8]"><Info size={10} className="h-2.5 w-2.5" /></span></Label>
              <Input placeholder="Enter state/province/region (optional)" className={inputClass} {...form.register("state")} />
            </>
          )}
        </div>
      </div>

      <label className="flex items-start gap-2.5 pt-3 cursor-pointer select-none">
        <span className={`mt-0.5 grid h-[16px] w-[16px] shrink-0 place-items-center rounded-full border pointer-events-none ${form.watch("terms1") ? "bg-[#017BFD] border-[#017BFD]" : "bg-white border-[#cbd5e1]"} transition-colors`}>
          {form.watch("terms1") && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
        </span>
        <input type="checkbox" checked={!!form.watch("terms1")} onChange={(e) => form.setValue("terms1", e.target.checked, { shouldValidate: true })} className="sr-only" />
        <span className="text-[12px] leading-[1.5] text-[#334155]">I attest that the information and documentation submitted herein is complete, correct, and accurate to the best of my knowledge</span>
      </label>
      {err("terms1") && <p className="text-[11px] text-[#ef4444]">{err("terms1")}</p>}

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={!!submitting} className="h-[36px] rounded-[8px] bg-[#6aa8ff] hover:bg-[#4d95ff] active:bg-[#3d8aff] text-white text-[12.5px] font-semibold px-5 gap-1.5 shadow-sm">
          <UserPlus size={14} className="text-white" />
          {submitting ? "Saving..." : "Save Payee"}
        </Button>
      </div>
      {countryOpen && <button aria-label="Close country dropdown" className="fixed inset-0 z-10 cursor-default" onClick={() => setCountryOpen(false)} tabIndex={-1} />}
    </form>
  );
}
