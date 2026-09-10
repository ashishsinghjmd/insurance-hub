"use client";

import { ArrowRight, Shield, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid hsl(var(--border))" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", display: "grid", placeItems: "center" }}>
            <ShieldCheck size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>Insurance Hub</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/auth/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </a>
          <a href="/auth/login">
            <Button variant="default" size="sm">Sign up</Button>
          </a>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 32px" }}>
        <div style={{ textAlign: "center", maxWidth: 600 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))", borderRadius: 20, padding: "4px 14px", fontSize: 11, fontWeight: 600, marginBottom: 24 }}>
            <Shield size={12} /> Policy & Claims Platform
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 16px" }}>
            Insurance management
            <br />
            <span style={{ color: "hsl(var(--primary))" }}>made simple</span>
          </h1>
          <p style={{ color: "hsl(var(--muted-foreground))", fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 32px" }}>
            Manage policies, track claims, and monitor your portfolio across every customer. Built for insurance operations teams.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/auth/login">
              <Button variant="default" size="lg">
                Get started <ArrowRight size={14} />
              </Button>
            </a>
            <a href="/auth/login">
              <Button variant="outline" size="lg">
                <UserPlus size={14} /> Create account
              </Button>
            </a>
          </div>
        </div>
      </main>

      <footer style={{ padding: "20px 32px", borderTop: "1px solid hsl(var(--border))", textAlign: "center", fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
        Insurance Hub &copy; 2026 &middot; Internal preview build
      </footer>
    </div>
  );
}
