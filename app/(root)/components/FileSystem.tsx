import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronRight,
  Check,
  Trash2,
  Edit,
  Pencil,
  X,
  MoreHorizontal,
  Trash,
  MoreVertical,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getFileSystem, saveFileSystem } from "@/db/pdf/fileSystem";
import { getPdfById } from "@/db/pdf/pdfFiles";
import { getNoteById } from "@/db/note/Note";

import PlainNote from "@/public/assets/images/noteplain.svg";
import PdfFile from "@/public/assets/images/pdf-file.svg";
import newfolder from "@/public/assets/images/newfolder.svg";
import addFolder from "@/public/assets/images/addFolder.svg";
import edit from "@/public/assets/images/editicon.svg";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import useFileSystem from "@/hooks/useFileSystem";

interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: "pdf" | "note";
  parentId: string | null;
  timestamp?:any
}

interface FileSystemProps {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  file?: {
    documentId: string;
    fileName: string;
  };
  fileType?: "pdf" | "note" | "root";
  saveFile?: () => void;
  isSubjectFolderView?: boolean;
  inModal?: boolean;
  isChatTrigger?: boolean;
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import useUserId from "@/hooks/useUserId";
import { deletePdfFromCloud } from "@/lib/pdfUtils";
import { deleteUserNote } from "@/lib/noteUtils";
import { deleteAnnotations } from "@/lib/pdfAnnotaionsUtils";

export default function FileSystem({
  currentPath,
  setCurrentPath,
  file,
  fileType = "root",
  saveFile,
  isSubjectFolderView = false,
  inModal = false,
  isChatTrigger,
}: FileSystemProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const { setcurrentDocument } = useSettings();
  const userId = useUserId();
  const [shouldFileSystemUplate, setshouldFileSystemUplate] = useState(false);
  const { fileSystem, setFileSystem, loading, uploadFileSystem } =
    useFileSystem(userId);

  useEffect(() => {
    const sync = async () => {
      if (fileSystem?.length === 0 || !fileSystem || !shouldFileSystemUplate)
        return;
      await uploadFileSystem(fileSystem);
      setshouldFileSystemUplate(false);
    };
    sync();
  }, [fileSystem, shouldFileSystemUplate, uploadFileSystem]);

  const router = useRouter();

  const handleOutsideClick = useCallback((e) => {
    // Only close the menu if clicking outside of any menu component
    const menuElements = document.querySelectorAll("[data-menu-item]");
    let clickedInsideMenu = false;

    menuElements.forEach((element) => {
      if (element.contains(e.target)) {
        clickedInsideMenu = true;
      }
    });

    if (!clickedInsideMenu) {
      setMenuOpen(null);
    }
  }, []);

  useEffect(() => {
    // Add event listener for clicking outside
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [handleOutsideClick]);

  // Fetch file system data
  const fetchFileSystem = useCallback(async () => {
    try {
      let storedFileSystem = await getFileSystem();
      if (!storedFileSystem || storedFileSystem.length === 0) {
        storedFileSystem = [];
      }
      setFileSystem(storedFileSystem);
    } catch (error) {
      console.error("Error fetching file system:", error);
    }
  }, [setFileSystem]);

  const updateFileSystem = useCallback(
    async (updatedFileSystem: FileSystemItem[]) => {
      try {
        setFileSystem(updatedFileSystem);
        setshouldFileSystemUplate(true);
        await saveFileSystem(updatedFileSystem);
      } catch (error) {
        console.error("Error updating file system:", error);
      }
    },
    [setFileSystem]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      // Find the item to delete
      const itemToDelete = fileSystem.find((item) => item.id === id);

      if (!itemToDelete) return; // If the item is not found, do nothing

      // If it's a folder, we need to handle recursive deletion
      if (itemToDelete.type === "folder") {
        // Get all items that need to be deleted (the folder and all its contents)
        const itemsToDelete = getItemsInFolder(id, fileSystem);

        // Process each item based on its type
        for (const item of itemsToDelete) {
          console.log(item);
          if (item.type === "file") {
            if (item.fileType === "pdf") {
              await deletePdfFromCloud(userId, item.id);
              await deleteAnnotations(userId, item.id);
              await deleteUserNote(item.id, userId);
            } else if (item.fileType === "note") {
              await deleteUserNote(item.id, userId);
            }
          }
        }

        // Remove all items from the file system
        const idsToDelete = itemsToDelete.map((item) => item.id);
        const updatedFileSystem = fileSystem.filter(
          (item) => !idsToDelete.includes(item.id)
        );
        await updateFileSystem(updatedFileSystem);
      } else {
        console.log(itemToDelete);
        // If it's a single file, handle based on its type
        if (itemToDelete.fileType === "pdf") {
          await deletePdfFromCloud(userId, id);
          await deleteAnnotations(userId, id);
          await deleteUserNote(id, userId);
        } else if (itemToDelete.fileType === "note") {
          await deleteUserNote(id, userId);
        }

        // Remove the file from the file system
        const updatedFileSystem = fileSystem.filter((item) => item.id !== id);
        await updateFileSystem(updatedFileSystem);
      }

      setshouldFileSystemUplate(true);
      setMenuOpen(null);
    },
    [fileSystem, updateFileSystem, userId]
  );

  // Helper function to get all items in a folder (including the folder itself)
  const getItemsInFolder = (folderId, fileSystemItems) => {
    // Start with the folder itself
    const result = [fileSystemItems.find((item) => item.id === folderId)];

    // Find direct children
    const directChildren = fileSystemItems.filter(
      (item) => item.parentId === folderId
    );
    result.push(...directChildren);

    // Recursively find children of subfolders
    const childFolders = directChildren.filter(
      (item) => item.type === "folder"
    );
    for (const folder of childFolders) {
      const childItems = getItemsInFolder(folder.id, fileSystemItems);
      // Filter out the folder itself as it's already included in directChildren
      result.push(...childItems.filter((item) => item.id !== folder.id));
    }

    return result;
  };

  const getCurrentItems = useCallback(() => {
    if (!currentFolder) {
      // top-level
      return fileSystem?.filter((item) => item.parentId === null);
    }
    // items inside the current folder
    return fileSystem.filter(
      (item) =>
        item.parentId === currentFolder &&
        (item.type === "file"
          ? fileType === "root" || item.fileType === fileType
          : true)
    );
  }, [fileSystem, currentFolder, fileType]);

  const handleItemClick = useCallback(
    async (item: FileSystemItem) => {
      if (item.type === "folder") {
        setCurrentFolder(item.id);
        setCurrentPath([item.name]);
      } else if (item.type === "file") {
        try {
          if (item.fileType === "pdf") {
            const doc = await getPdfById(item.id);
            if (doc) {
              const path = !isChatTrigger
                ? `/workspace/pdfnote/${item.id}`
                : `/workspace/chat/${item.id}`;
              router.push(path);
            }
          } else if (item.fileType === "note") {
            const note = await getNoteById(item.id);
            if (true) {
              router.push(`/workspace/note/${item.id}`);
            }
          }
        } catch (error) {
          console.error("Error fetching file:", error);
          alert("Failed to open the file.");
        }
      }
    },
    [setCurrentPath, router, isChatTrigger]
  );

  const handleBackClick = useCallback(() => {
    setCurrentFolder(null);
    setCurrentPath([]);
  }, [setCurrentPath]);

  // Helper function to generate unique name when duplicates exist
  const generateUniqueName = useCallback(
    (baseName, type, extension = "") => {
      // Check if the base name already exists
      const nameExists = fileSystem.some(
        (item) =>
          item.parentId === currentFolder &&
          item.type === type &&
          item.name === (type === "file" ? `${baseName}${extension}` : baseName)
      );

      // If no duplicate exists, return the original name
      if (!nameExists) {
        return type === "file" ? `${baseName}${extension}` : baseName;
      }

      // Find the highest existing number
      const regex = new RegExp(
        `${baseName} \\((\\d+)\\)${type === "file" ? extension : ""}`
      );
      let highestNum = 0;

      fileSystem.forEach((item) => {
        if (item.parentId === currentFolder && item.type === type) {
          const match = item.name.match(regex);
          if (match && parseInt(match[1]) > highestNum) {
            highestNum = parseInt(match[1]);
          }
        }
      });

      // Return name with incremented number
      return type === "file"
        ? `${baseName} (${highestNum + 1})${extension}`
        : `${baseName} (${highestNum + 1})`;
    },
    [fileSystem, currentFolder]
  );

  const handleRename = useCallback(
    async (id: string, newName: string) => {
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

      let baseName = newName.trim();
      let extension = "";

      // Handle file extensions
      if (itemToRename.type === "file") {
        extension = itemToRename.fileType === "pdf" ? ".pdf" : ".notes";
        if (baseName.endsWith(extension)) {
          baseName = baseName.substring(0, baseName.length - extension.length);
        }
      }

      // Generate unique name if needed
      const finalName = generateUniqueName(
        baseName,
        itemToRename.type,
        extension
      );

      const updatedFileSystem = fileSystem.map((item) => {
        if (item.id === id) {
          return { ...item, name: finalName };
        }
        return item;
      });

      await updateFileSystem(updatedFileSystem);
      setshouldFileSystemUplate(true);
      setEditingItem(null);
      setMenuOpen(null);
    },
    [fileSystem, updateFileSystem, generateUniqueName]
  );

  const handleCreateFolder = useCallback(async () => {
    const folderName = generateUniqueName("New Folder", "folder");

    const newFolder: FileSystemItem = {
      id: Date.now().toString(),
      name: folderName,
      type: "folder",
      parentId: currentFolder,
    };

    // Create a safe copy of fileSystem, ensuring it's an array
    const currentFileSystem = Array.isArray(fileSystem) ? fileSystem : [];
    const updatedFileSystem = [...currentFileSystem, newFolder];
    await updateFileSystem(updatedFileSystem);
    setshouldFileSystemUplate(true);
    setEditingItem(newFolder.id);
  }, [fileSystem, updateFileSystem, currentFolder, generateUniqueName]);

  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateFileInfo, setDuplicateFileInfo] = useState(null);

