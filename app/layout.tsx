import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "./components/organisms/Sidebar";
import styles from "./layout.module.css";
import "./globals.css";

// next/font downloads the fonts at build time and bundles them, so the app works offline
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next Shortcut Manager",
  description: "All your installed games, from every launcher, in one place",
};

export const viewport: Viewport = {
  colorScheme: "dark light",
};

// Server Component: the shell (sidebar + page frame) is rendered to HTML at build time,
// so it paints before any JavaScript loads.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className={styles.shell}>
          <Sidebar />
          <main className={styles.main}>{children}</main>
        </div>
      </body>
    </html>
  );
}
