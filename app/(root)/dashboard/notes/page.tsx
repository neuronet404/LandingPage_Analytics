"use client";
import FlashCards from "@/components/notes/FlashCards";
import SubjectsFiles from "@/components/pdf/SubjectFiles";
import React, { useEffect } from "react";
import SubjectRecentNotes from "@/components/notes/SubjectRecentNotes";
import FileGridSystem from "@/components/pdf/File";

const Page = () => {
  useEffect(() => {
    // Prevent scrolling to top on re-render
    window.history.scrollRestoration = "manual";
  }, []);

  return (
    // Container with fixed height, internal scrolling disabled
    <div className="w-full overflow-hidden font-rubik">
      {/* Main content wrapper */}
      <div className="flex flex-col lg:flex-row">
        {/* Left and center content */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="mb-20">
            <SubjectRecentNotes />
          </div>

          {/* Responsive grid for FlashCards and SubjectsFiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="w-full">
              <FlashCards />
            </div>
            <div className="w-full">
              {/* <SubjectsFiles fileType="note" /> */}
              <FileGridSystem fileType="note" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
