import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop";
import { ToastProvider } from "@/components/Toast";
import Providers from "./providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "TheJERKTracker - Restaurant Pickup Tracking",
  description: "A system for restaurants to track order pickups using QR codes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased font-sans`}
      >
        <Providers>
          <ToastProvider>
            <ScrollToTop />
            {children}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
