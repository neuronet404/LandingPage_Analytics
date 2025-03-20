"use client";
import Header from "@/components/canvas/Header";
import Toolbar from "@/components/Toolbar";
import Sidebar from "@/components/pdfcomponents/sidebar";
import { useSettings } from "@/context/SettingsContext";
import { ToggleHeader } from "@/components/ToggleHeader";
import WorkspaceGuard from "@/components/Space";
import CheckIndices from "@/components/chat/CheckIndices";
import { useState } from "react";

export default function Layout({ children }: any) {
  const { currentView } = useSettings();
  const [mode, setMode] = useState("")
  return (
    <div className="max-h-screen w-[100vw] overflow-hidden ">
      <Header updatedMode={(value) => setMode(value)} mode={mode} />
      {children}
      <Sidebar mode={mode} />
      <CheckIndices />
      {/* <ToggleHeader/> */}
      {!(currentView === "chat") && <Toolbar />}
    </div>
  );
}
