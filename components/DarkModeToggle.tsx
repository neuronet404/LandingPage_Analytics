"use client";
import React, { useEffect, useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { motion } from "framer-motion";
import { SunMedium, Moon, Stars } from "lucide-react";

interface Type {
  type?: "global" | "local";
}
const DarkToggleButton = ({ type = "global" }: Type) => {
  const [isDark, setIsDark] = useState(false);
  const { setisDarkFilter,setisDarkMode ,globalDarkMode, setglobalDarkMode} = useSettings();

  useEffect(() => {
    // Check for saved preference in localStorage
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
      if (type === "global") {
        setIsDark(true);
       
      }
      setisDarkMode(true)
      setglobalDarkMode(true)
    }

  }, []);

  const toggleDarkMode = () => {
    if (type === "global") {
      if (isDark) {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      }
    } else if(type==="local") {
      setisDarkFilter(!isDark);
      // setisDarkMode(!isDark)
     
    }

    setIsDark(!isDark);
    setglobalDarkMode(!isDark)

  };

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={toggleDarkMode}
        className={`relative w-16 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isDark
            ? "bg-indigo-900 focus:ring-indigo-600"
            : "bg-amber-100 focus:ring-amber-400"
        }`}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {/* Track gradient background */}
        <div
          className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
            isDark
              ? "bg-gradient-to-r from-indigo-900 to-violet-900 opacity-100"
              : "bg-gradient-to-r from-amber-200 to-yellow-100 opacity-100"
          }`}
        >
          {/* Stars in dark mode */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              isDark ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute top-1 left-3 w-1 h-1 bg-white rounded-full" />
            <div className="absolute top-3 left-10 w-0.5 h-0.5 bg-white rounded-full" />
            <div className="absolute bottom-2 left-5 w-0.5 h-0.5 bg-white rounded-full" />
            <div className="absolute top-4 right-3 w-1 h-1 bg-white rounded-full" />
          </div>
        </div>

        {/* Toggle indicator */}
        <motion.div
          className={`relative z-10 w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-colors ${
            isDark ? "bg-indigo-400" : "bg-amber-400"
          }`}
          animate={{
            x: isDark ? 32 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          {isDark ? (
            <Moon className="w-4 h-4 text-indigo-900" />
          ) : (
            <SunMedium className="w-4 h-4 text-amber-600" />
          )}
        </motion.div>
      </button>
    </div>
  );
};

export default DarkToggleButton;
