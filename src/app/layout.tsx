import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import "./globals.css";
import { AppLoader } from "@/components/ui/AppLoader";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "TxNB Esports - Creating Legends",
  description: "TxNB Esports — a cutting-edge gaming studio crafting immersive experiences",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} antialiased`}>
        <AppLoader>
          {children}
        </AppLoader>
      </body>
    </html>
  );
}
