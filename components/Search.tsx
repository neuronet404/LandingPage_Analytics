"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import pdfsearch from "@/public/assets/images/pdfsearch.svg";
import Subjects from "@/public/assets/images/folder.svg";
import FileNote from "@/public/assets/images/noteplain.svg";
import PdfFile from "@/public/assets/images/pdf-file.svg";
import { getFileSystem } from "@/db/pdf/fileSystem";
import { Search as SearchIcon } from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  parentId?: string;
  documentId?: string;
  uploadTime?: string;
  type?: "pdf" | "note";
  fileType?: string;
  isOpen?: boolean;
  isActive?: boolean;
  files: FileItem[];
}

interface SearchResult {
  folders: FileItem[];
  files: FileItem[];
}

const Search = () => {
  const [searchText, setSearchText] = useState("");
  const [allData, setAllData] = useState<FileItem[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult>({
    folders: [],
    files: [],
  });
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFileSystem();
        setAllData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        resultsRef.current &&
        !searchBarRef.current.contains(event.target as Node) &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchInData = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults({ folders: [], files: [] });
      return;
    }

    const term = searchTerm.toLowerCase();

    const matchedFolders = allData.filter(
      (item) => !item.documentId && item.name.toLowerCase().includes(term)
    );

    const matchedFiles = allData.filter(
      (item) => item.documentId && item.name.toLowerCase().includes(term)
    );

    setSearchResults({
      folders: matchedFolders,
      files: matchedFiles,
    });
    setShowResults(true);
  };

  const handleSearch = () => {
    searchInData(searchText);
  };

  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      searchInData(searchText);
    }, 300);

    return () => clearTimeout(debounceSearch);
  }, [searchText]);

  return (
    <div className="relative w-full">
      <div ref={searchBarRef} className="w-full">
        <form
          className="w-full relative group"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <div className="relative w-full h-[50px] group-hover:h-[60px] sm:group-hover:h-[68px] bg-white dark:bg-[#444444] rounded-[12px] sm:rounded-[18px] shadow-lg border border-gray-300 dark:border-gray-600 overflow-hidden transition-all duration-300 ease-in-out">
            <div className="absolute left-2 xs:left-3 top-1/2 transform -translate-y-1/2 ml-0 xs:ml-1 sm:ml-4">
              <SearchIcon width={16} height={16} />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search in folders and files..."
              className="w-full py-1 xs:py-2 pl-8 xs:pl-10 sm:pl-16 pr-2 xs:pr-4 sm:pr-8 font-rubik text-black dark:text-white focus:outline-none h-[40px] xs:h-[42px] sm:h-[43px] transition-colors duration-300 truncate bg-transparent"
              onFocus={() => setShowResults(true)}
            />

            <div className="absolute top-[40px] pl-8 xs:pl-10 sm:pl-16 w-full text-black text-xs sm:text-[14px] px-2 xs:px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate">
              Search across all folders and files
            </div>
          </div>
        </form>
      </div>

      {showResults &&
        (searchResults.folders.length > 0 ||
          searchResults.files.length > 0) && (
          <div
            ref={resultsRef}
            className="absolute top-20 w-full left-0 max-h-[600px] overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200 z-40"
          >
            {/* Folders Section */}
            {searchResults.folders.length > 0 && (
              <div className="p-4 border-b border-gray-200">
                <div className="space-y-2">
                  {searchResults.folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <Image
                        src={
                          folder.fileType === "note"
                            ? FileNote
                            : folder.fileType === "pdf"
                            ? PdfFile
                            : Subjects
                        }
                        alt={
                          folder.fileType === "folder"
                            ? "Folder"
                            : folder.fileType === "pdf"
                            ? "PDF"
                            : "Note"
                        }
                        width={16}
                        height={16}
                        className="text-gray-400"
                      />

                      <span className="text-sm text-gray-700">
                        {folder.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            )}
          </div>
        )}
    </div>
  );
};

export default Search;
