"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Search from "@/components/Search";
import DarkToggleButton from "./DarkModeToggle";
import EventCalendar from "@/components/popup/EventCalendar"; // Import the EventCalendar component

import notfication from "@/public/assets/icons/notification.svg";
import calendar from "@/public/assets/icons/calendar.svg";
import textquestion from "@/public/assets/icons/textquestion.svg";
import avatar from "@/public/assets/icons/Photo.png";
import acolyteLogo from "@/public/assets/images/acolytelogo.svg";
import { parseCookies } from "nookies";
import { FeedBackForm } from "./header/feedback";

const Header = ({
  userId,
  accountId,
}: {
  userId: string;
  accountId: string;
}) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [cookies, setCookies] = useState({});

  // States for new functionalities
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);

  useEffect(() => {
    // Read cookies only on the client side
    setCookies(parseCookies());
  }, []);

  // Enhanced resize handler for proper responsive behavior
  useEffect(() => {
    const handleResize = () => {
      // Check available width for the search bar
      const windowWidth = window.innerWidth;
      const isLandscape = window.innerWidth > window.innerHeight;

      // Only use compact mode on smaller screens, but not on medium landscape
      setIsCompact(windowWidth < 768 || (windowWidth < 1024 && !isLandscape));
    };

    // Set initial state
    handleResize();

    // Add event listeners for resize and orientation changes
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const handleProfileClick = () => {
    router.push("/dashboard/profile");
  };

  const handleLogoClick = () => {
    router.push("/dashboard");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // New handlers for the buttons
  const handleCalendarClick = () => {
    setShowCalendar(true);
    // Close other modals if open
    setShowNotification(false);
    setShowHelpOverlay(false);
  };

  const handleNotificationClick = () => {
    setShowNotification(!showNotification);
    // Close other modals if open
    setShowCalendar(false);
    setShowHelpOverlay(false);
  };

  const handleHelpClick = () => {
    setShowHelpOverlay(!showHelpOverlay);
    // Close other modals if open
    setShowCalendar(false);
    setShowNotification(false);
  };

  const closeAllModals = () => {
    setShowCalendar(false);
    setShowNotification(false);
    setShowHelpOverlay(false);
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      // Check if the click is outside the modal content
      if (showCalendar || showNotification || showHelpOverlay) {
        const modalContents = document.querySelectorAll('.modal-content');
        let clickedInside = false;

        modalContents.forEach(content => {
          if (content.contains(event.target)) {
            clickedInside = true;
          }
        });

        if (!clickedInside) {
          closeAllModals();
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showCalendar, showNotification, showHelpOverlay]);

  return (
    <>
      <header className="dark:bg-[#262626] bg-white px-3 sm:px-4 md:px-6 py-2 relative shadow-sm ">
        <div className="flex items-center justify-between">
          {/* Left side: Logo */}
          <div className="flex-shrink-0 w-16  h-16 sm:w-20 md:w-24 mr-2 sm:mr-4">
            <div onClick={handleLogoClick} className="cursor-pointer">
              <Image
                src={acolyteLogo}
                alt="Logo"
                width={80}
                height={50}
                className=""
              />
            </div>
          </div>
          {/* Center: Search Bar - with dynamic width */}
          <div className="flex-1 px-8 max-w-4xl ">
            <Search />
          </div>

          {/* Right side icons */}
          <div className="flex items-center z-10 ml-2 sm:ml-4">
            {/* Toggle menu for compact mode */}
            {isCompact ? (
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={toggleMenu}
                aria-label="Menu"
              >
                <div className="w-6 h-5 flex flex-col justify-between">
                  <span className="w-full h-0.5 bg-gray-800 dark:bg-gray-200 rounded-full"></span>
                  <span className="w-full h-0.5 bg-gray-800 dark:bg-gray-200 rounded-full"></span>
                  <span className="w-full h-0.5 bg-gray-800 dark:bg-gray-200 rounded-full"></span>
                </div>
              </button>
            ) : (
              /* Desktop icons */
              <div className="flex items-center space-x-2">
                <DarkToggleButton />
                <button
                  className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleNotificationClick}
                >
                  <Image
                    src={notfication}
                    className="w-6 h-6"
                    alt="Notification"
                  />
                </button>
                <FeedBackForm />
                <button
                  className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleCalendarClick}
                >
                  <Image src={calendar} className="w-6 h-6" alt="Calendar" />
                </button>
              </div>
            )}

            {/* Avatar - always visible */}
            <div
              className="flex items-center ml-4 p-1 hover:bg-sky-800 dark:hover:bg-sky-800
                       rounded-full transition-all duration-200 cursor-pointer"
              onClick={handleProfileClick}
            >
              <span className="flex items-center justify-center text-lg font-medium text-white bg-blue-500 rounded-full w-10 h-10 bg-sky-400">
                {cookies?.userName
                  ? cookies.userName.substring(0, 2).toUpperCase()
                  : "U"}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && isCompact && (
          <div className="absolute top-16 right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
            <div className="px-3 py-2">
              <DarkToggleButton />
            </div>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              onClick={handleNotificationClick}
            >
              <Image src={notfication} className="w-5 h-5" alt="Notification" />
              <span className="text-sm">Notifications</span>
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              onClick={handleHelpClick}
            >
              <Image src={textquestion} className="w-5 h-5" alt="Help" />
              <span className="text-sm">Help</span>
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              onClick={handleCalendarClick}
            >
              <Image src={calendar} className="w-5 h-5" alt="Calendar" />
              <span className="text-sm">Calendar</span>
            </button>
          </div>
        )}
      </header>

      {/* Notification Popup */}
      {showNotification && (
        <div className="fixed inset-0 bg-transparent z-50" onClick={closeAllModals}>
          <div
            className="absolute right-16 top-16 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Notifications</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">No notifications</p>
          </div>
        </div>
      )}

      {/* Calendar Component - positioned near header */}
      {showCalendar && (
        <div className="fixed inset-0 bg-transparent z-50" onClick={closeAllModals}>
          <div
            className="absolute right-16 top-16 mt-2
            rounded-lg shadow-lg w-auto max-h-[80vh] modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Calendar</h2>
            </div> */}
            <EventCalendar />
          </div>
        </div>
      )}

      {/* Help Overlay - still centered for better visibility */}
      {showHelpOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeAllModals}>
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Help Center</h2>
            </div>
            <div className="text-center p-4">
              <p className="text-lg">Add contents here</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;