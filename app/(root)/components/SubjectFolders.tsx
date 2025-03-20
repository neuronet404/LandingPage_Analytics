"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import FileSystem from "./FileSystem";
import expand from "@/public/assets/images/subjectexpand.svg";
import close from "@/public/assets/images/subjectclose.svg";

export default function SubjectFolders() {
  const [currentPath, setCurrentPath] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  return (
    <div className="rounded-lg w-full min-h-[274px] relative">
      <h1 className="text-xl sm:text-2xl font-semibold text-emerald-700   mb-4 flex justify-between items-center">
        Subjects
        <button
          onClick={toggleExpand}
          className="focus:outline-none hover:opacity-80 transition-opacity"
          aria-label={isExpanded ? "Close subjects" : "Expand subjects"}
        >
          <Image
            src={isExpanded ? close : expand}
            alt="expand-toggle"
            width={isMobile ? 24 : 30}
            height={isMobile ? 24 : 30}
            className="w-6 h-6 sm:w-8 sm:h-8"
          />
        </button>
      </h1>

      {/* Base view (non-modal) */}
      <div className="">
        <FileSystem
          currentPath={currentPath}
          setCurrentPath={setCurrentPath}
          fileType="root"
          isSubjectFolderView
        />
      </div>

      {/* Expanded modal view */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          {/* 
            Modal container:
            - bg-white in light mode, 
            - bg-neutral-800 in dark mode (or pick your own dark color).
          */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl w-full sm:w-[90vw] h-[80vh] max-w-4xl max-h-[90vh] relative flex flex-col">
            {/* Modal header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={toggleExpand}
                className="absolute top-3 right-3 hover:opacity-80 transition-opacity p-1"
                aria-label="Close modal"
              >
                <Image
                  src={close}
                  alt="close"
                  width={isMobile ? 24 : 30}
                  height={isMobile ? 24 : 30}
                  className="w-6 h-6 sm:w-8 sm:h-8"
                />
              </button>
              <h3 className="text-lg sm:text-xl font-semibold text-emerald-700">
                Subject Details
              </h3>
            </div>

            {/* Modal content (scrollable) */}
            <div className="p-6 overflow-y-auto no-scrollbar transition-all duration-300 flex-1">
              <FileSystem
                currentPath={currentPath}
                setCurrentPath={setCurrentPath}
                fileType="root"
                isSubjectFolderView
                inModal // This prop signals FileSystem to fill modal space
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
