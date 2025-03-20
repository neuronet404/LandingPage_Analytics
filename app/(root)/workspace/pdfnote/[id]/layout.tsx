"use client"
import Header from "@/components/canvas/Header";
import Toolbar from "@/components/Toolbar";
import Sidebar from "@/components/pdfcomponents/sidebar";
import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { ToggleHeader } from "@/components/ToggleHeader";

export default function Layout({ children }: any) {
  return (
    <div className="max-h-screen w-[100vw] overflow-hidden relative">
      {children}
      
      {/* <Toolbar /> */}
      {/* <Sidebar  /> */}
    </div>
  );
}


