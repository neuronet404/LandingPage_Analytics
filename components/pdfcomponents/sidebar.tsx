"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import home from "@/public/homesidebar.svg";
import chat from "@/public/chat.svg";
import pdfviewer from "@/public/pdfviewer.svg";
import notes from "@/public/notes.svg";
import singlepage from "@/public/singlepageview.svg";
import doublepage from "@/public/doublepageview.svg";
import caraousel from "@/public/caraousel_new.svg";
import expand from "@/public/expandIcon.svg";
import read from "@/public/read.svg";
import write from "@/public/write.svg";
import { useSettings } from "@/context/SettingsContext";
import ToggleButton from "@/components/DarkModeTogglePDF";
import { useRouter } from "next/navigation";
import { PanelLeftOpen, PanelRightOpen, Expand, Minimize2 } from "lucide-react";
import NavBarItems from "../sidebar/NavBarItems";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { navItems } from "@/constants";

const NavButton = ({ active, onClick, icon, label }) => (
  <div className="relative group flex flex-col items-center">
    <motion.button
      onClick={onClick}
      className="flex items-center justify-center rounded-lg transition-all p-2"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      <Image src={icon} alt={label} className="w-6 h-6 md:w-8 md:h-8" />
    </motion.button>
    <span className="hidden md:block text-xs md:text-sm text-gray-700 mt-1">
      {label}
    </span>
  </div>
);

