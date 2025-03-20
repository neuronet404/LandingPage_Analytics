"use client";
import React, { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
import Header from "@/components/Header";
// import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import TodoList from "@/components/Todo";
import { useSettings } from "@/context/SettingsContext";
import { ToastContainer } from "react-toastify";

export const dynamic = "force-dynamic";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const currentUser = {}; //await getCurrentUser();
  // if (!currentUser) return redirect("/sign-in");

  return (
    <main className="flex flex-col h-screen bg-light-400 dark:bg-[#262626] w-screen md:pt-28 pt-14">
      {/* Fixed Header */}
      <div className="z-50 w-full bg-white dark:bg-[#262626] fixed top-0">
        <div className="md:hidden">
          <MobileNavigation {...currentUser} />
        </div>
        <div className="hidden md:block bg-green">
          <Header userId={10} accountId={10} />
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden  -mt-8">
        {/* Sidebar */}
        <div className="w-auto hidden md:block ">
          <Sidebar {...currentUser} />
        </div>

        {/* Scrollable Content Section */}
        {/* <ToastContainer style={{ zIndex: 9999 }} /> */}
        <section
          className="relative flex-1 h-full px-8  md:mb-6 md:py-8
                          overflow-y-auto no-scrollbar  dark:border-0 border-[#5E5F5F]"
        >
          {children}
        </section>

        {/* Right Panel - To-Do List */}
        <div className="hidden xl:block w-[280px] mr-6 mt-8 flex-shrink-0">
          <TodoList />
        </div>
        {/* shadcn sheet  https://ui.shadcn.com/docs/components/sheet*/}
      </div>
    </main>
  );
};

export default Layout;
