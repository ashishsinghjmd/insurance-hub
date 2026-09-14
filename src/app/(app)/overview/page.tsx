"use client";

import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0";
import { ArrowRight, FileText, LifeBuoy, ShieldCheck, TrendingUp } from "lucide-react";
import { Button, Card, Head, Tag } from "@/components/shell";
import { useRoles } from "@/hooks/use-role";

const stats = [
  { label: "Active Policies", value: "1,234", sub: "+12% this quarter", icon: ShieldCheck },
  { label: "Pending Claims", value: "56", sub: "-8% this week", icon: FileText },
  { label: "Total Premiums", value: "$2.4M", sub: "+5% YoY", icon: TrendingUp },
  { label: "Claims Paid", value: "$890K", sub: "68% of total", icon: LifeBuoy },
];

const recentPolicies = [
  { id: "POL-10342", name: "John Carter", type: "Auto", status: "Active", premium: "$1,240/yr" },
  { id: "POL-10341", name: "Sarah Kim", type: "Home", status: "Active", premium: "$2,100/yr" },
  { id: "POL-10340", name: "David Lee", type: "Life", status: "Pending", premium: "$890/yr" },
  { id: "POL-10339", name: "Maria Gomez", type: "Auto", status: "Active", premium: "$1,180/yr" },
  { id: "POL-10338", name: "James Wong", type: "Health", status: "Lapsed", premium: "$3,400/yr" },
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading } = useUser();
  const { role } = useRoles();

  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="portal-content">
      <Head
        eyebrow="Insurance operations / overview"
        title="Policy management at a glance."
        text="Manage policies, track claims, and monitor your portfolio across every customer."
        action={
          <Button variant="default" onClick={() => {}}>
            <ShieldCheck size={14} /> New Policy
          </Button>
        }
      />

      {mounted && (
        <Card style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>User Info (Debug)</h2>
          {isLoading ? (
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Loading user info…</div>
          ) : user ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, fontSize: 12 }}>
              <div><span style={{ color: "var(--muted-foreground)" }}>Name:</span> {user.name || "—"}</div>
              <div><span style={{ color: "var(--muted-foreground)" }}>Nickname:</span> {user.nickname || "—"}</div>
              <div><span style={{ color: "var(--muted-foreground)" }}>Given Name:</span> {user.given_name || "—"}</div>
              <div><span style={{ color: "var(--muted-foreground)" }}>Family Name:</span> {user.family_name || "—"}</div>
              <div><span style={{ color: "var(--muted-foreground)" }}>Email:</span> {user.email || "—"}{user.email_verified ? " ✓" : ""}</div>
              <div><span style={{ color: "var(--muted-foreground)" }}>Picture:</span> {user.picture ? <a href={user.picture} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>{user.picture}</a> : "—"}</div>
              <div><span style={{ color: "var(--muted-foreground)" }}>User ID:</span> <code style={{ fontSize: 11 }}>{user.sub || "—"}</code></div>
              <div><span style={{ color: "var(--muted-foreground)" }}>Org ID:</span> {user.org_id || "—"}</div>
              <div><span style={{ color: "var(--muted-foreground)" }}>Role:</span> {role || "—"}</div>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>No user data available.</div>
          )}
          {user && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ fontSize: 11, cursor: "pointer", color: "var(--muted-foreground)" }}>Raw JSON</summary>
              <pre style={{ fontSize: 10, background: "var(--muted)", padding: 8, borderRadius: 4, overflow: "auto", maxHeight: 300, marginTop: 8 }}>
                {JSON.stringify(user, null, 2)}
              </pre>
            </details>
          )}
        </Card>
      )}

      <div className="portal-grid portal-grid-4" style={{ marginBottom: 24 }}>
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="portal-stat-icon">
              <stat.icon size={16} />
            </div>
            <div className="portal-stat-value">{stat.value}</div>
            <div className="portal-stat-label">{stat.label}</div>
            <div className="portal-stat-sub">{stat.sub}</div>
          </Card>
        ))}
      </div>

      <div className="portal-section-head">
        <h2>Recent policies</h2>
        <Tag variant="primary">5 updated</Tag>
      </div>

      <section className="portal-card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-left">
              {["Policy #", "Policyholder", "Type", "Status", "Premium", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentPolicies.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 font-mono">{p.id}</td>
                <td className="px-4 py-3 font-semibold">{p.name}</td>
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

      <div className="portal-footer text-center text-xs text-muted-foreground" style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        Insurance Hub &copy; 2026 &middot; Internal preview build
      </div>
    </div>
  );
}
