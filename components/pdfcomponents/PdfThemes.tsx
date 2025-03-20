"use client"
import React, { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import brushmenu from "@/public/header/themes.svg";
import Image from "next/image";
import { useSettings } from "@/context/SettingsContext";

const availableThemes = [
  "Dark Brown",        // #291D00
  "Deep Red",          // #390003
  "Midnight Blue",     // #002033
  "Deep Purple",       // #160039
  "Charcoal Black",    // #202020
  "Very Dark Purple",   // #090822
  "light",
];

const THEME_STORAGE_KEY = 'pdf-theme-preference';

const PdfThemes = () => {
  const { setTheme, theme } = useSettings();
  const {isDarkMode} = useSettings()

  useEffect(() => {
    // Retrieve theme from localStorage when component mounts
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme && availableThemes.includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  useEffect(()=>{
    if(isDarkMode){
      setTheme("Charcoal Black")
    }else{
      setTheme("Midnight Blue")
    }
  },[isDarkMode])

  const handleThemeChange = (newTheme) => {
    // Save to localStorage and update theme
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    setTheme(newTheme);
  };

  // Determine if current theme is light
  const isLightTheme = theme === "light";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 rounded focus:outline-none transition"
          aria-label="PDF Themes Menu"
        >
          {/* Render the SVG directly so we can control its colors based on theme */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 61 36" 
            className="object-contain w-16 h-16"
          >
            <path 
              d="M9 14H29.3719V17.8069C29.3719 19.8525 27.7136 21.5109 25.6679 21.5109H12.704C10.6583 21.5109 9 19.8525 9 17.8069V14Z" 
              fill={isLightTheme ? "#5E35B1" : "white"}
            />
            <path 
              d="M15.6875 21.5156H22.6839V30.5698C22.6839 32.5018 21.1177 34.068 19.1857 34.068C17.2537 34.068 15.6875 32.5018 15.6875 30.5698V21.5156Z" 
              fill={isLightTheme ? "#5E35B1" : "white"}
            />
            <rect 
              x="9" y="6.39062" width="20.3719" height="6.79063" 
              fill={isLightTheme ? "#5E35B1" : "white"}
            />
            <path 
              d="M9 6.48191V5.24725C10.7325 6.00251 11.8289 6.25189 13.9386 6.37902C18.8258 6.12757 20.3177 3.91621 24.2275 4.07016C25.859 4.05248 26.9309 4.34272 29.3719 5.6588V6.48191H9Z" 
              fill={isLightTheme ? "#5E35B1" : "white"}
            />
            <path 
              d="M60 15.2656L55 20.2656L50 15.2656" 
              stroke={isLightTheme ? "#7E57C2" : "white"} 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {availableThemes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption}
            onClick={() => handleThemeChange(themeOption)}
          >
            {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PdfThemes;