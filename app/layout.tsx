import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Olympeaks — Reach Your Peak Performance",
  description: "Intelligence for endurance athletes. Train smarter. Reach higher.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}