const ViewButton = ({ active, onClick, icon }) => (
  <motion.button
    onClick={onClick}
    className={`rounded-lg p-2 transition-all ${active ? "bg-[#d6cff1]" : "text-zinc-500"
      } hover:bg-[#d6cff1]`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileTap={{ scale: 0.95 }}
    whileHover={{ scale: 1.05 }}
  >
    <Image src={icon} alt="" className="w-6 h-6 md:w-7 md:h-7" />
  </motion.button>
);

const ToolButton = ({ active, onClick, icon }) => (
  <motion.button
    onClick={onClick}
    className={`flex justify-center items-center rounded-full w-8 h-8 md:w-9 md:h-9 transition-all ${active ? "bg-[#d6cff1]" : "text-zinc-500 hover:bg-gray-200"
      }`}
    animate={active ? { scale: 1.05 } : { scale: 1 }}
    whileTap={{ scale: 0.95 }}
    whileHover={{ scale: 1.1 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    <Image src={icon} alt="" className="w-5 h-5 md:w-6 md:h-6" />
  </motion.button>
);

const ViewMode = {
  SINGLE: "single",
  DOUBLE: "double",
  CAROUSEL: "carousel",
};

export default function Sidebar({ isNote = false, mode }) {
  const [activeNav, setActiveNav] = useState("");
  const [activeView, setActiveView] = useState(ViewMode.SINGLE);
  const [activeTool, setActiveTool] = useState("read");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const pathname = usePathname();
  const currentPath = pathname.split("/")[2]
  const [curentTheme, setCurrentTheme] = useState("")
  const settings = useSettings();

  console.log("======>", settings)

  const {
    setViewMode,
    setisExpanded,
    isExpanded,
    currentDocumentId,
    setData,
    data,
    currentView,
  } = useSettings();

  useEffect(() => {
    if (!currentView) return;
    setActiveTool(currentView);
    console.log(currentView);
  }, [currentView, setViewMode, currentDocumentId]);
  const router = useRouter();

  // Adjust sidebar visibility on small screens
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarVisible(window.innerWidth >= 640); // Hide sidebar on very small screens
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    const theme = localStorage.getItem("theme");
    setCurrentTheme(theme)
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 24,
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    },
    closed: {
      x: -100,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    closed: { opacity: 0, y: 20, transition: { duration: 0.2 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Improved toggle button animation variants
  const toggleButtonVariants = {
    visible: (isVisible) => ({
      rotate: isVisible ? 90 : -90,
      x: isVisible ? -10 : 10,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.5
      }
    }),
    hover: {
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15
      }
    },
    tap: {
      scale: 0.9,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 10
      }
    }
  };
  console.log("mode==>", mode)
  return (
    <div
      className="fixed left-6 p-3 top-20 w-fit z-10"
    >
      {/* Sidebar Content */}
      <AnimatePresence>
        {isSidebarVisible && (
          <motion.div
            className="grid grid-cols-1 w-fit space-y-4"
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
          >
            {/* Navigation Buttons */}
            <motion.div
              className="w-auto"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <ul className="">
                {navItems.map(({ url, name, icon_light, icon_dark }, index) => {
                  if (name === "Acolyte") return null;
                  return (
                    <motion.li
                      key={name}
                      className="group flex items-center gap-3 p-2
                      rounded-lg hover:bg-violet-300 transition"
                      variants={itemVariants}
                      whileHover={{ scale: 1.03, x: 5 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Link href={url} className="flex items-center gap-3">
                        <Image
                          src={(mode === "light"
                            || currentPath === "note"
                            || curentTheme === "light") ? icon_dark : icon_light}
                          alt={name}
                          width={30}
                          height={30}

                        />
                        <motion.p
                          className="opacity-0 group-hover:opacity-100 translate-x-2
                          group-hover:translate-x-0 font-semibold dark:text-black"
                          initial={{ x: 10, opacity: 0 }}
                          animate={{
                            x: 0,
                            opacity: 0
                          }}
                          whileHover={{
                            opacity: 1,
                            x: 0,
                            transition: { duration: 0.2 }
                          }}
                          exit={{ x: 10, opacity: 0 }}
                        >
                          {name}
                        </motion.p>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>

            {(currentView === "read" && currentPath !== "chat") && (
              <AnimatePresence>
                <motion.div
                  className="shadow-md bg-gray-100 w-fit rounded-lg grid grid-cols-1 "
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <ViewButton
                    active={activeView === ViewMode.SINGLE}
                    onClick={() => {
                      setActiveView(ViewMode.SINGLE);
                      setViewMode(ViewMode.SINGLE);
                      setData(null);
                    }}
                    icon={singlepage}
                  />
                  <ViewButton
                    active={activeView === ViewMode.DOUBLE}
                    onClick={() => {
                      setActiveView(ViewMode.DOUBLE);
                      setViewMode(ViewMode.DOUBLE);
                      setData(null);
                    }}
                    icon={doublepage}
                  />
                  <ViewButton
                    active={activeView === ViewMode.CAROUSEL}
                    onClick={() => {
                      setActiveView(ViewMode.CAROUSEL);
                      setData(!data);
                    }}
                    icon={caraousel}
                  />
                </motion.div>

                <motion.div
                  className="bg-gray-100 w-fit text-violet-600 p-2 mt-3 rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {isExpanded ? (
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Minimize2
                        onClick={() => {
                          setActiveNav("collapse");
                          setisExpanded(false);
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ rotate: 180 }}
                      animate={{ rotate: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Expand
                        onClick={() => {
                          setActiveNav("expand");
                          setisExpanded(true);
                        }}
                      />
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            <motion.div
              className="p-1 mt-3 w-fit bg-gray-100 rounded-full shadow-md grid grid-cols-1 gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
            >
              <ToolButton
                active={activeTool === "read"}
                onClick={() => {
                  setActiveTool("read");
                  router.push(`/workspace/pdfnote/${currentDocumentId}`);
                }}
                icon={read}
              />
              <ToolButton
                active={activeTool === "write"}
                onClick={() => {
                  setActiveTool("write");
                  router.push(`/workspace/note/${currentDocumentId}`);
                }}
                icon={write}
              />
              <ToolButton
                active={activeTool === "chat"}
                onClick={() => {
                  setActiveTool("chat");
                  router.push(`/workspace/chat/${currentDocumentId}`);
                }}
                icon={chat}
              />
            </motion.div>

            {/* Toggle Button at Bottom */}
            {currentPath !== "chat" &&

              <motion.div
                className="mt-3 w-fit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <ToggleButton type="local" />
              </motion.div>
            }

            {/* Improved Toggle Button for sidebar visibility */}
            {/* {isSidebarVisible && (
              <motion.div
                className="flex items-start justify-center -translate-x-1/3 mt-3 p-2 rounded-lg
                cursor-pointer fixed bottom-0"
                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                custom={isSidebarVisible}
                variants={toggleButtonVariants}
                initial="visible"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
              >
                <object
                  data="/toggleheader.svg"
                  type="image/svg+xml"
                  className="pointer-events-none"
                />
              </motion.div>
            )} */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Improved Toggle Button when sidebar is hidden */}

      <motion.div
        className="flex items-center justify-center -translate-x-1/2
          fixed bottom-0  rounded-lg cursor-pointer py-2"
        onClick={() => setIsSidebarVisible(!isSidebarVisible)}
        custom={isSidebarVisible}
        variants={toggleButtonVariants}
        initial="visible"
        animate="visible"
        whileHover="hover"
        whileTap="tap"
      >
        <object
          data="/toggleheader.svg"
          type="image/svg+xml"
          className="pointer-events-none"
        />
      </motion.div>

    </div>
  );
}