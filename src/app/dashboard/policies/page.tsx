"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, FilePlus2, Search } from "lucide-react";
import Link from "next/link";
import { Button, ErrorState, Head, Loading, Tag } from "@/components/shell";
import { Input } from "@/components/ui/input";

type Policy = {
  id: string;
  holder: string;
  type: string;
  status: "Active" | "Pending" | "Lapsed";
  premium: string;
  startDate: string;
};

const seedPolicies: Policy[] = [
  { id: "POL-10342", holder: "John Carter", type: "Auto", status: "Active", premium: "$1,240/yr", startDate: "2026-01-15" },
  { id: "POL-10341", holder: "Sarah Kim", type: "Home", status: "Active", premium: "$2,100/yr", startDate: "2025-11-02" },
  { id: "POL-10340", holder: "David Lee", type: "Life", status: "Pending", premium: "$890/yr", startDate: "2026-02-20" },
  { id: "POL-10339", holder: "Maria Gomez", type: "Auto", status: "Active", premium: "$1,180/yr", startDate: "2024-08-11" },
  { id: "POL-10338", holder: "James Wong", type: "Health", status: "Lapsed", premium: "$3,400/yr", startDate: "2023-05-30" },
  { id: "POL-10337", holder: "Anna Petrova", type: "Home", status: "Active", premium: "$2,450/yr", startDate: "2025-04-18" },
  { id: "POL-10336", holder: "Robert Smith", type: "Life", status: "Active", premium: "$720/yr", startDate: "2024-12-09" },
  { id: "POL-10335", holder: "Emily Davis", type: "Auto", status: "Pending", premium: "$1,320/yr", startDate: "2026-03-01" },
];

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [query, setQuery] = useState("");
  const [problem] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPolicies(seedPolicies);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const shown = useMemo(
    () =>
      policies.filter((p) =>
        `${p.id} ${p.holder} ${p.type}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [policies, query],
  );

  return (
    <div className="portal-content">
      <Head
        eyebrow="Policies / portfolio"
        title="Policy portfolio"
        text="Browse and manage every insurance policy in your book of business."
        action={
          <Link href="/dashboard/policies/new">
            <Button variant="default">
              <FilePlus2 size={14} /> New Policy
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
                placeholder="Search policy, holder, or type…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Tag variant="primary">{shown.length} policies</Tag>
          </div>

          <section className="portal-card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Policy #", "Policyholder", "Type", "Status", "Premium", "Start date", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-mono">{p.id}</td>
                    <td className="px-4 py-3 font-semibold">{p.holder}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                    <td className="px-4 py-3">
                      <Tag
                        variant={
                          p.status === "Active" ? "success" :
                          p.status === "Pending" ? "warning" : "error"
                        }
                      >
                        {p.status}
                      </Tag>
                    </td>
                    <td className="px-4 py-3 font-mono">{p.premium}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.startDate}</td>
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
              <h3>No policies found</h3>
              <p>Try adjusting your search criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
