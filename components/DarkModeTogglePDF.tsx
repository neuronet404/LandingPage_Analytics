"use client";
import React, { useEffect, useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { motion } from "framer-motion";
import { Moon, Sun, FileText } from "lucide-react";

interface Type {
  type?: "global" | "local";
}

const DarkToggleButtonPDF = ({ type = "global" }: Type) => {
  const [isDark, setIsDark] = useState(false);
  const { setisDarkFilter, setisDarkMode, globalDarkMode, setglobalDarkMode } = useSettings();

  useEffect(() => {
    // Check for saved preference in localStorage
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
      if (type === "global") {
        setIsDark(true);
      }
      setisDarkMode(true);
      setglobalDarkMode(true);
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
    } else if (type === "local") {
      setisDarkFilter(!isDark);
    }

    setIsDark(!isDark);
    setglobalDarkMode(!isDark);
  };

  return (
    <motion.button
      onClick={toggleDarkMode}
      className={`flex items-center justify-center rounded-full p-2 transition-all ${
        isDark 
          ? "bg-gray-800 text-white" 
          : "bg-white text-gray-800"
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        boxShadow: isDark 
          ? "0 4px 6px rgba(0, 0, 0, 0.3)" 
          : "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}
    >
      <div className="relative w-8 h-8 flex items-center justify-center">
        {/* Dark mode icon */}
        <motion.div
          animate={{ 
            opacity: isDark ? 1 : 0,
            scale: isDark ? 1 : 0.5,
            rotate: isDark ? 0 : -30
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Moon size={20} />
        </motion.div>
        
        {/* Light mode icon */}
        <motion.div
          animate={{ 
            opacity: isDark ? 0 : 1,
            scale: isDark ? 0.5 : 1,
            rotate: isDark ? 30 : 0
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Sun size={20} />
        </motion.div>
      </div>
    </motion.button>
  );
};

export default DarkToggleButtonPDF;