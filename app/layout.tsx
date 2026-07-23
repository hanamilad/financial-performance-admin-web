import type { Metadata } from "next";
import { Cairo } from "next/font/google";

import { Providers } from "@/app/providers";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "منصة الأداء المالي",
  description: "لوحة إدارة منصة متابعة الأداء المالي والتشغيلي للمطاعم والكافيهات",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
