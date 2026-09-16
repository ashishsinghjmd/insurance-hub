import { Auth0Provider } from "@auth0/nextjs-auth0";
import { PortalShell } from "@/components/portal-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider>
      <PortalShell>{children}</PortalShell>
    </Auth0Provider>
  );
}
