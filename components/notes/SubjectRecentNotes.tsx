"use client";
import React, { useEffect, useState } from "react";
// import { Folder } from 'lucide-react';
import File from "@/public/assets/images/noteplain.svg";
import Filecreate from "@/public/assets/images/notecreate.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { getAllNoteIds } from "@/db/note/canvas";
import FileSystem from "@/app/(root)/components/FileSystem";
import { useSettings } from "@/context/SettingsContext";
import { getFileById } from "@/db/pdf/fileSystem";
import { getAllPdfs } from "@/db/pdf/pdfFiles";
import { Button } from "../ui/button";

const SubjectRecentNotes = () => {
  const router = useRouter();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [documentId, setDocumentId] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [file, setfile] = useState();
  const [files, setFiles] = useState([]);
  const { setcurrentDocument, setcurrentView, setfirst } = useSettings();

  const openNotes = async (id) => {
    const pdfs = await getAllPdfs();
    const pdfExists = pdfs.some((pdf) => pdf.documentId === id);

    setcurrentDocument({ id: id, title: id });
    setfirst(true);

    if (pdfExists) {
      router.push(`/workspace/note/${id}`);
    } else {
      router.push(`/workspace/note/${id}`);
    }
  };

  const createNote = async () => {
    setDocumentId(documentId);
    setIsOverlayOpen(false);

    try {
      router.push(`/workspace/note/${documentId}`);
    } catch (error) {
      console.error("Error saving PDF:", error);
      alert("Failed to save the PDF. Please try again.");
    }
  };

  const fetchFilesFromIndexedDB = async () => {
    const ids = await getAllNoteIds();

    const files = await Promise.all(
      ids.map(async (id) => await getFileById(id))
    );

    const validFiles = files.filter(Boolean); // Remove null values

    console.log(validFiles);
    setFiles(validFiles); // Update state with only valid files
  };


  useEffect(() => {
    fetchFilesFromIndexedDB();
  }, []);

  const createNotes = () => {
    const id = uuidv4();
    setIsOverlayOpen(true);
    setFileName("Note");
    setDocumentId(id);
    // router.push(`/note/${uuidv4()}`);
  };

  return (
    <div className="rounded-lg w-full">
      <h2 className="text-2xl font-semibold text-green-700 mb-4">
        Recent Notes
      </h2>
      <div className="bg-[#ecf1f0] dark:bg-[#444444] rounded-xl w-full  h-[220px] overflow-y-auto no-scrollbar">
        {/* Create New */}

        {/* Folder Items */}
        {files.length > 0 ? (
          <div
            className="  px-4
           grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6 "
          >
            <div
              className="relative group flex flex-col items-center cursor-pointer flex-shrink-0"
              onClick={createNotes}
            >
              <div className="relative rounded-lg p-6 flex flex-col items-center">
                <Image
                  alt="folder"
                  src={Filecreate}
                  className="w-[102px] h-[128px]
                   sm:w-[120px] sm:h-[150px]
                   "
                />
                <div className="mt-2 text-center text-xs sm:text-sm md:text-md text-nowrap  font-medium rounded px-2 py-0.5">
                  Create New
                </div>
              </div>
            </div>
            {files.map((file, index) => (
              <div
                key={index}
                className="relative group flex flex-col items-center cursor-pointer flex-shrink-0"
                onClick={() => openNotes(file.id)}
              >
                <div className="relative rounded-lg p-6 flex flex-col items-center">
                  <Image
                    alt="folder"
                    src={File}
                    className="w-[102px] h-[128px]
                    sm:w-[120px] sm:h-[150px]

                     "
                  />
                  <div className="mt-2 text-center text-xs
                  sm:text-sm md:text-md font-medium rounded px-2 py-0.5">
                    {file?.name?.endsWith(".pdf")
                      ? file.name.slice(0, -4) + ".note"
                      : file?.name}
                  </div>
                </div>
                {/* <div className="relative rounded-lg p-6 flex flex-col items-center">
                  <Image
                    alt="folder"
                    src={File}
                    className="w-[102px] h-[128px]"
                  />
                  <p className="block text-center text-xs sm:text-sm lg:text-md overflow-hidden line-clamp-2 pt-2">
                    {file?.name?.endsWith(".pdf")
                      ? file.name.slice(0, -4) + ".note"
                      : file?.name}
                  </p>
                </div> */}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full flex items-center justify-center h-full">
            {currentPath.length === 0 && <div className="w-full h-full bg-[#f6f7f9] dark:bg-[#444444] rounded-xl flex flex-col items-center justify-center p-4 py-6">
              <div className="w-full p-10">
                <div
                  onClick={createNotes}
                  className="border-2 border-dashed w-full h-[190px] rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer transition-colors border-gray-300 bg-[#ecf1f0] dark:bg-[#444444] dark:border-gray-600"
                >
                  <p className="text-sm text-center font-bold lg:text-md xl:text-lg text-gray-400">
                    Create Notes
                  </p>
                </div>
              </div>
            </div>}
          </div>
        )}
      </div>

      {isOverlayOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-[#464444a0]  backdrop-blur-sm flex justify-center items-center"
          style={{ zIndex: 100 }}
        >
          <div className="w-full max-w-4xl  flex justify-center items-center rounded-xl p-4 bg-[#ecf1f0] dark:bg-[#444444]">
            <FileSystem
              currentPath={currentPath}
              setCurrentPath={setCurrentPath}
              file={{ documentId, fileName }} // Pass the documentId and fileName
              fileType="note"
              saveFile={createNote}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectRecentNotes;
