import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "Community Events Board",
  description: "Find music nights, workshops, food fairs and more happening in your city.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <ToastProvider>
          <AuthProvider>
            <Header />
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
            <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-xs text-slate-400 sm:px-6">
              Community Events Board ·{" "}
              <Link href="/admin" className="underline-offset-2 hover:underline">
                Admin
              </Link>
            </footer>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
