"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  CreditCard,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";

import { Button as DSButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card as DSCard } from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Table as DSTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export { Badge, Label, Skeleton };

export const nav = [
  { label: "Overview", path: "/", icon: LayoutDashboard, group: "Main" },
  { label: "Policies", path: "/policies", icon: FileText, group: "Main" },
  { label: "Claims", path: "/claims", icon: Activity, group: "Main" },
  { label: "Make Payment", path: "/make-payment", icon: CreditCard, group: "Payments" },
  { label: "New Payee", path: "/new-payee", icon: UserPlus, group: "Payee" },
  { label: "New Policy", path: "/policies/new", icon: UserPlus, group: "Actions" },
  { label: "New Claim", path: "/claims/new", icon: ShieldCheck, group: "Actions" },
];

function useActiveGroup(path: string) {
  const groups = ["Main", "Payments", "Payee", "Actions"];
  return groups;
}

export function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobile(false);
      }
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, []);

  const navigate = (next: string) => {
    setMobile(false);
    router.push(next);
  };

  const pageName =
    path === "/"
      ? "Overview"
      : path.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ?? "Insurance Hub";

  const groups = useActiveGroup(path);

  return (
    <div className="app-shell">
      <div className="noise" />
      {mobile && (
        <button
          className="portal-nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`portal-sidebar ${mobile ? "open" : ""}`}>
        <div className="portal-brand">
          <div className="portal-brand-identity">
            <div className="portal-brand-name">
              <div className="portal-brand-mark">
                <ShieldCheck size={16} />
              </div>
              <div className="portal-brand-title">Insurance Hub</div>
            </div>
            <small>Policy &amp; Claims Platform</small>
          </div>
          {mobile && (
            <button
              className="portal-icon-btn portal-nav-close"
              onClick={() => setMobile(false)}
              aria-label="Close navigation"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <nav>
          {groups.map((group) => (
            <div key={group} className="portal-nav-section">
              <div className="portal-nav-label">{group}</div>
              {nav
                .filter((item) => item.group === group)
                .map((item) => (
                  <NavItem key={item.path} {...item} current={path} onClick={() => navigate(item.path)} />
                ))}
            </div>
          ))}
        </nav>

        <div className="portal-sidebar-footer">
          <div className="portal-user-card">
            <div className="portal-user-avatar">IH</div>
            <div className="portal-user-meta">
              <div className="portal-user-name">Insurance User</div>
              <div className="portal-user-role">
                <span className="portal-status-dot" /> Active session
              </div>
            </div>
          </div>
          <button
            className="portal-signout"
            onClick={() => router.push("/")}
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-topbar">
          <button
            className="portal-icon-btn portal-mobile-menu"
            onClick={() => setMobile(true)}
            aria-label="Open navigation"
          >
            <Menu size={16} />
          </button>
          <div className="portal-breadcrumb">
            Insurance&nbsp;/&nbsp;<b>{pageName}</b>
          </div>
          <div className="portal-topbar-right">
            <span className="portal-kbd">v1.0</span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function NavItem({
  label,
  path,
  icon: Icon,
  current,
  onClick,
}: {
  label: string;
  path: string;
  icon: React.ElementType;
  current: string;
  onClick: () => void;
}) {
  const isActive = current === path || (path !== "/" && current.startsWith(path));
  return (
    <button
      className={`portal-nav-item ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

/* ── Design-system Button wrapper ── */
export const Button = ({
  children,
  type = "button",
  variant,
  size,
  className,
  ...props
}: React.ComponentProps<typeof DSButton> & { type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] }) => (
  <DSButton type={type} variant={variant} size={size} className={cn("text-xs", className)} {...props}>
    {children}
  </DSButton>
);

/* ── Design-system Card wrapper ── */
export const Card = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <DSCard className={cn("p-5", className)} {...props}>
    {children}
  </DSCard>
);

/* ── Page hero header ── */
export const Head = ({ eyebrow, title, text, action }: {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) => (
  <div className="portal-hero">
    <div>
      {eyebrow && <div className="portal-eyebrow">{eyebrow}</div>}
      <h1 style={{ fontSize: "clamp(22px, 3.5vw, 36px)", lineHeight: 1.1, letterSpacing: "-0.04em", margin: "0 0 8px", fontWeight: 800 }}>
        {title}
      </h1>
      {text && <p className="portal-hero-desc">{text}</p>}
    </div>
    {action && <div className="portal-hero-actions">{action}</div>}
  </div>
);

/* ── Loading state ── */
export function Loading({ label = "Loading data…" }: { label?: string }) {
  return (
    <DSCard className="p-6">
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "hsl(var(--muted-foreground))", fontSize: 12 }}>
        <Spinner className="size-3.5" />
        {label}
      </div>
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {[80, 60, 90, 50].map((w, i) => (
          <Skeleton key={i} style={{ height: 14, width: `${w}%` }} />
        ))}
      </div>
    </DSCard>
  );
}

/* ── Error state ── */
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <Alert variant="destructive" style={{ marginBottom: 16 }}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Request did not complete</AlertTitle>
      <AlertDescription>
        {message}
        {retry && (
          <div style={{ marginTop: 8 }}>
            <Button variant="secondary" size="sm" onClick={retry}>Retry</Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

/* ── Data table ── */
export const Table = ({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) => (
  <DSTable>
    <TableHeader>
      <TableRow>
        {headers.map((header) => (
          <TableHead key={header} className="text-xs uppercase tracking-wide">
            {header}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((row, rowIndex) => (
        <TableRow key={rowIndex}>
          {row.map((cell, cellIndex) => (
            <TableCell key={cellIndex} className="text-xs">
              {cell}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </DSTable>
);

/* ── Form row ── */
export const FormRow = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="portal-form-row">
    <Label className="portal-form-label">{label}</Label>
    {hint && <small className="portal-form-hint">{hint}</small>}
    {children}
  </div>
);

/* ── Tag / pill ── */
export function Tag({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "primary";
}) {
  const variantClass = {
    default: "bg-secondary text-secondary-foreground border-transparent",
    success: "bg-[hsl(var(--chart-2)/0.12)] text-[hsl(var(--chart-2))] border-transparent",
    warning: "bg-[hsl(var(--chart-4)/0.15)] text-[hsl(var(--chart-4))] border-transparent",
    error: "bg-destructive/10 text-destructive border-transparent",
    primary: "bg-primary/10 text-primary border-transparent",
  }[variant];
  return (
    <Badge className={cn("rounded-full text-[10px] font-semibold px-2 py-0.5", variantClass)}>
      {children}
    </Badge>
  );
}

/* ── Notice ── */
export function Notice({
  kind = "info",
  children,
}: {
  kind?: "info" | "success" | "error";
  children: React.ReactNode;
}) {
  return (
    <Alert
      variant={kind === "error" ? "destructive" : "default"}
      className={cn(
        "mb-4 text-xs",
        kind === "success" && "border-l-4 border-l-[hsl(var(--chart-2))] bg-[hsl(var(--chart-2)/0.04)]",
      )}
    >
      <AlertDescription className="flex items-start gap-2">
        {children}
      </AlertDescription>
    </Alert>
  );
}

/* ── Empty state ── */
export function Empty({ icon, title, text }: { icon?: React.ReactNode; title: string; text?: string }) {
  return (
    <div className="portal-empty">
      {icon}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
    </div>
  );
}
