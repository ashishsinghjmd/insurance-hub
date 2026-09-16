"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Check, Info, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { juiceFetch } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Notice } from "@/components/portal-shell";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri",
  "Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

const STATE_CODE: Record<string, string> = {
  Alabama:"AL",Alaska:"AK",Arizona:"AZ",Arkansas:"AR",California:"CA",Colorado:"CO",Connecticut:"CT",Delaware:"DE",Florida:"FL",Georgia:"GA",Hawaii:"HI",Idaho:"ID",Illinois:"IL",Indiana:"IN",Iowa:"IA",Kansas:"KS",Kentucky:"KY",Louisiana:"LA",Maine:"ME",Maryland:"MD",Massachusetts:"MA",Michigan:"MI",Minnesota:"MN",Mississippi:"MS",Missouri:"MO",Montana:"MT",Nebraska:"NE",Nevada:"NV","New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND",Ohio:"OH",Oklahoma:"OK",Oregon:"OR",Pennsylvania:"PA","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD",Tennessee:"TN",Texas:"TX",Utah:"UT",Vermont:"VT",Virginia:"VA",Washington:"WA","West Virginia":"WV",Wisconsin:"WI",Wyoming:"WY",
};
const COUNTRY_CODE: Record<string, string> = { "United States":"US", Canada:"CA", Mexico:"MX", "United Kingdom":"GB", Australia:"AU" };

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
import NewPayeeForm from "@/components/forms/NewPayeeForm";
import { createPayee } from "@/lib/services/payee-service";
import type { PayeeFormData } from "@/lib/forms/constants/payeeFormConstants";

export default function NewPayeePage() {
  const router = useRouter();
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [successName, setSuccessName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const handleSubmit = async (data: PayeeFormData) => {
    setError(null);
    setSuccessName(null);
    setSubmitting(true);
    try {
      const rpid = await createPayee(data);
      setSuccessName(`${data.legalFirstName} ${data.legalLastName}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = setTimeout(() => {
        router.push(rpid ? `/insurance/add?rpid=${encodeURIComponent(rpid)}` : "/insurance/add");
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save payee");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="portal-content">
      <div className="mx-auto max-w-[980px]">
        {successName && (
          <div className="mb-4">
            <Notice kind="success">
              <span className="flex items-center gap-2">
                <Check size={14} className="text-[hsl(var(--chart-2))]" />
                Payee <b>{successName}</b> saved successfully.
              </span>
            </Notice>
          </div>
        )}
        {error && (
          <div className="mb-4">
            <Notice kind="error">{error}</Notice>
          </div>
        )}

        <div className="bg-[#f8f9fc] sm:bg-white rounded-[16px] border border-[#e9eef5] shadow-[0_2px_12px_rgba(16,23,41,0.04)] p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-6">
            <span className="h-[22px] w-[12px] rounded-[4px] bg-[#017BFD] inline-block shrink-0" />
            <h1 className="text-[17px] font-bold tracking-tight text-[#0f172a]">New Payee</h1>
          </div>
          <NewPayeeForm onSubmit={handleSubmit} submitting={submitting} />
        </div>
      </div>
    </div>
  );
}
