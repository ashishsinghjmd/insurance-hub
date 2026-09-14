import { Auth0Provider } from "@auth0/nextjs-auth0";
import { Shell } from "@/components/shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider>
      <Shell>{children}</Shell>
    </Auth0Provider>
  );
}
