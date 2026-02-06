import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MABDC - St. Francis Registrar Portal",
  description:
    "MABDC - St. Francis Registrar Portal is a comprehensive student records management system. Manage student data, track enrollment, and generate reports with ease.",
  keywords:
    "student records, school management, education, enrollment, student database, MABDC, STFXSA",
  openGraph: {
    title: "MABDC - St. Francis Registrar Portal",
    description:
      "Comprehensive student records management system for MABDC and St. Francis Xavier Smart Academy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D9488",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
