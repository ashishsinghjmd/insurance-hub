import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Shell } from "@/components/shell";
import "./globals.css";
import "./portal.css";

export const metadata: Metadata = {
  title: "Insurance Hub",
  description: "Insurance Policy & Claims Platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Shell>{children}</Shell>
        </ThemeProvider>
      </body>
    </html>
  );
}
