import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "bulma/css/bulma.min.css";
import Navbar from "./components/atoms/Navbar";

import "./lib/fontawesome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "next-shortcut-manager",
  description: "A next.js powered way to sort shortcuts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
