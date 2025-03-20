"use client"
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  
  useEffect(() => {
    // router.push('/dashboard');
  }, []); // Empty dependency array ensures this runs only once after initial render

  return (
    <main className="flex flex-col h-screen bg-light-400 dark:bg-[#262626]">
      {children}
    </main>
  );
};

export default Layout;