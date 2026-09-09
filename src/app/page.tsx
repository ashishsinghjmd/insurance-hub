"use client";

import { ArrowRight, FileText, LifeBuoy, ShieldCheck, TrendingUp } from "lucide-react";
import { Button, Card, Head, Tag } from "@/components/shell";

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
