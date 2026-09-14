"use client";

import { ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, FormRow, Head, Notice } from "@/components/shell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { juiceFetch } from "@/lib/api";

export default function NewClaimPage() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    policyId: "",
    type: "",
    amount: "",
    incidentDate: "",
    description: "",
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        firstName: "Claim",
        lastName: "User",
        dateOfBirth: "1990-01-01",
        docId: "123456789",
        docType: "SSN",
        email: "claim.user@example.com",
        phone: "5551234567",
        addressLine1: "123 Main St",
        city: "Chicago",
        state: "IL",
        zip: "60601",
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
      setSaved(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to file claim");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="portal-content">
      <button className="portal-back-link" onClick={() => router.push("/claims")}>
        <ArrowLeft size={14} /> Back to claims
      </button>

      <Head
        eyebrow="Claims / create"
        title="File a claim"
        text="Register a new claim against an existing policy."
      />

      {saved && (
        <Notice kind="success">
          <Check size={14} /> Claim filed successfully.
        </Notice>
      )}
      {error && <Notice kind="error">{error}</Notice>}

      <form onSubmit={submit}>
        <section className="portal-card" style={{ maxWidth: 720 }}>
          <div className="portal-form-divider">Claim details</div>

          <div className="portal-request-params">
            <FormRow label="Policy number" hint="The policy this claim is filed against.">
              <Input
                required
                value={form.policyId}
                onChange={(e) => setForm({ ...form, policyId: e.target.value })}
                placeholder="e.g. POL-10342"
              />
            </FormRow>
            <FormRow label="Claim type">
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto">Auto</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Life">Life</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>
            <FormRow label="Claim amount">
              <Input
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. $4,200"
              />
            </FormRow>
            <FormRow label="Incident date">
              <Input
                required
                type="date"
                value={form.incidentDate}
                onChange={(e) => setForm({ ...form, incidentDate: e.target.value })}
              />
            </FormRow>
          </div>

          <FormRow label="Description" hint="Describe the incident and what happened.">
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide a detailed account of the incident..."
            />
          </FormRow>

          <div className="portal-btn-row" style={{ marginTop: 16 }}>
            <Button type="submit" variant="default" disabled={submitting}>
              {submitting ? "Filing..." : "File claim"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.push("/claims")}>
              Cancel
            </Button>
          </div>
        </section>
      </form>
    </div>
  );
}
