
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Document,Thumbnail } from "react-pdf";
import { getPdfById } from "@/db/pdf/pdfFiles";
import { useSettings } from "@/context/SettingsContext";
// Thumbnail Scrollbar Component
export const ThumbnailDiv = ({
    currentPage,
    setCurrentPage,
    totalPages,
    scrollToPage,
  }) => {
    const [isDragging, setIsDragging] = useState(false);
    const scrollbarRef = useRef(null);
    const [draggedPage, setDraggedPage] = useState(currentPage);
    const [page, setpage] = useState(1);
    const currentDocumentId  = "ce88edfe-dd58-4b79-b557-b751eba45c62"
    const [pdfData, setPdfData] = useState<string | null>(null);
  
    useEffect(() => {
      setpage(currentPage);
    }, [currentPage]);
  
    useEffect(() => {
      // scrollToPage(currentPage);
    }, [draggedPage]);
  
    const handleFetchPdf = async () => {
      try {
        // d97e169c-ea97-4de6-a2fe-68e3547498e6
        const pdf = await getPdfById(currentDocumentId);
        if (pdf?.base64) {
          // Convert the base64 string to a data URL
          const dataUrl = pdf.base64;
          setPdfData(dataUrl);
        }
      } catch (error) {
        console.error("Error fetching PDF:", error);
      }
    };
  
    useEffect(() => {
      handleFetchPdf();
    }, [currentDocumentId]);
  
    const handleDrag = (e) => {
      if (!isDragging || !scrollbarRef.current) return;
  
      const scrollbar = scrollbarRef.current.getBoundingClientRect();
      const relativeY = Math.max(
        0,
        Math.min(e.clientY - scrollbar.top, scrollbar.height)
      );
      const percentage = relativeY / scrollbar.height;
      const newPage = Math.max(
        1,
        Math.min(Math.ceil(percentage * totalPages), totalPages)
      );
      setpage(newPage);
      setDraggedPage(newPage); // Update draggedPage but don't scroll yet
    };
  
    const handleDragStart = () => setIsDragging(true);
  
    const handleDragEnd = () => {
      setIsDragging(false);
      setCurrentPage(draggedPage); // Update the current page
      scrollToPage(draggedPage); // Scroll to the dragged page
    };
  
    useEffect(() => {
      const handleMouseMove = (e) => handleDrag(e);
      const handleMouseUp = handleDragEnd;
  
      if (isDragging) {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
      }
  
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, [isDragging, draggedPage]);
  
    return (
      <div className="h-screen absolute top-36">
        <div
          className="flex h-[80%] mt-44 w-full  relative"
          style={{ userSelect: "none" }}
        >
          <div className="absolute right-0 top-0 h-full">
            <div
              ref={scrollbarRef}
              className="w-[6px] h-full  relative rounded-full mr-1"
            >
              <div
                className="absolute right-6 -ml-24   p-2 rounded transform -translate-x-2 flex flex-col justify-center items-center space-y-2"
                style={{
                  top: `${((draggedPage - 1) / (totalPages - 1)) * 100}%`,
                  transform: "translateY(-50%)",
                }}
              >
                <div>
                  {page}/ <span className="text-slate-500">{totalPages}</span>
                </div>
                <Document
                  file={pdfData}
                  className={" shadow-lg rounded-md overflow-hidden"}
                >
                  <div>
                    <Thumbnail pageNumber={page} scale={0.2} />
                  </div>
                </Document>
              </div>
              <div
                className="w-[6px] h-[71px] bg-purple-500 cursor-pointer rounded-full transform transition-transform duration-300 hover:scale-150"
                style={{
                  position: "absolute",
                  top: `${((draggedPage - 1) / (totalPages - 1)) * 100}%`,
                  transform: "translateY(-50%)", // Inline transform to adjust position
                }}
                onMouseDown={handleDragStart}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };