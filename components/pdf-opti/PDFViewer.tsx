"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min";
import { List, AutoSizer } from "react-virtualized";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { useSettings } from "@/context/SettingsContext";
import _ from "lodash";
import { useFetchPdf } from "@/hooks/useFetchPdf";
import { useFetchAnnotations } from "@/hooks/useFetchPdfAnnotations";
import "pdfjs-dist/web/pdf_viewer.css";
import PdfPageRender from "./PdfPageRenger";
import { PdfScrollbar } from "./PdfScrollbar";
import Loading from "@/app/loading";
import FileUpload from "../pdf/file-upload-test";
import useUserId from "@/hooks/useUserId";

// Set worker source once outside component
pdfjs.GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs";

// Extracted styles to a separate constant
const ZOOM_STYLES = `
  .pdf-canvas-container {
    transition: transform 0.2s ease;
  }
`;

export const PDFViewer = ({ id }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [pageSpacing] = useState(40);
  const { 
    viewMode, 
    setcurrentView, 
    first, 
    setisHeadderVisible, 
    currentPage,
    setCurrentPage, 
    isExpanded ,
    setisExpanded,
    setPages
  } = useSettings();
  
  const [gestureScale, setGestureScale] = useState(1);
  const lastTouchDistanceRef = useRef(null);
  const listRef = useRef(null);
  const [showZoomMessage, setShowZoomMessage] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);
  const zoomMessageTimerRef = useRef(null);
  const baseScaleRef = useRef(1);
  const previousScrollTopRef = useRef(0);
  const touchMoveTimerRef = useRef(null);
  const wheelTimerRef = useRef(null);
  const renderedPagesRef = useRef(new Set());
  
  // Style injection - moved to a separate effect with cleanup
  useEffect(() => {
    const styleId = "pdf-viewer-zoom-styles";
    let styleTag = document.getElementById(styleId);
    
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      styleTag.innerHTML = ZOOM_STYLES;
      document.head.appendChild(styleTag);
    }
    
    return () => {
      if (styleTag && document.head.contains(styleTag)) {
        document.head.removeChild(styleTag);
      }
    };
  }, []);

  // Set view mode once
  useEffect(() => {

      setcurrentView("read");

  }, [setcurrentView]);


  
  const userId = useUserId();

  // Fetch PDF data
  const { pdf, pageHeight, pageWidth, isPdfLoaded } = useFetchPdf({
    id,
    userId,
  });

  // Fetch annotations
  const { fetchAnnotations } = useFetchAnnotations({
    userId,
    documentId: id,
  });

  // Fetch annotations when PDF is loaded - only once
  useEffect(() => {
    if (fetchAnnotations && isPdfLoaded && pdf) {
      fetchAnnotations();
      setPages(pdf.numPages)

    }
  }, [fetchAnnotations, isPdfLoaded, pdf]);

  // Memoized zoom message display with cleanup
  const showTemporaryZoomMessage = useCallback((newZoomPercentage, reason) => {
    const message = reason === "fit-width" ? "Fit to width" : `${newZoomPercentage}%`;
    
    setZoomPercent(message);
    setShowZoomMessage(true);
    
    if (zoomMessageTimerRef.current) {
      clearTimeout(zoomMessageTimerRef.current);
    }
    
    zoomMessageTimerRef.current = setTimeout(() => {
      const messageEl = document.querySelector(".zoom-message");
      if (messageEl) {
        messageEl.classList.add("hiding");
        setTimeout(() => setShowZoomMessage(false), 300);
      } else {
        setShowZoomMessage(false);
      }
    }, 1500);
  }, []);

  // Memoized scale calculation
  const calculateScale = useCallback(() => {
    if (!pageWidth) return 1;

    const windowWidth = window.innerWidth - 32;
    const contentWidth = viewMode === "double" ? pageWidth * 2 : pageWidth;
    const fullWidthScale = windowWidth / contentWidth;
    
    baseScaleRef.current = fullWidthScale;
    return fullWidthScale * gestureScale;
  }, [pageWidth, viewMode, gestureScale]);

  // Update scale with memoization to prevent unnecessary recalculations
  const currentScaleValue = useMemo(() => {
    if (!pageWidth) return 1;
    return calculateScale();
  }, [calculateScale, pageWidth]);

  // Only update scale state when it actually changes
  useEffect(() => {
    if (Math.abs(scale - currentScaleValue) > 0.01) {
      setScale(currentScaleValue);
      
      const zoomPercentage = Math.round(gestureScale * 100);
      if (Math.abs(gestureScale - 1) < 0.05) {
        showTemporaryZoomMessage(100, "fit-width");
      } else {
        showTemporaryZoomMessage(zoomPercentage, "zoom");
      }
    }
  }, [currentScaleValue, scale, gestureScale, showTemporaryZoomMessage]);

  // Highly optimized window resize handler
  useEffect(() => {
    const handleResize = _.debounce(() => {
      const newScale = calculateScale();
      if (Math.abs(scale - newScale) > 0.01) {
        setScale(newScale);
      }
    }, 250);

    window.addEventListener("resize", handleResize);
    return () => {
      handleResize.cancel();
      window.removeEventListener("resize", handleResize);
    };
  }, [calculateScale, scale]);

  // Optimized touch event handlers with throttling
  useEffect(() => {
    if (!containerRef.current) return;
    
    const getTouchCenter = (touch1, touch2) => ({
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    });

    let lastTouchMidPoint = null;
    let initialScrollPosition = { top: 0, left: 0 };

    const handleTouchStart = (e) => {
      if (e.touches.length !== 2) return;
      
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      lastTouchDistanceRef.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      lastTouchMidPoint = getTouchCenter(touch1, touch2);
      
      if (listRef.current?.Grid?._scrollingContainer) {
        const container = listRef.current.Grid._scrollingContainer;
        initialScrollPosition = {
          top: container.scrollTop,
          left: container.scrollLeft,
        };
      }
    };

    // Throttled touch move handler to reduce calculations
    const handleTouchMove = (e) => {
      if (e.touches.length !== 2 || lastTouchDistanceRef.current === null) return;
      
      e.preventDefault();
      
      // Throttle the touch move event
      if (touchMoveTimerRef.current) return;
      
      touchMoveTimerRef.current = setTimeout(() => {
        touchMoveTimerRef.current = null;
      }, 16); // ~60fps
      
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scaleFactor = distance / lastTouchDistanceRef.current;
      const newGestureScale = Math.max(0.5, Math.min(1, gestureScale * scaleFactor));
      
      // Only update if change is significant
      if (Math.abs(newGestureScale - gestureScale) > 0.01) {
        setGestureScale(newGestureScale);
        
        const zoomPercentage = Math.round(newGestureScale * 100);
        showTemporaryZoomMessage(zoomPercentage, "zoom");
      }
      
      const currentMidPoint = getTouchCenter(touch1, touch2);
      
      if (lastTouchMidPoint && listRef.current?.Grid?._scrollingContainer && gestureScale > 1.05) {
        const deltaX = currentMidPoint.x - lastTouchMidPoint.x;
        const deltaY = currentMidPoint.y - lastTouchMidPoint.y;
        
        const container = listRef.current.Grid._scrollingContainer;
        container.scrollTop = initialScrollPosition.top - deltaY;
        container.scrollLeft = initialScrollPosition.left - deltaX;
      }
      
      lastTouchDistanceRef.current = distance;
    };

    const handleTouchEnd = () => {
      lastTouchDistanceRef.current = null;
      lastTouchMidPoint = null;
      
      if (touchMoveTimerRef.current) {
        clearTimeout(touchMoveTimerRef.current);
        touchMoveTimerRef.current = null;
      }
    };

    // Throttled wheel handler
    const handleWheel = (e) => {
      if (!e.ctrlKey) return;
      
      e.preventDefault();
      
      // Throttle the wheel event
      if (wheelTimerRef.current) return;
      
      wheelTimerRef.current = setTimeout(() => {
        wheelTimerRef.current = null;
      }, 16); // ~60fps
      
      const delta = e.deltaY * -0.005;
      const newGestureScale = Math.max(0.5, Math.min(1, gestureScale + delta));
      
      // Only update if change is significant
      if (Math.abs(newGestureScale - gestureScale) > 0.01) {
        setGestureScale(newGestureScale);
        
        const zoomPercentage = Math.round(newGestureScale * 100);
        showTemporaryZoomMessage(zoomPercentage, "zoom");
      }
    };

    const container = containerRef.current;
    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("wheel", handleWheel, { passive: false });
    
    return () => {
      if (touchMoveTimerRef.current) {
        clearTimeout(touchMoveTimerRef.current);
      }
      if (wheelTimerRef.current) {
        clearTimeout(wheelTimerRef.current);
      }
      
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("wheel", handleWheel);
    };
  }, [gestureScale, showTemporaryZoomMessage]);

  // Reset zoom button handler
  const handleZoomReset = useCallback(() => {
 if(isExpanded){
  setGestureScale(1);
  showTemporaryZoomMessage(100, "fit-width");
 }
 else{
  setGestureScale(0.5);
  showTemporaryZoomMessage(50, "50%");
 }
   
    
    // Clear rendering cache when resetting zoom
    renderedPagesRef.current.clear();
  }, [showTemporaryZoomMessage,isExpanded]);

  // Memory-optimized page rendering with page caching
  const renderPage = useCallback(
    ({ index, key, style }) => {
      if (!pdf) return null;

      // Add to rendered pages set for memory management
      renderedPagesRef.current.add(index);
      
      if (viewMode === "double") {
        const leftPageIndex = index * 2;
        const rightPageIndex = leftPageIndex + 1;
        
        // Spacing calculations - precalculated
        const spacingTop = Math.round((pageSpacing / 2) * scale);
        const spacingBetween = Math.round(20 * scale);

        return (
          <div
            key={key}
            style={{
              ...style,
              display: "flex",
              justifyContent: "center",
              gap: `${spacingBetween}px`,
              paddingTop: `${spacingTop}px`,
              paddingBottom: `${spacingTop}px`,
            }}
          >
            {leftPageIndex < pdf.numPages && (
              <PdfPageRender
                pdf={pdf}
                pageIndex={leftPageIndex}
                currentDocumentId={id}
                scale={scale}
              />
            )}
            {rightPageIndex < pdf.numPages && (
              <PdfPageRender
                pdf={pdf}
                pageIndex={rightPageIndex}
                currentDocumentId={id}
                scale={scale}
              />
            )}
          </div>
        );
      } else {
        const spacingTop = Math.round((pageSpacing / 2) * scale);
        
        return (
          <div
            key={key}
            style={{
              ...style,
              display: "flex",
              justifyContent: "center",
              paddingTop: `${spacingTop}px`,
              paddingBottom: `${spacingTop}px`,
            }}
          >
            <PdfPageRender
              pdf={pdf}
              pageIndex={index}
              currentDocumentId={id}
              scale={scale}
            />
          </div>
        );
      }
    },
    [pdf, scale, id, viewMode, pageSpacing]
  );

  // Heavily optimized header visibility handler
  const debouncedSetHeaderVisibility = useMemo(() => 
    _.debounce((isVisible) => {
      setisHeadderVisible(isVisible);
    }, 250),
    [setisHeadderVisible]
  );

  // Clean up debounced functions on unmount
  useEffect(() => {
    return () => {
      debouncedSetHeaderVisibility.cancel();
      if (zoomMessageTimerRef.current) {
        clearTimeout(zoomMessageTimerRef.current);
      }
    };
  }, [debouncedSetHeaderVisibility]);

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(
    _.throttle(({ scrollTop }) => {
      if (!pdf) return;
      
      const rowHeight = pageHeight * scale + pageSpacing * scale;
      const currentRow = Math.floor(scrollTop / rowHeight);
      const currentPageNum = viewMode === "double" ? currentRow * 2 + 1 : currentRow + 1;
      
      // Only update if page changed
      if (currentPageNum !== currentPage && currentPageNum <= pdf.numPages) {
        setCurrentPage(currentPageNum);
      }
      
      // Update header visibility based on scroll direction
      const scrollDelta = scrollTop - previousScrollTopRef.current;
      if (Math.abs(scrollDelta) > 10) { // Only process significant scroll changes
        if (scrollDelta > 0) {
          debouncedSetHeaderVisibility(false);
        } else {
          debouncedSetHeaderVisibility(true);
        }
        previousScrollTopRef.current = scrollTop;
      }
    }, 100),
    [
      debouncedSetHeaderVisibility,
      pageHeight,
      scale,
      pageSpacing,
      viewMode,
      pdf,
      setCurrentPage,
      currentPage
    ]
  );

  // Clean up throttled scroll handler
  useEffect(() => {
    return () => {
      handleScroll.cancel();
    };
  }, [handleScroll]);

  // Reset zoom when expanded state changes
  useEffect(() => {
    if (isExpanded !== undefined) {
      handleZoomReset();
    }
  }, [isExpanded, handleZoomReset]);

  // Memory management: periodically clean up pages that are no longer visible
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Get visible indices from list
      const visibleIndices = new Set();
      
      if (listRef.current?.Grid?._renderedRowStartIndex !== undefined && 
          listRef.current?.Grid?._renderedRowStopIndex !== undefined) {
        
        const startIdx = listRef.current.Grid._renderedRowStartIndex;
        const endIdx = listRef.current.Grid._renderedRowStopIndex;
        
        // Add visible and overscan (+-1) rows to the set
        for (let i = Math.max(0, startIdx - 1); i <= endIdx + 1; i++) {
          visibleIndices.add(i);
        }
        
        // Find pages to clean up (not visible but in rendered set)
        for (const pageIdx of renderedPagesRef.current) {
          if (!visibleIndices.has(pageIdx)) {
            // Queue for removal from rendered set
            setTimeout(() => {
              renderedPagesRef.current.delete(pageIdx);
            }, 1000);
          }
        }
      }
    }, 5000); // Check every 5 seconds
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  // Optimized list size recalculation
  const debouncedRecomputeListSize = useMemo(() => 
    _.debounce(() => {
      if (listRef.current) {
        listRef.current.recomputeRowHeights();
      }
    }, 250),
    []
  );

  // Clean up the debounced recompute function
  useEffect(() => {
    return () => {
      debouncedRecomputeListSize.cancel();
    };
  }, [debouncedRecomputeListSize]);

  // Trigger list recomputation when scale changes
  useEffect(() => {
    if (scale > 0 && listRef.current) {
      debouncedRecomputeListSize();
    }
  }, [scale, debouncedRecomputeListSize]);

  // Optimized scroll to page function
  const scrollToPage = useCallback((pageNumber) => {
    if (!pdf || pageNumber < 1 || pageNumber > pdf.numPages || !listRef.current) {
      return;
    }
    
    const targetRow = viewMode === "double" 
      ? Math.floor((pageNumber - 1) / 2) 
      : pageNumber - 1;
    
    const scrollPosition = targetRow * (pageHeight * scale + pageSpacing * scale);
    
    listRef.current.scrollToPosition(scrollPosition);
    setCurrentPage(pageNumber);
  }, [pdf, viewMode, pageHeight, scale, pageSpacing, setCurrentPage]);

  // Initialize with smaller zoom for better performance
  useEffect(() => {
    setisExpanded(false)
  }, []);

  // Memoized row count calculation
  const rowCount = useMemo(() => {
    if (!pdf) return 0;
    return viewMode === "double" ? Math.ceil(pdf.numPages / 2) : pdf.numPages;
  }, [pdf, viewMode]);

  // Memoized row height calculation
  const rowHeight = useMemo(() => {
    return pageHeight * scale + pageSpacing * scale;
  }, [pageHeight, scale, pageSpacing]);

  return (
    <div className="p-4 relative">




      {/* Loading indicator */}
      {!isPdfLoaded && <Loading />}

      {/* Scrollbar - only if needed */}
      {pdf && pdf.numPages > 1 && (
        <PdfScrollbar
          pdf={pdf}
          currentPage={currentPage}
          totalPages={pdf.numPages}
          onScrollToPage={scrollToPage}
        />
      )}

      <div ref={containerRef} className="w-full h-[100vh]">
        {pdf && pdf.numPages ? (
          <AutoSizer>
            {({ height, width }) => (
              <List
                ref={listRef}
                width={width}
                height={height}
                rowCount={rowCount}
                rowHeight={rowHeight}
                rowRenderer={renderPage}
                overscanRowCount={1}
                onScroll={handleScroll}
                className="remove-scrollbar"
                scrollToAlignment="start"
                containerStyle={{ willChange: 'transform' }}
                // Memory optimization
                style={{ overflowX: 'hidden' }}
              />
            )}
          </AutoSizer>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isPdfLoaded && !pdf && <FileUpload />}
          </div>
        )}
      </div>
    </div>
  );
};

export default function PDFViewerWrapper({ id }) {
  return <PDFViewer id={id} />;
}