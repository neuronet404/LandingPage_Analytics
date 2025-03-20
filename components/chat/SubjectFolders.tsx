"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import FileSystem from "@/app/(root)/components/FileSystem";
import expand from "@/public/assets/images/subjectexpand.svg";
import close from "@/public/assets/images/subjectclose.svg";
import { AlertCircle, MoreVertical } from "lucide-react";
import { getFileById } from "@/db/pdf/fileSystem";
import { useRouter } from "next/navigation";
import useUserId from "@/hooks/useUserId";


export default function SubjectFolders({ isExpanded, setIsExpanded }) {
  const [currentPath, setCurrentPath] = useState("");
  const userId = useUserId();



  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [filesIds, setFileIds] = useState([])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeModal = () => {
    setIsExpanded(false);
    console.log("clikcedto close");
  };

  useEffect(() => {
    console.log(isExpanded);
  }, [isExpanded]);

  const getRecentChats = async () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    try {
      if (!userId) {
        setFileIds([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/dev/chat/${userId}/recent-docs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recent documents: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data.docIds)
      setFileIds(data.docIds || []);
    } catch (error) {
      console.error("Error fetching recent documents:", error);
    }
  };

  return (
    <>
      {isExpanded && (
        <div className="rounded-lg w-full min-h-[274px] relative">
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-xl w-full sm:w-[90vw] h-[80vh] max-w-4xl max-h-[90vh] relative flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeModal}
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

              <div className="w-full flex md:justify-start justify-center p-4">
                <div
                  className="flex gap-2 bg-[#f6f7f9] dark:bg-[#444444] w-fit p-2 rounded-full
            justify-center md:justify-start"
                >
                  <button
                    onClick={() => setActiveTab("upload")}
                    className={`px-6 py-2.5 rounded-full text-md font-medium transition-colors ${activeTab === "upload"
                        ? "bg-[#38A169] text-white"
                        : "bg-white dark:bg-[#262626]"
                      }`}
                  >
                    New Upload
                  </button>
                  <button
                    onClick={() => { setActiveTab("recent"); getRecentChats() }}
                    className={`px-6 py-2.5 rounded-full text-md font-medium transition-colors ${activeTab === "recent"
                        ? "bg-[#38A169] text-white"
                        : "bg-white dark:bg-[#262626]"
                      }`}
                  >
                    Recent
                  </button>
                </div>
              </div>

              {activeTab === "upload" && (
                <>
                  {" "}
                  <div className="p-6 overflow-y-auto no-scrollbar transition-all duration-300 flex-1">
                    <FileSystem
                      currentPath={currentPath}
                      setCurrentPath={setCurrentPath}
                      fileType="pdf"
                      isChatTrigger={true}
                      isSubjectFolderView
                      inModal // This prop signals FileSystem to fill modal space
                    />
                  </div>{" "}
                </>
              )}
              {activeTab === "recent" && <><FileList filesIds={filesIds} /></>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}



const FileList = ({ filesIds = [] }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        console.log(filesIds)
        setLoading(true);
        // Check if filesIds exists and has items
        if (filesIds && filesIds.length > 0) {
          // Create an array to hold all file data
          const fileData = [];

          // Fetch each file by ID
          for (const fileId of filesIds) {
            const fileResult = await getFileById(fileId);
            console.log(fileResult, fileId)
            if (fileResult) {
              fileData.push(fileResult);
            }
          }

          setFiles(fileData);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [filesIds]); // Add filesIds as a dependency so it re-runs when the IDs change

  if (loading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <p>Loading files...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <p>No files available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] py-2 md:px-8 overflow-y-auto mb-6 no-scrollbar">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center justify-between px-4 py-3 hover:backdrop-brightness-95 cursor-pointer"
          onClick={() => { router.push(`/workspace/chat/${file?.id}`) }}
        >
          <div className="flex items-center gap-3">
            <div className="text-blue-500">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">{file?.name}</p>
              <p className="text-xs brightness-75">{file?.uploadTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {file?.status === "error" ? (
              <div className="flex items-center text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span className="font-medium">Error</span>
              </div>
            ) : (
              <span className="text-sm brightness-75 font-medium">
                {file?.size}
              </span>
            )}
            <button className="p-1 hover:bg-gray-200 rounded-full">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
