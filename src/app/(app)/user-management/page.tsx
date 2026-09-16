"use client";

import { Head, Tag } from "@/components/portal-shell";
import { RoleGuard } from "@/components/role-guard";
import { useRoles } from "@/hooks/use-role";
import { Users, ShieldCheck, Activity, FileText } from "lucide-react";

const mockUsers = [
  { name: "John Carter", email: "john@example.com", role: "Default User", status: "Active", lastLogin: "2026-09-10" },
  { name: "Sarah Kim", email: "sarah@example.com", role: "Admin", status: "Active", lastLogin: "2026-09-09" },
  { name: "David Lee", email: "david@example.com", role: "Default User", status: "Active", lastLogin: "2026-09-08" },
  { name: "Maria Gomez", email: "maria@example.com", role: "Default User", status: "Inactive", lastLogin: "2026-08-15" },
  { name: "James Wong", email: "james@example.com", role: "Admin", status: "Active", lastLogin: "2026-09-10" },
];

const stats = [
  { label: "Total Users", value: "5", icon: Users },
  { label: "Admins", value: "2", icon: ShieldCheck },
  { label: "Active", value: "4", icon: Activity },
  { label: "Inactive", value: "1", icon: FileText },
];

export default function UserManagementPage() {
  useRoles();

  return (
    <RoleGuard requiredRole="Admin">
      <div className="portal-content">
        <Head
          eyebrow="Admin / users"
          title="User Management"
          text="Manage users, roles, and permissions across the platform."
        />

        <div className="portal-grid portal-grid-4" style={{ marginBottom: 24 }}>
          {stats.map((stat) => (
            <div key={stat.label} className="portal-card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <stat.icon size={14} style={{ color: "hsl(var(--primary))" }} />
                <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", fontWeight: 500 }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.05em" }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="portal-section-head">
          <h2>All Users</h2>
          <Tag variant="primary">{mockUsers.length} users</Tag>
        </div>

        <section className="portal-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left">
                {["Name", "Email", "Role", "Status", "Last Login"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((u) => (
                <tr key={u.email} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-semibold">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <Tag variant={u.role === "Admin" ? "primary" : "default"}>{u.role}</Tag>
                  </td>
                  <td className="px-4 py-3">
                    <Tag variant={u.status === "Active" ? "success" : "error"}>{u.status}</Tag>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </RoleGuard>
  );
}
