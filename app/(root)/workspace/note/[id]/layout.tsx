"use client";

import { useState, useEffect } from "react";
import Header from "@/components/canvas/Header";
import Toolbar from "@/components/Toolbar";
import Sidebar from "@/components/pdfcomponents/sidebar";
import { ToggleHeader } from "@/components/ToggleHeader";

export default function Layout({ children }: any) {
  const [isExpanded, setIsExpanded] = useState(true);
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);

  return (
    <div className="h-screen w-[100vw] overflow-hidden">

        <div style={{zIndex:100}} className="fixed">
        </div>
        {children}
        {/* <Sidebar isNote={false} /> */}
        {/* <Toolbar /> */}
        
    </div>
  );
}
