import React, { useState, useEffect } from "react";
import { ChevronDown, MoreVertical, Pencil, Trash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getPdfById } from "@/db/pdf/pdfFiles";
import { getNoteById } from "@/db/note/Note";
import useFileSystem from "@/hooks/useFileSystem";
import subjects from "@/public/assets/images/subjects.svg";

import PdfFile from "@/public/assets/images/pdf-file.svg";
import PlainNote from "@/public/assets/images/noteplain.svg";
import FileUpload from "./file-upload-test";
import CreateNote from "../notes/notes-create-test";
import Loading, { Loading1 } from "@/app/loading";
import useUserId from "@/hooks/useUserId";

interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: "pdf" | "note";
  parentId: string | null;
}

interface FileGridSystemProps {
  fileType: "pdf" | "note";
}

export default function FileGridSystem({ fileType }: FileGridSystemProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [folders, setFolders] = useState<FileSystemItem[]>([]);
  const [files, setFiles] = useState<FileSystemItem[]>([]);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const router = useRouter();

  // State for cookies and file system updates
  const [shouldFileSystemUpdate, setShouldFileSystemUpdate] = useState(false);
  const userId = useUserId();

  // Get fileSystem data using the hook with user sub from cookies
  const { fileSystem, setFileSystem, loading, uploadFileSystem } =
    useFileSystem(userId);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownOpen &&
      event.target instanceof Node &&
      !document.getElementById("dropdown-menu")?.contains(event.target)
    ) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    const sync = async () => {
      if (fileSystem?.length === 0 || !fileSystem || !shouldFileSystemUpdate)
        return;
      await uploadFileSystem(fileSystem);
      setShouldFileSystemUpdate(false);
    };
    sync();
  }, [fileSystem, shouldFileSystemUpdate, uploadFileSystem]);

  // Get all folders at root level and set the first one as selected by default
  useEffect(() => {
    if (!fileSystem) return;

    const rootFolders = fileSystem.filter(
      (item) => item.type === "folder" && item.parentId === null
    );

    setFolders(rootFolders);

    // Set the first folder as selected by default if no folder is selected
    if (rootFolders.length > 0 && selectedFolder === null) {
      setSelectedFolder(rootFolders[0].id);
    }
  }, [fileSystem, selectedFolder]);

  // Get files based on selected folder and fileType
  useEffect(() => {
    if (!fileSystem) return;

    let filteredFiles;

    if (selectedFolder === null) {
      // If no folder is selected, show files that don't have a parent
      filteredFiles = fileSystem.filter(
        (item) =>
          item.type === "file" &&
          item.fileType === fileType &&
          item.parentId === null
      );
    } else {
      // Otherwise show files in the selected folder
      filteredFiles = fileSystem.filter(
        (item) =>
          item.type === "file" &&
          item.fileType === fileType &&
          item.parentId === selectedFolder
      );
    }

    setFiles(filteredFiles);
  }, [fileSystem, selectedFolder, fileType]);

  // Format date to "DD Mon, H PM" format
  const formatDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const hour = date.getHours() % 12 || 12;
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    return `Edited: ${day} ${month}, ${hour} ${ampm}`;
  };

  const handleFileClick = async (file: FileSystemItem) => {
    try {
      if (file.fileType === "pdf") {
        const doc = await getPdfById(file.id);
        if (doc) {
          router.push(`/workspace/pdfnote/${file.id}`);
        }
      } else if (file.fileType === "note") {
        const note = await getNoteById(file.id);
        if (note) {
          router.push(`/workspace/note/${file.id}`);
        }
      }
    } catch (error) {
      console.error("Error fetching file:", error);
      alert("Failed to open the file.");
    }
  };

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolder(folderId);
    setDropdownOpen(false);
  };

  const handleOutsideClick = (e: MouseEvent) => {
    const menuElements = document.querySelectorAll("[data-menu-item]");
    let clickedInsideMenu = false;

    menuElements.forEach((element) => {
      if (element.contains(e.target as Node)) {
        clickedInsideMenu = true;
      }
    });

    if (!clickedInsideMenu) {
      setMenuOpen(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleRenameFile = (fileId: string) => {
    setMenuOpen(null);
    setEditingItem(fileId);
  };

  const handleRename = async (id: string, newName: string) => {
    if (newName.trim() === "") {
      setEditingItem(null);
      return;
    }

    // Get the item being renamed
    const itemToRename = fileSystem?.find((item) => item.id === id);
    if (!itemToRename) {
      setEditingItem(null);
      return;
    }

    let finalName = newName.trim();

    // Add extension if it's a file
    if (itemToRename.type === "file") {
      const extension = itemToRename.fileType === "pdf" ? ".pdf" : ".notes";
      if (!finalName.endsWith(extension)) {
        finalName = `${finalName}${extension}`;
      }
    }

    // Check for duplicates in the same folder
    const isDuplicate = fileSystem?.some(
      (item) =>
        item.id !== id &&
        item.parentId === itemToRename.parentId &&
        item.type === itemToRename.type &&
        item.name === finalName
    );

    // If duplicate exists, add a number suffix
    if (isDuplicate) {
      // For files, handle the extension properly
      if (itemToRename.type === "file") {
        const extension = itemToRename.fileType === "pdf" ? ".pdf" : ".notes";
        const baseName = finalName.replace(extension, "");

        const regex = new RegExp(`${baseName} \\((\\d+)\\)${extension}`);
        let highestNum = 0;

        fileSystem.forEach((item) => {
          if (item.parentId === itemToRename.parentId && item.type === "file") {
            const match = item.name.match(regex);
            if (match && parseInt(match[1]) > highestNum) {
              highestNum = parseInt(match[1]);
            }
          }
        });

        finalName = `${baseName} (${highestNum + 1})${extension}`;
      } else {
        // For folders
        const regex = new RegExp(`${finalName} \\((\\d+)\\)`);
        let highestNum = 0;

        fileSystem.forEach((item) => {
          if (
            item.parentId === itemToRename.parentId &&
            item.type === "folder"
          ) {
            const match = item.name.match(regex);
            if (match && parseInt(match[1]) > highestNum) {
              highestNum = parseInt(match[1]);
            }
          }
        });

        finalName = `${finalName} (${highestNum + 1})`;
      }
    }

    const updatedFileSystem = fileSystem.map((item) => {
      if (item.id === id) {
        return { ...item, name: finalName };
      }
      return item;
    });

    setFileSystem(updatedFileSystem);
    setShouldFileSystemUpdate(true);
    setEditingItem(null);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      // Remove file from the file system
      const updatedFileSystem = fileSystem.filter((item) => item.id !== fileId);
      setFileSystem(updatedFileSystem);
      setShouldFileSystemUpdate(true);
      setMenuOpen(null);
    }
  };

  const renderMenuDropdown = (fileId: string) => {
    if (menuOpen !== fileId) return null;

    return (
      <div
        data-menu-item="true"
        className="absolute right-0 top-8 bg-white dark:bg-[#262626] rounded-md py-1 z-50 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ minWidth: "120px" }}
      >
        <button
          className="w-full text-left px-4 py-2 text-sm text-gray-700
            hover:bg-[#DDD0FF] dark:hover:bg-purple-200 hover:text-black flex items-center rounded-lg"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRenameFile(fileId);
          }}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Rename
        </button>
        <button
          className="w-full text-left px-4 py-2 text-sm text-red-600
          dark:text-red-400 hover:bg-[#DDD0FF] dark:hover:bg-purple-200 flex hover:text-black items-center rounded-lg"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDeleteFile(fileId);
          }}
        >
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </button>
      </div>
    );
  };

  return (
    <div className="w-full =">
      {/* Header with Subject and Buttons */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl md:text-2xl font-semibold text-emerald-700">
          Subject
        </h2>
        <div className="flex gap-4">
          <div className="relative inline-block">
            <Button
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-[#ecf1f0] dark:bg-[#444444]"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="flex items-center gap-2">
                <Image
                  src={subjects}
                  className="h-4 w-4"
                  alt="Subject folder icon"
                />
                {selectedFolder
                  ? folders.find((folder) => folder.id === selectedFolder)
                      ?.name || "All Folders"
                  : "All Folders"}
                <ChevronDown className="h-4 w-4" />
              </div>
            </Button>

            {/* Folder Dropdown */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-1 w-56 border max-h-64 overflow-auto border-gray-200 rounded-md shadow-lg z-10 bg-[#ecf1f0] dark:bg-[#444444]"
                id="dropdown-menu"
              >
                <ul className="py-1">
                  {folders.map((folder) => (
                    <li
                      key={folder.id}
                      className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#363636] cursor-pointer ${
                        selectedFolder === folder.id
                          ? "bg-gray-100 dark:bg-[#363636]"
                          : ""
                      }`}
                      onClick={() => handleFolderSelect(folder.id)}
                    >
                      {folder.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Files Grid */}
      <div className="rounded-xl  w-full h-[400px] sm:h-[450px] gap-8 bg-[#ecf1f0] dark:bg-[#444444] overflow-y-auto">
        {files.length > 0 && (
          <div className="p-4 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-6 w-full">
            {files.map((file) => (
              <div
                key={file.id}
                className="cursor-pointer flex flex-col items-center relative"
              >
                {/* More options button */}
                <div className="absolute -top-2 -right-2 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-black/60"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === file.id ? null : file.id);
                    }}
                  >
                    <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </Button>
                  {renderMenuDropdown(file.id)}
                </div>

                <div
                  className="w-full shadow-sm rounded-lg overflow-hidden"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="relative">
                    {/* File icon */}
                    <div className="p-2 flex justify-center ">
                      <div className=" flex items-center justify-center">
                        <Image
                          src={file.name.endsWith(".pdf") ? PdfFile : PlainNote}
                          alt={file.name}
                          className="w-[64px] h-[80px] sm:w-[80px] sm:h-[100px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* File name and edit date */}
                <div className="lg:mt-2 text-center w-full">
                  {editingItem === file.id ? (
                    <div className="w-full transition-all duration-300 ease-in-out">
                      <input
                        type="text"
                        defaultValue={file.name.replace(/\.(pdf|notes)$/, "")}
                        onBlur={(e) => handleRename(file.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRename(file.id, e.currentTarget.value);
                          } else if (e.key === "Escape") {
                            setEditingItem(null);
                          }
                        }}
                        autoFocus
                        className="text-xs text-center bg-transparent border-none outline-none
                  shadow-none focus:ring-2 focus:ring-orange focus:outline-none
                  focus-visible:ring-2 focus-visible:ring-orange
                  focus-visible:outline-none h-[1rem] leading-none w-full
                  text-gray-700 dark:text-white rounded-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate max-w-full">
                        {file.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(file)}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {files.length === 0 && (
          <>
            <div className="w-full  flex items-center justify-center  h-full">
              {fileType === "pdf" ? <FileUpload /> : <CreateNote />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
