"use client";
import { Calendar, Clock, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import acolyte from "@/public/acolyte.png";
import Search from "@/components/Search";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import DarkToggleButton from "@/components/DarkModeToggle";
import notification from "@/public/notification.svg";
import calender from "@/public/calendar.svg";
import textquestion from "@/public/textquestion.svg";
import avatar from "@/public/Photo.png";

export function DashHeader() {
  const router = useRouter();
  const handleProfileClick = () => {
    router.push("/dashboard/profile");
  };
  const handleLogoClick = () => {
    router.push("/dashboard");
  };

  return (
    <header className="w-full h-[87px] border-b flex items-center justify-between px-4 md:px-6 lg:px-8 fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <Image
          src={acolyte}
          alt="Logo"
          className="w-24 h-24 cursor-pointer"
          onClick={handleLogoClick}
        />
      </div>

      {/* Centered Search Bar */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-md">
        <Search />
      </div>

      {/* Right Icons and User Info */}
      <div className="flex items-center gap-4 ml-2">
        <div className="mr-5">
          <DarkToggleButton />
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
          <Image
            src={notification}
            className="w-5 h-5 text-gray-600"
            alt={""}
          />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
          <Image
            src={textquestion}
            className="w-5 h-5 text-gray-600"
            alt={""}
          />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
          <Image src={calender} className="w-5 h-5 text-gray-600" alt={""} />
        </button>

        {/* User Info */}
        <div
          className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
          onClick={handleProfileClick}
        >
          <Image
            src={avatar}
            alt=""
            className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"
          />
        </div>
      </div>
    </header>
  );
}
