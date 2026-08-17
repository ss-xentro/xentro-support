import type { Metadata } from "next";
import "./globals.css";
import { ThemeManager } from "@/components/theme-manager";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Xentro Support",
  description: "Xentro Support & FAQ System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (window.location.pathname.startsWith('/admin')) {
                  document.documentElement.classList.add('dark')
                  document.documentElement.style.colorScheme = 'dark'
                } else {
                  document.documentElement.classList.remove('dark')
                  document.documentElement.classList.add('light')
                  document.documentElement.style.colorScheme = 'light'
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeManager />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
