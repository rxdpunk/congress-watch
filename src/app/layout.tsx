import type { Metadata } from "next";
import { Libre_Baskerville, Public_Sans } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Congress.Watch",
    template: "%s | Congress.Watch",
  },
  description:
    "A source-linked civic interface for tracking current members of Congress, their votes, their sponsored legislation, and their role in federal lawmaking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${publicSans.variable} ${libreBaskerville.variable}`}>
      <body>
        <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
