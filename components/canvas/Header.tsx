"use client";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import acolyte from "@/public/acolyte.png";
import sync1 from "@/public/header/sync.svg";
import { useSettings } from "@/context/SettingsContext";
import PdfThemes from "@/components/pdfcomponents/PdfThemes";
import { useRouter } from "next/navigation";
import { getFileById, getFileSystem } from "@/db/pdf/fileSystem";

import { motion, AnimatePresence, sync } from "framer-motion";
import { TrainAiNotification } from "../pdf-opti/train-confirm";
import { useFetchNotes } from "@/hooks/useFetchNotes";
import { useFetchAnnotations } from "@/hooks/useFetchPdfAnnotations";
import { getPdfById } from "@/db/pdf/pdfFiles";
import { markPdfAsSynced } from "@/db/pdf/fileSystem";
import useUserId from "@/hooks/useUserId";
interface HeaderProps {
  title?: string;
  pages?: number;
  annotations?: number;
  updatedMode?: (value: any) => void;
  mode?: string;
}

export default function Header({ updatedMode, mode }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();


  const {
    theme,
    isVisible,
    setIsVisible,
    isHeadderVisible,
    currentView,
    setisHeadderVisible,
    setSyncPdfAnnotations,
    SyncPdfAnnotations,
    currentDocumentId,
    currentDocument,
    setcurrentDocument,
    isTrainingProgress,
    isSearchVisible,
    setisSearchVisible,
  } = useSettings();

  useEffect(() => {
    (async () => {
      const fileId = currentDocumentId; // Replace with the actual file ID
      const fileDetails = await getFileById(fileId);
      console.log(fileId, fileDetails);

      if (fileDetails) {
        console.log("File found:", fileDetails);
        setcurrentDocument({ id: fileDetails.id, title: fileDetails.name });
      } else {
        console.log("File not found");
      }
    })();
  }, [currentDocumentId]);

  const searchBarRef = useRef(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const updateLastUpdateTime = () => {
      const now = new Date();
      const formattedDate = now.toLocaleString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setLastUpdate(formattedDate);
    };

    updateLastUpdateTime();
    const interval = setInterval(updateLastUpdateTime, 60000);

    return () => clearInterval(interval);

  }, []);

  useEffect(() => {
    updatedMode?.(theme || "light")
  }, [mode, theme, updatedMode])


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setisSearchVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchVisible]);
  // !isHeadderVisible/ ${// false ? 'translate-y-0' : '-translate-y-full'}
  return (
    <div>
      {(isHeadderVisible || currentView === "chat") && (
        <AnimatePresence>
          <motion.header
            className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300
           flex items-center w-full p-3 font-sans h-[70px]
          ${theme === "Dark Brown"
                ? "bg-[#291D00] text-white"
                : theme === "Deep Red"
                  ? "bg-[#390003] text-white"
                  : theme === "Midnight Blue"
                    ? "bg-[#002033] text-white"
                    : theme === "Deep Purple"
                      ? "bg-[#160039] text-white"
                      : theme === "Charcoal Black"
                        ? "bg-[#202020] text-white"
                        : theme === "Very Dark Purple"
                          ? "bg-[#090822] text-white"
                          : theme === "light"
                            ? "bg-white text-black"
                            : "bg-white text-black"
              }`}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* <div className="flex w-full justify-between items-center font-rubik bg-purple-200"> */}
            <div
              className="flex items-center justify-start w-1/4"
              onClick={() => {
                router.push("/dashboard");
              }}
            >
              <Image alt="acolyte" src={acolyte} className="h-full w-24" />
            </div>

            <div className="flex flex-col  items-center w-1/2 justify-center gap-1 flex-grow sm:flex-none ">
              <div className="flex items-center justify-center gap-11">
                <span className="text-[20px] text-center truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
                  {currentDocument?.title}
                </span>
              </div>
              <p className="text-[10px] font-rubik text-muted-foreground text-center">
                Last Update: {lastUpdate}
              </p>
            </div>

            <div
              className="flex
             lg:grid-cols-4 w-full md:w-1/2 lg:w-1/4 items-center justify-between gap-3 max-lg:gap-1 "
            >
              {/* <Collaborators /> */}
              <SyncButton />

              <PdfThemes />

              <TrainButton />
            </div>
            {/* </div> */}

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="absolute top-0 right-0 w-full bg-white z-50 p-4 sm:hidden">
                {/* Mobile menu items here */}
              </div>
            )}
          </motion.header>
        </AnimatePresence>
      )}
    </div>
  );
}

const TrainButton = () => {
  const { currentDocumentId, isTrainingProgress, currentView } = useSettings();

  const [openTrainModal, setopenTrainModal] = useState(false);
  const [isTrained, setIsTrained] = useState(false);
  const userId = useUserId();


  useEffect(() => {
    const isPdfTrained = async () => {
      try {
        const fileSystem = await getFileSystem();

        const findFile = (items) => {
          for (const item of items) {
            if (item.id === currentDocumentId) {
              setIsTrained(item.isTrained === true);
              return item.isTrained === true;
            }
            if (item.children) {
              const found = findFile(item.children);
              if (found !== null) return found;
            }
          }
          setopenTrainModal(false);
          return false;
        };

        return findFile(fileSystem);
      } catch (error) {
        console.error("Failed to check if PDF is trained:", error);
        return false;
      }
    };

    isPdfTrained();
    // checkTrainingStatus();

  }, [currentDocumentId, currentView, isTrainingProgress]);

  useEffect(() => {
    if (!currentView) return;
    if (currentView === "chat") {
      setopenTrainModal(true);
    }
  }, [currentDocumentId, currentView, setopenTrainModal]);

  return (
    <div>
      <div className="m-2 mx-4 relative cursor-pointer">
        <div className="relative">
          <div className="relative w-15 h-15  flex items-center justify-center">
            {/* Rotating Background */}
            {isTrainingProgress && (
              <div
                className="absolute w-full h-full rounded-full animate-spin"
                style={{
                  background:
                    "conic-gradient(from 180deg at 50% 50%, #D4C8F6 0deg, #4B406B 360deg)",
                  maskImage:
                    "radial-gradient(circle, transparent 60%, black 61%)",
                  WebkitMaskImage:
                    "radial-gradient(circle, transparent 60%, black 61%)",
                }}
              />
            )}

            {/* Training or Sync Icon */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setopenTrainModal(true)}
                  disabled={isTrained}
                  className={`relative ${isTrained ? "cursor-not-allowed opacity-50" : ""
                    }`}
                >
                  <object
                    data="/training.svg"
                    type="image/svg+xml"
                    className="w-12 h-12 max-lg:w-10 max-lg:h-10"
                    style={{ pointerEvents: "none" }}
                  />
                  {isTrained && (
                    <img
                      src="/synccheck.svg"
                      alt="Check"
                      className="absolute bottom-0 right-0 w-4 h-4 min-w-4 min-h-4"
                    />
                  )}
                </button>
              </TooltipTrigger>
              {isTrained && (
                <TooltipContent>
                  <span>Already trained</span>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Train AI Notification Modal (Only Show if Not Trained) */}
      {(!isTrained && !isTrainingProgress) && (
        <TrainAiNotification
          openTrainModal={openTrainModal}
          setopenTrainModal={setopenTrainModal}
        />
      )}
    </div>
  );
};

const SyncButton = () => {
  const { currentDocumentId, setisUploadProgress } = useSettings();
  const userId = useUserId();


  const {
    isDownloaded,
    status: notesStatus,
    upload,
  } = useFetchNotes(currentDocumentId, userId);

  const { isLoaded, uploadAnnotations } = useFetchAnnotations({
    userId: userId,
    documentId: currentDocumentId,
  });

  const [syncStatus, setSyncStatus] = useState("idle"); // "idle", "syncing", "success", "error"
  const [syncing, setSyncing] = useState(false);
  const syncAll = async () => {
    setSyncStatus("syncing");
    try {
      await Promise.all([uploadAnnotations(), upload(), syncPdf()]);
      setSyncStatus("success");
    } catch (error) {
      setSyncStatus("error");
    }
  };

  const syncPdf = async () => {
    console.log("sysncing the pdf....")
    if (syncing || !currentDocumentId) {
      console.log("Provide a valid Document ID.");
      return;
    }
    setSyncing(true);
    setisUploadProgress(true);
    console.log("sysncing the pdf....")

    try {
      const pdf = await getPdfById(currentDocumentId);
      console.log("sysncing the pdf....", pdf)
      if (!pdf) {
        setSyncing(false);
        return;
      }
      console.log("sysncing the pdf....", pdf.isSynced)

      if (pdf.isSynced) {
        setSyncing(false);
        setisUploadProgress(false);
        return;
      }
      console.log("sysncing the pdf.... bwlow sync")

      const { base64, documentId } = pdf;
      console.log("sysncing the pdf....", userId)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dev/uploadpdf`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, documentId }),
        }
      );
      console.log(response)

      if (!response.ok) {
        setSyncing(false);
        return;
      }

      const { uploadURL } = await response.json();

      const binary = atob(base64.split(",")[1]);
      const arrayBuffer = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        arrayBuffer[i] = binary.charCodeAt(i);
      }

      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: arrayBuffer,
      });

      if (uploadResponse.ok) {
        await markPdfAsSynced(currentDocumentId);
      } else {
      }
    } catch (error) {
    } finally {
      setSyncing(false);
      setisUploadProgress(false);
    }
  };

  return (
    <div
      className="text-center w-full flex items-center
       justify-center gap-2 cursor-pointer flex-wrap  p-2 flex-col"
      onClick={syncAll}
    >
      <span className="relative ">
        <Image
          loading="lazy"
          src={sync1}
          alt="Sync"
          className={`object-contain w-7 h-7 min-w-5 min-h-5 shrink-0 aspect-square ${syncStatus === "syncing" ? "animate-spin" : ""
            }`}
        />
        {syncStatus === "success" && (
          <img
            src="/synccheck.svg"
            alt="Check"
            className="absolute bottom-0 right-0 w-4 h-4 min-w-4 min-h-4"
          />
        )}
        {syncStatus === "error" && (
          <img
            src="/syncerror.svg"
            alt="Error"
            className="absolute bottom-0 right-0 w-4 h-4 min-w-4 min-h-4"
          />
        )}
      </span>
      <span className="font-medium text-sm whitespace-nowrap max-lg:text-xs">
        Sync is on
      </span>
    </div>
  );
};





