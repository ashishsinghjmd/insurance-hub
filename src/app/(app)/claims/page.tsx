"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, FilePlus2, Search } from "lucide-react";
import Link from "next/link";
import { Button, ErrorState, Head, Loading, Tag } from "@/components/portal-shell";
import { Input } from "@/components/ui/input";

type Claim = {
  id: string;
  policyId: string;
  holder: string;
  type: string;
  amount: string;
  status: "Submitted" | "In Review" | "Approved" | "Denied";
  filedDate: string;
};

const seedClaims: Claim[] = [
  { id: "CLM-2041", policyId: "POL-10342", holder: "John Carter", type: "Auto", amount: "$4,200", status: "In Review", filedDate: "2026-08-28" },
  { id: "CLM-2040", policyId: "POL-10341", holder: "Sarah Kim", type: "Home", amount: "$12,800", status: "Submitted", filedDate: "2026-09-02" },
  { id: "CLM-2039", policyId: "POL-10337", holder: "Anna Petrova", type: "Home", amount: "$3,150", status: "Approved", filedDate: "2026-08-15" },
  { id: "CLM-2038", policyId: "POL-10335", holder: "Emily Davis", type: "Auto", amount: "$980", status: "Denied", filedDate: "2026-07-22" },
  { id: "CLM-2037", policyId: "POL-10336", holder: "Robert Smith", type: "Life", amount: "$50,000", status: "In Review", filedDate: "2026-08-10" },
  { id: "CLM-2036", policyId: "POL-10339", holder: "Maria Gomez", type: "Auto", amount: "$2,350", status: "Approved", filedDate: "2026-07-30" },
];

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [query, setQuery] = useState("");
  const [problem] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClaims(seedClaims);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const shown = useMemo(
    () =>
      claims.filter((c) =>
        `${c.id} ${c.policyId} ${c.holder} ${c.type}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [claims, query],
  );

  return (
    <div className="portal-content">
      <Head
        eyebrow="Claims / processing"
        title="Claims queue"
        text="Track and process every claim filed against your policies."
        action={
          <Link href="/claims/new">
            <Button variant="default">
              <FilePlus2 size={14} /> New Claim
            </Button>
          </Link>
        }
      />

      {problem && <ErrorState message={problem} />}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="portal-toolbar">
            <div style={{ position: "relative", display: "flex", alignItems: "center", maxWidth: 440 }}>
              <Search size={13} style={{ position: "absolute", left: 10, color: "hsl(var(--muted-foreground))", pointerEvents: "none", zIndex: 1 }} />
              <Input
                className="pl-8 w-full"
                placeholder="Search claim, policy, or holder…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Tag variant="primary">{shown.length} claims</Tag>
          </div>

          <section className="portal-card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Claim #", "Policy", "Policyholder", "Type", "Amount", "Status", "Filed", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-mono">{c.id}</td>
                    <td className="px-4 py-3 font-mono">{c.policyId}</td>
                    <td className="px-4 py-3 font-semibold">{c.holder}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.type}</td>
                    <td className="px-4 py-3 font-mono">{c.amount}</td>
                    <td className="px-4 py-3">
                      <Tag
                        variant={
                          c.status === "Approved" ? "success" :
                          c.status === "Denied" ? "error" :
                          c.status === "In Review" ? "warning" : "default"
                        }
                      >
                        {c.status}
                      </Tag>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.filedDate}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm">
                        View <ArrowRight size={12} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {!shown.length && (
            <div className="portal-empty">
              <Search size={24} />
              <h3>No claims found</h3>
              <p>Try adjusting your search criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
