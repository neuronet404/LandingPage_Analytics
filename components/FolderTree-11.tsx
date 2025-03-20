import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  File,
  MoreVertical,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getFileSystem } from "@/db/pdf/fileSystem"; // Adjust import as needed
import { FileUploadWrapper } from "@/components/pdf/file-upload";

import FileNote from "@/public/assets/icons/file-pdf.svg";
import PdfFile from "@/public/assets/icons/notes.svg";
import Image from "next/image";

const FolderTree = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [fileType, setFileType] = useState<"note" | "pdf">();

  // Fetch folder data dynamically
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const data = await getFileSystem(); // Fetch the folder structure
        const formattedData = formatFolderStructure(data);
        setFolders(formattedData);
      } catch (error) {
        console.error("Error fetching folders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, []);

  // Helper function to format folder structure
  const formatFolderStructure = (data) => {
    const folderMap: any = {};
    const rootFolders: any[] = [];

    // Create a map of all folders and notes
    data.forEach((item) => {
      folderMap[item.id] = {
        ...item,
        isOpen: false,
        isActive: false,
        files: [],
      };
    });

    // Organize folders and notes by parentId
    data.forEach((item) => {
      if (item.parentId) {
        folderMap[item.parentId].files.push(folderMap[item.id]);
      } else {
        rootFolders.push(folderMap[item.id]);
      }
    });

    return rootFolders;
  };

  const toggleFolder = (e, folderId) => {
    e.stopPropagation(); // Prevent event from bubbling
    setFolders((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === folderId ? { ...folder, isOpen: !folder.isOpen } : folder
      )
    );
  };

  const selectFolder = (folderId) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder) => ({
        ...folder,
        isActive: folder.id === folderId,
      }))
    );
  };

  const handleFolderClick = (e, folder) => {
    selectFolder(folder.id);
  };

  const handleChevronClick = (e, folderId) => {
    toggleFolder(e, folderId);
  };

  const handleMoreClick = (e) => {
    e.stopPropagation(); // Prevent folder selection when clicking more options
  };

  if (loading) {
    // Use a narrower width at smaller breakpoints
    return null;
  }

  return (
    <>
      {/* File Upload Dialog */}
      {isOpen && (
        <FileUploadWrapper
          isUploadPdf={isOpen}
          setIsOpen={setIsOpen}
          fileType={fileType}
        />
      )}

      {/* Top “SUBJECTS” row */}
      <div className="flex items-center justify-between px-3 py-2">
        {/* Hide text below 1024px */}
        <span className="hidden lg:inline-block text-xs font-semibold font-rubik text-gray-500 lg:text-sm xl:text-md">
          SUBJECTS
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-gray-100"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setIsOpen(true);
                setFileType("pdf");
              }}
            >
              <File className="mr-2 h-4 w-4" />
              Create PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIsOpen(true);
                setFileType("note");
              }}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Notes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Folder & Files list */}
      <div className="w-full overflow-auto max-h-[30%] remove-scrollbar pb-12">
        <div className="p-3">
          {folders.map((folder) => (
            <div key={folder.id}>
              <div
                className={`mb-1 rounded-lg ${
                  folder.isActive ? "bg-[#F4F1FF]" : "hover:bg-gray-50"
                }`}
              >
                <div
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={(e) => handleFolderClick(e, folder)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        folder.isActive ? "bg-purple-600" : "bg-orange-400"
                      }`}
                    />
                    {/* Hide folder name below 1024px */}
                    <span
                      className={`hidden lg:inline-block lg:text-sm xl:text-md text-xs ${
                        folder.isActive
                          ? "text-purple-600 font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      {folder.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {folder.files.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-white/50 hidden lg:inline-flex"
                        onClick={(e) => handleChevronClick(e, folder.id)}
                      >
                        {folder.isOpen ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-white/50 hidden lg:inline-flex"
                      onClick={handleMoreClick}
                    >
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Files tree view */}
              <div
                className={`ml-7 pl-4 border-l border-gray-200 overflow-hidden transition-all duration-200 ease-in-out ${
                  folder.isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {folder.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer ml-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    <Image
                      className="w-4 h-4"
                      src={file.fileType === "pdf" ? PdfFile : FileNote}
                      alt="icon"
                    />
                    {/* Hide file name below 1024px */}
                    <span className="hidden lg:inline-block text-sm text-gray-600">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FolderTree;