  const handleAddFileToCurrentFolder = useCallback(async () => {
    console.log(currentFolder, file?.documentId);
    if (!file?.documentId || !currentFolder) return;

    const extension = fileType === "pdf" ? ".pdf" : ".notes";
    const fileName = file.fileName.endsWith(extension)
      ? file.fileName
      : `${file.fileName}${extension}`;

    // Check if a file with the same name already exists in the current folder
    const fileExists = fileSystem.some(
      (item) =>
        item.parentId === currentFolder &&
        item.type === "file" &&
        item.name === fileName
    );

    if (fileExists) {
      // Show popup dialog
      setDuplicateFileInfo({
        fileName,
        fileId: file.documentId,
        extension,
      });
      setShowDuplicateDialog(true);
      return;
    }

    const newFile: FileSystemItem = {
      id: file.documentId,
      name: fileName,
      type: "file",
      fileType: fileType === "pdf" ? "pdf" : "note",
      parentId: currentFolder,
      timestamp: new Date().toISOString(), // Adds a timestamp in ISO format
    };
    
    setcurrentDocument({ id: file.documentId, title: fileName });

    const updatedFileSystem = [...fileSystem, newFile];
    await updateFileSystem(updatedFileSystem);
    setshouldFileSystemUplate(true);
    if (saveFile) {
      saveFile();
    }
  }, [file, currentFolder, fileType, fileSystem, updateFileSystem, saveFile]);

