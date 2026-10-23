
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PartyBox! — Make Someone's Day",
  description:
    "One link, all your people, and a whole lot of love. Make a playful celebration box filled with wishes and memories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
