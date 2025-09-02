import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "لوحة تحكم شمرا - إدارة الأعمال",
  description: "نظام إدارة شامل للأعمال مع دعم كامل للغة العربية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
