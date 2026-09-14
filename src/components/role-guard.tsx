"use client";

import { ShieldCheck } from "lucide-react";
import { useRoles } from "@/hooks/use-role";

export function RoleGuard({ children, requiredRole = "Admin" }: { children: React.ReactNode; requiredRole?: string }) {
  const { role, loading } = useRoles();

  if (loading) {
    return (
      <div className="portal-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
        <div style={{ textAlign: "center", color: "hsl(var(--muted-foreground))" }}>
          <ShieldCheck size={24} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
          <p style={{ fontSize: 12 }}>Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (role !== requiredRole) {
    return (
      <div className="portal-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
        <div style={{ textAlign: "center", color: "hsl(var(--muted-foreground))" }}>
          <ShieldCheck size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "hsl(var(--foreground))", margin: "0 0 6px" }}>Access Denied</h2>
          <p style={{ fontSize: 12 }}>You need the <strong>{requiredRole}</strong> role to view this page.</p>
          <p style={{ fontSize: 11, marginTop: 4 }}>Your current role: <strong>{role}</strong></p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
