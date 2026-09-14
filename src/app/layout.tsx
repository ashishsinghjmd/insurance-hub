import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import "./portal.css";

export const metadata: Metadata = {
  title: "Insurance Hub",
  description: "Insurance Policy & Claims Platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
