"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useInView } from "react-intersection-observer";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { useSettings } from "@/context/SettingsContext";
import { debounce } from "lodash";

const ExcalidrawFabric = lazy(
  () => import("@/components/canvas/excalidraw/test/ExcalidrawFabric")
);
const ExcalidrawFab = lazy(
  () => import("@/components/canvas/excalidraw/test/ExcalidrawFab")
);
const Loading = ({ message }) => (
  <div className="text-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
    <p className="mt-2 text-gray-600">{message}</p>
  </div>
);
const ErrorComponent = ({ message }) => (
  <div className="text-red-500 text-center">{message}</div>
);
const ViewMode = {
  SINGLE: "single",
  DOUBLE: "double",
  CAROUSEL: "carousel",
};

// Memoized PDFPageView component
const PDFPageView = React.memo(
  ({ pageNumber, zoom, isDarkFilter, onLoadSuccess }) => {
    useEffect(() => {
      console.log(zoom);
    }, [zoom]);
    return (
      <div style={{ filter: isDarkFilter ? "invert(1)" : "none" }}>
        <Page
          pageNumber={pageNumber}
          scale={zoom}
          onLoadSuccess={onLoadSuccess}
          className="mx-auto rounded-md overflow-hidden"
          renderTextLayer={true}
          renderAnnotationLayer={false}
          loading={<Loading message={`Loading page ${pageNumber}...`} />}
          error={
            <ErrorComponent message={`Error loading page ${pageNumber}`} />
          }
        />
      </div>
    );
  }
);

export const ExcalidrawOverlay = React.memo(
  ({ pageNumber, currentDocumentId, zoom, setZoom, scrollPdf }) => {
    const { pageDimensions } = useSettings();

    // Log pageDimensions whenever it changes
    useEffect(() => {
      if (pageDimensions) {
        // console.log("Page Dimensions:", pageDimensions);
      }
    }, [pageDimensions]);

    // Fallback for missing dimensions
    const width = (pageDimensions?.width || 0) * zoom;
    const height = (pageDimensions?.height || 0) * zoom;

    return (
      <div
        className="absolute top-0 left-0"
        id={`excalidraw-page-${pageNumber}`}
        style={{
          pointerEvents: scrollPdf ? "none" : "auto",
          width,
          height,
        }}
      >
        <Suspense fallback={null}>
          <ExcalidrawFabric
            pageIndex={pageNumber}
            currentDocumentId={currentDocumentId}
            zoom={zoom / 3} // Adjusted zoom scaling
            setZoom={setZoom}
          />
        </Suspense>
      </div>
    );
  }
);
const ExcalidrawOverlay1 = React.memo(
  ({ pageNumber, currentDocumentId, zoom, setZoom, scrollPdf }) => {
    const { pageDimensions,activeTool } = useSettings();


    // Log pageDimensions whenever it changes
    useEffect(() => {
      if (pageDimensions) {
        // console.log("Page Dimensions:", pageDimensions);
      }
    }, [pageDimensions]);

    // Fallback for missing dimensions
    const width = (pageDimensions?.width || 0) * zoom;
    const height = (pageDimensions?.height || 0) * zoom;

    return (
      <div
        className="absolute top-0 left-0"
        id={`excalidraw-page-${pageNumber}`}
        style={{
          pointerEvents: scrollPdf ? "none" : "auto",
          width,
          height,
        }}
      >
        <Suspense fallback={null}>
          <ExcalidrawFab
            pageIndex={pageNumber}
            currentDocumentId={currentDocumentId}
            zoom={1} // Adjusted zoom scaling
            setZoom={setZoom}
          />
        </Suspense>
      </div>
    );
  }
);
// Memoized PDFPageContainer component
const PDFPageContainer = ({ pageNumber, zoom, setZoom, onLoadSuccess }) => {
  const containerRef = useRef(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px 0px",
    triggerOnce: false,
  });
  const { isDarkFilter, currentDocumentId, scrollPdf } = useSettings();
  useEffect(() => {
    console.log("Page is loading", pageNumber);
  }, [pageNumber]);

  // Calculate zoom only when necessary

  // Only render content when in view or nearby
  return (
    <div className="scrollbar-hidden max-w-full p-2 relative remove-scrollbar">
      {
        <div className="w-full h-full relative">
          <PDFPageView
            pageNumber={pageNumber}
            zoom={zoom}
            isDarkFilter={isDarkFilter}
            onLoadSuccess={onLoadSuccess}
          />
          {/* Uncomment this section for Excalidraw overlay */}
          {
            <ExcalidrawOverlay
              pageNumber={pageNumber}
              currentDocumentId={currentDocumentId}
              zoom={zoom}
              setZoom={setZoom}
              scrollPdf={scrollPdf}
            />
          }
          {
            <ExcalidrawOverlay1
              pageNumber={pageNumber}
              currentDocumentId={currentDocumentId}
              zoom={zoom}
              setZoom={setZoom}
              scrollPdf={scrollPdf}
            />
          }
        </div>
      }
    </div>
  );
};

export default React.memo(PDFPageContainer);
