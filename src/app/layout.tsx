import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "sonner";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "FixItNow - Your Trusted Home Service Platform",
  description: "Book professional technicians for home services in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bricolage.className} antialiased`}>
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