  const handleReplaceDuplicate = useCallback(async () => {
    if (!duplicateFileInfo || !currentFolder) return;

    // Remove the existing file with the same name
    const filteredFiles = fileSystem.filter(
      (item) =>
        !(
          item.parentId === currentFolder &&
          item.type === "file" &&
          item.name === duplicateFileInfo.fileName
        )
    );

    // Add the new file
    const newFile: FileSystemItem = {
      id: duplicateFileInfo.fileId,
      name: duplicateFileInfo.fileName,
      type: "file",
      fileType: duplicateFileInfo.extension === ".pdf" ? "pdf" : "note",
      parentId: currentFolder,
    };

    setcurrentDocument({
      id: duplicateFileInfo.fileId,
      title: duplicateFileInfo.fileName,
    });

    const updatedFileSystem = [...filteredFiles, newFile];
    await updateFileSystem(updatedFileSystem);
    setshouldFileSystemUplate(true);
    if (saveFile) {
      saveFile();
    }

    // Close the dialog
    setShowDuplicateDialog(false);
    setDuplicateFileInfo(null);
  }, [
    duplicateFileInfo,
    currentFolder,
    fileSystem,
    updateFileSystem,
    saveFile,
  ]);

  const handleCreateNewDuplicate = useCallback(async () => {
    if (!duplicateFileInfo || !currentFolder) return;

    // Get base name without extension
    const baseName = duplicateFileInfo.fileName.replace(
      duplicateFileInfo.extension,
      ""
    );

    // Generate unique name
    const newFileName = generateUniqueName(
      baseName,
      "file",
      duplicateFileInfo.extension
    );

    // Add the new file with a suffix
    const newFile: FileSystemItem = {
      id: duplicateFileInfo.fileId,
      name: newFileName,
      type: "file",
      fileType: duplicateFileInfo.extension === ".pdf" ? "pdf" : "note",
      parentId: currentFolder,
    };

    setcurrentDocument({ id: duplicateFileInfo.fileId, title: newFileName });

    const updatedFileSystem = [...fileSystem, newFile];
    await updateFileSystem(updatedFileSystem);
    setshouldFileSystemUplate(true);
    if (saveFile) {
      saveFile();
    }

    // Close the dialog
    setShowDuplicateDialog(false);
    setDuplicateFileInfo(null);
  }, [
    duplicateFileInfo,
    currentFolder,
    fileSystem,
    updateFileSystem,
    saveFile,
    generateUniqueName,
  ]);

