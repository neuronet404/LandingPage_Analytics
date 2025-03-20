"use client";

import { useState, useEffect } from "react";
import PdfViewerComponent from "@/components/PdfViewerComponent";

import { useParams } from "next/navigation";
import ExcalidrawComponent from "@/components/canvas/excalidraw/ExcalidrawComponent";
import { useSettings } from "@/context/SettingsContext";

export default function page() {
  const [isExpanded, setIsExpanded] = useState(true);
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const { id }: { id: string } = useParams();
  const { data, setcurrentDocumentId } = useSettings();
  useEffect(() => {
    setcurrentDocumentId(id);
    console.log("current doc id  in the PDF",id)
  }, [id]);
  return (
    <div className="h-full w-full overflow-hidden">
      {/* <AnnotationManager currentDocumentId={id} /> */}

      <div className="flex flex-col items-center pb-8   overflow-hidden">
        <PdfViewerComponent isExpanded={isExpanded} id={id} />
        {/* <PdfSync id={id} /> */}

        {data && (
          <div
            className="fixed inset-0  overflow-hidden w-full h-full bg-transparent"
            style={{ zIndex: 0 }}
          >
            <ExcalidrawComponent id={id} isTransparent={true} />
          </div>
        )}
      </div>
    </div>
  );
}
