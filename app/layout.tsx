import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { siteMetadata } from "./metadata";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import GlobalToastProvider from "@/components/GlobalToastProvider";
import KeyboardShortcutsModal from "@/components/KeyboardShortcutsModal";

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏍️</text></svg>" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          {children}
          <GlobalToastProvider />
          <KeyboardShortcutsModal />
        </ErrorBoundary>
      </body>
    </html>
  );
}
