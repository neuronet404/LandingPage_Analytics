"use client";
import React, { useState } from "react";
import Image from "next/image";
import logo from "@/public/assets/images/acolytelogo.svg";
import SubjectFolders from "./SubjectFolders";

const ChatButton = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      {/* Separate button for toggling */}
      <button
        // onClick={() => setIsExpanded(true)}
        className="w-full h-full"
      >
        {children}
      </button>

      {/* Pass `isExpanded` state down */}
      {isExpanded && (
        <SubjectFolders isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      )}
    </div>
  );
};


export default ChatButton;
