"use client"

import { useSettings } from "@/context/SettingsContext";
import { useEffect, useRef, useState } from "react";
import ExcalidrawComponent from "./canvas/excalidraw/ExcalidrawComponent";
import PdfViewer from "@/components/test/Test";
import {PDFViewer}  from "./pdf-opti/PDFViewer";

interface PdfViewerComponentProps {
  isExpanded: boolean;
  id: string;
}

export default function PdfViewerComponent({ isExpanded, id }: PdfViewerComponentProps) {
  const a4Height = 297;
  const containerNodeRef = useRef<HTMLDivElement>(null);
  const { setcurrentDocumentId } = useSettings();
   const { theme } = useSettings();

  // Set the current document ID whenever `id` changes
  useEffect(() => {
    setcurrentDocumentId(id);
  }, [id, setcurrentDocumentId]);



  return (
    <div
    className={`transition-all  w-full flex justify-center  relative overflow-hidden duration-300  ease-in-out 
      ${theme === 'Dark Brown' ? 'bg-[#413F3A]' :
      theme === 'Deep Red' ? 'bg-[#3E2C2D]' :
      theme === 'Midnight Blue' ? 'bg-[#3B454B]' :
      theme === 'Deep Purple' ? 'bg-[#413B4B]' :
      theme === 'Charcoal Black' ? 'bg-[#454545]' :
      theme === 'Very Dark Purple' ? 'bg-[#2D2C3E]' : 
      theme === 'light' ? 'bg-[#EEF1F5]' : ''
    }`}

      ref={containerNodeRef}
    >
      {/* Conditional rendering based on `first` state */}
      { (
        <div className="w-full overflow-hidden">
          {/* <PdfViewer id={id}/> */}
          <PDFViewer id={id}/>
        </div>
      )}

      {/* This is the PDF note component, rendered when `first` is true */}
      {/* {first && (
        <div className="w-[100vw] h-screen overflow-hidden absolute" >
          <ExcalidrawComponent id={id} />
        </div>
      )} */}
    </div>
  );
}
