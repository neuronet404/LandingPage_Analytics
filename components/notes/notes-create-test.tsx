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

const CreateNote = () => {
  const router = useRouter();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [documentId, setDocumentId] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [file, setfile] = useState();
  const [files, setFiles] = useState([]);
  const { setcurrentDocument, setcurrentView, setfirst } = useSettings();

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

  const createNotes = () => {
    const id = uuidv4();
    setIsOverlayOpen(true);
    setFileName("Note");
    setDocumentId(id);
    // router.push(`/note/${uuidv4()}`);
  };

  return (
    <div className="rounded-lg w-full flex items-center justify-center">
        <Button onClick={createNotes} variant={"outline"}>create notes </Button>

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

export default CreateNote;