  const getFileIcon = (item: FileSystemItem) => {
    if (item.type === "folder") {
      return (
        <div className="p-4 py-2">
          <Image
            src={newfolder}
            alt="folder"
            className="w-[136px] h-[100px] hover:scale-105 transition-transform duration-300"
          />
        </div>
      );
    } else if (item.type === "file") {
      if (item.fileType === "note") {
        return (
          <div className="p-4 py-2">
            <Image
              src={PlainNote}
              alt="note-file"
              className="hover:scale-105 transition-transform duration-300"
            />
          </div>
        );
      } else if (item.fileType === "pdf") {
        return (
          <div className="p-4 py-2">
            <Image
              src={PdfFile}
              alt="pdf-file"
              className="hover:scale-105 transition-transform duration-300"
            />
          </div>
        );
      }
    }
    return null;
  };

  const renderMenuDropdown = (itemId: string) => {
    if (menuOpen !== itemId) return null;

    return (
      <div
        data-menu-item="true"
        className="absolute right-0 top-0 bg-white dark:bg-[#262626] rounded-md py-1 z-50"
        onClick={(e) => e.stopPropagation()}
        style={{ minWidth: "120px" }}
      >
        <button
          className="w-full text-left px-4 py-2 text-sm text-gray-700
            hover:bg-[#DDD0FF] dark:hover:bg-purple-200 hover:text-black flex items-center rounded-lg"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEditingItem(itemId);
            setMenuOpen(null);
          }}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Rename
        </button>
        <button
          className="w-full text-left px-4 py-2 text-sm text-red-600
          dark:text-red-400 hover:bg-[#DDD0FF] dark:hover:bg-purple-200 flex hover:text-black items-center rounded-lg "
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDelete(itemId);
          }}
        >
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </button>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-[#ecf1f0] dark:bg-[#444444] text-black rounded-lg flex flex-col py-2 relative">
      {/* Duplicate File Dialog */}
      <div className="relative">
        {/* Dialog Overlay */}
        {showDuplicateDialog && (
          <div className="fixed inset-0 z-50  bg-transparent flex items-center justify-center">
            {/* Dialog Content */}
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
              {/* Dialog Header */}
              <div className="p-6 border-b">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                  <h2 className="text-lg font-semibold">Duplicate File</h2>
                </div>
                <p className="text-sm text-gray-500">
                  A file with the same name already exists. What would you like
                  to do?
                </p>
              </div>

              {/* Dialog Body */}
              <div className="p-6">
                <p className="text-sm">
                  File name:{" "}
                  <span className="font-medium">
                    {duplicateFileInfo?.fileName}
                  </span>
                </p>
              </div>

              {/* Dialog Footer */}
              <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                <Button
                  className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50"
                  onClick={handleCreateNewDuplicate}
                >
                  Create new
                </Button>
                <Button
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                  onClick={handleReplaceDuplicate}
                >
                  Replace
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top bar with "Back" and possibly "Add" */}
      <div className="p-0 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackClick}
            disabled={!currentFolder}
          >
            {currentFolder && (
              <ChevronRight className="rotate-180 dark:text-white text-black" />
            )}
          </Button>
          <div className="ml-2 font-semibold text-gray-700 dark:text-white">
            {currentPath.length > 0 ? currentPath[0] : ""}
          </div>
        </div>
        <div className="flex items-center" style={{ zIndex: 100 }}>
          {currentFolder && file && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAddFileToCurrentFolder}
            >
              <Check className="h-4 w-4 text-black dark:text-white" />
            </Button>
          )}
        </div>
      </div>

