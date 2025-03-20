import React, { useEffect, useState } from "react";
import { ChevronUp, ChevronDown, Plus, Pencil, Trash, MoreVertical } from "lucide-react";
import PdfFile from "@/public/assets/images/pdf-file.svg";
import FileNote from "@/public/assets/images/noteplain.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getFileSystem, saveFileSystem, getFileById } from "@/db/pdf/fileSystem";
import subjects from "@/public/assets/images/subjects.svg";
import { useSettings } from "@/context/SettingsContext";
import FileUpload from "./file-upload-test";
import CreateNote from "../notes/notes-create-test";

interface FileItem {
  id: string;
  name: string;
  parentId?: string;
  documentId?: string;
  uploadTime?: string;
  type?: string;
  fileType?: string;
  isOpen?: boolean;
  isActive?: boolean;
  files: FileItem[];
}

interface FolderStructure {
  [key: string]: FileItem;
}

interface SubjectsFilesProps {
  fileType: "note" | "pdf";
}

const SubjectsFiles: React.FC<SubjectsFilesProps> = ({ fileType }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FileItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const router = useRouter();
  const { setcurrentDocument } = useSettings();

  const formatFolderStructure = (
    data: FileItem[],
    fileType: string
  ): FileItem[] => {
    const folderMap: FolderStructure = {};
    const rootFolders: FileItem[] = [];

    // Create a map of all folders and files
    data.forEach((item) => {
      folderMap[item.id] = {
        ...item,
        isOpen: false,
        isActive: false,
        files: [],
      };
    });

    // Organize items by parentId and filter files by fileType
    data.forEach((item) => {
      if (item.parentId) {
        // Filter files by fileType before adding
        if (item.fileType === fileType) {
          folderMap[item.parentId].files.push(folderMap[item.id]);
        }
      } else if (!item.documentId) {
        // Only add to root if it's a folder (no documentId)
        rootFolders.push(folderMap[item.id]);
      }
    });

    return rootFolders;
  };

  const fetchFolders = async () => {
    try {
      const data = await getFileSystem();
      const formattedFolders = formatFolderStructure(data, fileType); // Pass fileType to the formatting function
      setFolders(formattedFolders);

      // Set initial selected folder and its files
      if (formattedFolders.length > 0) {
        const initialFolder = formattedFolders[0];
        setSelectedFolder(initialFolder.name);
        setFiles(initialFolder.files);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [fileType]);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = () => {
      setMenuOpen(null);
    };
    
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleFolderSelect = (folder: FileItem) => {
    setSelectedFolder(folder.name);
    setIsDropdownOpen(false);
    setFiles(folder.files);
  };

  const handleFileClick = (file: FileItem) => {
    setcurrentDocument({ id: file.id, title: file.name });
    const route =
      fileType === "pdf" ? "/workspace/pdfnote/" : "/workspace/note/";
    router.push(`${route}${file.id}`);
    console.log({ id: file.id, title: file.name });
  };

  const handleMenuToggle = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(menuOpen === fileId ? null : fileId);
  };

  const handleDelete = async (fileId: string) => {
    try {
      // Get the current file system
      const fileSystem = await getFileSystem();
      
      // Filter out the file to delete
      const updatedFileSystem = fileSystem.filter(item => item.id !== fileId);
      
      // Save the updated file system
      await saveFileSystem(updatedFileSystem);
      
      // Refresh the folders and files
      fetchFolders();
      
      // Close the menu
      setMenuOpen(null);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem || !newFileName.trim()) return;
    
    try {
      // Get the current file system
      const fileSystem = await getFileSystem();
      
      // Find and update the file name
      const updatedFileSystem = fileSystem.map(item => {
        if (item.id === editingItem) {
          return { ...item, name: newFileName.trim() };
        }
        return item;
      });
      
      // Save the updated file system
      await saveFileSystem(updatedFileSystem);
      
      // Refresh the folders and files
      fetchFolders();
      
      // Reset editing state
      setEditingItem(null);
      setNewFileName("");
    } catch (error) {
      console.error("Error renaming file:", error);
    }
  };

  const handleRenameCancel = () => {
    setEditingItem(null);
    setNewFileName("");
  };

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-semibold text-green-700">
          Subject
        </h2>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm bg-[#ecf1f0] dark:bg-[#444444] rounded-lg border transition-colors"
            >
              <Image
                src={subjects}
                className="h-4 w-4"
                alt="Subject folder icon"
              />
              <span className="max-w-[100px] md:max-w-[150px] truncate">
                {selectedFolder || "Select Folder"}
              </span>
              {isDropdownOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full min-w-[160px] bg-[#ecf1f0] dark:bg-[#444444] rounded-lg shadow-lg z-10">
                {loading ? (
                  <div className="px-4 py-2 text-sm ">Loading...</div>
                ) : (
                  folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => handleFolderSelect(folder)}
                      className="w-full px-4 py-2 text-left text-sm hover:backdrop-brightness-90 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {folder.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button className="p-2 bg-emerald-50 text-emerald-700 rounded-full">
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="p-6 rounded-xl w-full h-[500px] gap-8 bg-[#ecf1f0] dark:bg-[#444444] overflow-y-auto">
        {files.length > 0 ? (
          <div className="grid grid-cols-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="relative cursor-pointer hover:scale-105 transition-transform"
                onClick={(e) => {
                  if (!editingItem) {
                    handleFileClick(file);
                  }
                }}
              >
                {editingItem === file.id ? (
                  <div 
                    className="absolute inset-0 bg-white dark:bg-gray-800 p-2 rounded-lg z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <form onSubmit={handleRenameSubmit} className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="New name"
                        className="w-full px-2 py-1 border rounded text-sm"
                        autoFocus
                      />
                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={handleRenameCancel}
                          className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <>
                    <button
                      className="absolute -right-6 -top-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-full z-10"
                      onClick={(e) => handleMenuToggle(e, file.id)}
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {menuOpen === file.id && (
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
                            setEditingItem(file.id);
                            setNewFileName(file.name);
                            setMenuOpen(null);
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
                            handleDelete(file.id);
                          }}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                    
                    <Image
                      src={file.fileType === "pdf" ? PdfFile : FileNote}
                      alt={file.fileType === "pdf" ? "PDF" : "Note"}
                      className="w-[102px] h-[128px]"
                    />
                    <div className="pb-4 pt-2">
                      <p className="block text-center text-xs lg:text-sm xl:text-md w-[102px] overflow-hidden line-clamp-2 truncate">
                        {file.name || "Untitled"}
                      </p>
                      <p className="text-xs text-gray-500">{file.uploadTime}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {fileType === "pdf" ? (
              <FileUpload />
            ) : (
              <CreateNote />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectsFiles;