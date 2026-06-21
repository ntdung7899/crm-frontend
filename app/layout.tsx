import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CRM - Quản lý quan hệ khách hàng",
  description: "Hệ thống CRM hiện đại để quản lý liên hệ, công ty và thương vụ",
  icons: {
    icon: "/logo-w.png",
    apple: "/logo-w.png",
  },
  verification: {
    other: {
      "zalo-platform-site-verification": "PlhW3kpgJ5GqdiD9z9LbK1Fhua__dJOGC3Sm",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