      {/* Grid area with conditional height */}
      <div
        className={`p-2 overflow-y-auto transition-all duration-300 mx-auto no-scrollbar ${
          inModal ? "flex-1" : "h-[200px]"
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {/* "New Folder" button at root level */}
          {!currentFolder && !isChatTrigger && (
            <div
              className="flex flex-col items-center cursor-pointer justify-center relative p-4 py-2"
              onClick={handleCreateFolder}
            >
              <Image
                src={addFolder}
                alt="new-folder"
                className="w-[136px] h-[100px] hover:scale-105 transition-transform duration-300"
              />
              <div className="mt-4 text-center">
                <p className="font-medium text-sm text-gray-700 dark:text-white hover:text-gray-900 transition-colors duration-200">
                  New Folder
                </p>
              </div>
            </div>
          )}

          {/* Render folders/files */}
          {getCurrentItems()?.map((item) => (
            <div
              key={item.id}
              className="relative flex flex-col items-center cursor-pointer justify-center p-4 rounded-lg transition-all duration-200 "
              onClick={() => handleItemClick(item)}
            >
              {getFileIcon(item)}

              <div className="w-full">
                {editingItem === item.id ? (
                  <div className="w-full transition-all duration-300 ease-in-out mt-4">
                    <Input
                      type="text"
                      defaultValue={item.name.replace(/\.(pdf|notes)$/, "")}
                      onBlur={(e) => handleRename(item.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRename(item.id, e.currentTarget.value);
                        } else if (e.key === "Escape") {
                          setEditingItem(null);
                        }
                      }}
                      autoFocus
                      className="text-xs text-center bg-transparent border-none outline-none
                      shadow-none focus:ring-2 focus:ring-orange focus:outline-none
                      focus-visible:ring-2 focus-visible:ring-orange
                      focus-visible:outline-none h-[1rem] leading-none w-full
                       text-gray-700 dark:text-white "
                      data-id={item.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-md text-center group mt-1 w-full">
                    <div className="absolute top-0 right-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-1 transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === item.id ? null : item.id);
                        }}
                      >
                        <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </Button>
                      {renderMenuDropdown(item.id)}
                    </div>
                    <div className="mt-4 text-center">
                      <p
                        className="font-medium text-xs truncate text-gray-700
                       dark:text-white hover:text-gray-900 transition-colors duration-200"
                      >
                        {item.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
