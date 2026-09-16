"use client";

import { ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, FormRow, Head, Notice } from "@/components/portal-shell";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewPolicyPage() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    holder: "",
    email: "",
    type: "",
    coverage: "",
    premium: "",
    startDate: "",
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <div className="portal-content">
      <button className="portal-back-link" onClick={() => router.push("/policies")}>
        <ArrowLeft size={14} /> Back to policies
      </button>

      <Head
        eyebrow="Policies / create"
        title="Create a policy"
        text="Issue a new insurance policy for a policyholder."
      />

      {saved && (
        <Notice kind="success">
          <Check size={14} /> Policy created successfully.
        </Notice>
      )}

      <form onSubmit={submit}>
        <section className="portal-card" style={{ maxWidth: 720 }}>
          <div className="portal-form-divider">Policyholder</div>

          <div className="portal-request-params">
            <FormRow label="Full name">
              <Input
                required
                value={form.holder}
                onChange={(e) => setForm({ ...form, holder: e.target.value })}
                placeholder="e.g. John Carter"
              />
            </FormRow>
            <FormRow label="Email address">
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. john@email.com"
              />
            </FormRow>
          </div>

          <div className="portal-form-divider">Coverage</div>

          <div className="portal-request-params">
            <FormRow label="Policy type">
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
            <FormRow label="Coverage amount">
              <Input
                required
                value={form.coverage}
                onChange={(e) => setForm({ ...form, coverage: e.target.value })}
                placeholder="e.g. $250,000"
              />
            </FormRow>
            <FormRow label="Annual premium" hint="Billed annually in advance.">
              <Input
                required
                value={form.premium}
                onChange={(e) => setForm({ ...form, premium: e.target.value })}
                placeholder="e.g. $1,240"
              />
            </FormRow>
            <FormRow label="Start date">
              <Input
                required
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </FormRow>
          </div>

          <div className="portal-btn-row" style={{ marginTop: 16 }}>
            <Button type="submit" variant="default">
              Create policy
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.push("/policies")}>
              Cancel
            </Button>
          </div>
        </section>
      </form>
    </div>
  );
}
