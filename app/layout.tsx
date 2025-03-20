import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { ToastContainer } from 'react-toastify'
import { Toaster } from "@/components/ui/sonner"

import { SettingsProvider } from "@/context/SettingsContext";
import WorkspaceGuard from "@/components/Space";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "FileManagement - Store your files in the cloud",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <SettingsProvider>
      <html lang="en">
        <body className={`${poppins.variable} font-poppins antialiased `}>
          {/* <Toaster position="top-right" richColors /> */}
          <ToastContainer style={{ zIndex: 9999 }} />
          {children}

          {/* <WorkspaceGuard/> */}
        </body>
      </html>
    </SettingsProvider>
  );
}
