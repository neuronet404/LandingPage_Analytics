"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import _ from "lodash"; // Ensure lodash is imported for debounce function
export const PdfScrollbar = ({ pdf, currentPage, totalPages, onScrollToPage }) => {
    // Create a debounced version of the scroll handler
    const debouncedScrollToPage = useCallback(
      _.debounce((pageNumber) => {
        onScrollToPage(pageNumber);
      }, 200),
      [onScrollToPage]
    );
    const [interactionEnabled, setInteractionEnabled] = useState(true);
    const scrollbarRef = useRef(null);
    const thumbRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [thumbHeight, setThumbHeight] = useState(30);
    const [thumbPosition, setThumbPosition] = useState(0);
    const [showThumbnail, setShowThumbnail] = useState(false);
    const [thumbnailData, setThumbnailData] = useState(null);
    const [loadingThumbnail, setLoadingThumbnail] = useState(false);
    const [previewPage, setPreviewPage] = useState(0);
  
    // Cancel any pending debounced calls when component unmounts or dependencies change
    useEffect(() => {
      return () => {
        debouncedScrollToPage.cancel();
      };
    }, [debouncedScrollToPage]);
    
    // Keep previewPage in sync with currentPage when not dragging
    useEffect(() => {
      if (!dragging) {
        setPreviewPage(currentPage);
      }
    }, [currentPage, dragging]);
  
    // Calculate thumb height and position based on document size
    useEffect(() => {
      if (!pdf || !scrollbarRef.current) return;
  
      const scrollbarHeight = scrollbarRef.current.clientHeight;
      const minThumbHeight = 30; // Minimum height for thumb
  
      // Calculate proportional thumb height
      const calculatedHeight =
        (scrollbarHeight / totalPages) * Math.min(totalPages, 10);
      const newThumbHeight = Math.max(minThumbHeight, calculatedHeight);
  
      setThumbHeight(newThumbHeight);
  
      // Calculate position based on current page
      const maxPosition = scrollbarHeight - newThumbHeight;
      const newPosition = ((currentPage - 1) / (totalPages - 1)) * maxPosition;
      setThumbPosition(Math.max(0, Math.min(maxPosition, newPosition)));
    }, [pdf, totalPages, currentPage, scrollbarRef]);
  
    // Generate thumbnail when needed
    useEffect(() => {
      let isMounted = true;
      
      const generateThumbnail = async () => {
        if (!pdf || !showThumbnail) return;
        
        try {
          setLoadingThumbnail(true);
          
          // Use previewPage for thumbnails during dragging, otherwise use currentPage
          const pageToShow = dragging ? previewPage : currentPage;
          
          // Log the PDF object structure to aid debugging (only in development)
          if (process.env.NODE_ENV === 'development') {
            console.log('PDF object type:', typeof pdf);
            console.log('PDF object keys:', Object.keys(pdf));
          }
          
          // Try all known PDF.js object structures to get the page
          let page = null;
          let pdfDocument = null;
          
          // Determine which property actually contains the PDF document
          if (pdf.getPage) {
            // Standard PDF.js document
            pdfDocument = pdf;
          } else if (pdf.promise) {
            // PDF.js promises API
            try {
              pdfDocument = await pdf.promise;
            } catch (e) {
              console.error('Error resolving pdf.promise:', e);
            }
          } else if (pdf.pdfDocument) {
            // Alternative structure
            pdfDocument = pdf.pdfDocument;
          } else if (pdf._pdfInfo) {
            // Another common structure
            pdfDocument = pdf;
          } else if (pdf.pdfInfo) {
            // Yet another variant
            pdfDocument = pdf;
          }
          
          // If we found the document, try to get the page
          if (pdfDocument) {
            try {
              if (typeof pdfDocument.getPage === 'function') {
                page = await pdfDocument.getPage(pageToShow);
              } else if (pdfDocument._transport && typeof pdfDocument._transport.getPage === 'function') {
                page = await pdfDocument._transport.getPage(pageToShow);
              }
            } catch (pageError) {
              console.error('Error getting page from document:', pageError);
            }
          }
          
          // If we couldn't get the page through standard methods, try to create a thumbnail differently
          if (!page) {
            console.log('Could not get page through standard methods, using alternative approach');
            
            // Create a placeholder thumbnail with page number
            const placeholderCanvas = document.createElement('canvas');
            placeholderCanvas.width = 200;
            placeholderCanvas.height = 280;
            const ctx = placeholderCanvas.getContext('2d');
            
            // Draw placeholder with page number
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, placeholderCanvas.width, placeholderCanvas.height);
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 2;
            ctx.strokeRect(5, 5, placeholderCanvas.width - 10, placeholderCanvas.height - 10);
            ctx.fillStyle = '#333333';
            ctx.font = 'bold 40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`Page ${pageToShow}`, placeholderCanvas.width / 2, placeholderCanvas.height / 2);
            
            if (isMounted) {
              setThumbnailData(placeholderCanvas.toDataURL());
              setLoadingThumbnail(false);
            }
            return;
          }
          
          // If we have a valid page, render it to canvas
          const canvas = document.createElement('canvas');
          const viewport = page.getViewport({ scale: 0.2 }); // Small scale for thumbnail
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext('2d');
          
          // Render the page to canvas
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          
          try {
            const renderTask = page.render(renderContext);
            // Some versions use promise property, others return a promise directly
            await (renderTask.promise || renderTask);
            
            if (isMounted) {
              setThumbnailData(canvas.toDataURL());
              setLoadingThumbnail(false);
            }
          } catch (renderError) {
            console.error('Error rendering page:', renderError);
            // Fall back to placeholder on render error
            if (isMounted) {
              // Create fallback thumbnail with page number
              const fallbackCanvas = document.createElement('canvas');
              fallbackCanvas.width = 200;
              fallbackCanvas.height = 280;
              const fbCtx = fallbackCanvas.getContext('2d');
              
              fbCtx.fillStyle = '#f0f0f0';
              fbCtx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height);
              fbCtx.strokeStyle = '#cccccc';
              fbCtx.lineWidth = 2;
              fbCtx.strokeRect(5, 5, fallbackCanvas.width - 10, fallbackCanvas.height - 10);
              fbCtx.fillStyle = '#333333';
              fbCtx.font = 'bold 40px Arial';
              fbCtx.textAlign = 'center';
              fbCtx.textBaseline = 'middle';
              fbCtx.fillText(`Page ${currentPage}`, fallbackCanvas.width / 2, fallbackCanvas.height / 2);
              
              setThumbnailData(fallbackCanvas.toDataURL());
              setLoadingThumbnail(false);
            }
          }
        } catch (error) {
          console.error('Overall error generating thumbnail:', error);
          if (isMounted) {
            // Create error fallback thumbnail
            const errorCanvas = document.createElement('canvas');
            errorCanvas.width = 200;
            errorCanvas.height = 280;
            const errCtx = errorCanvas.getContext('2d');
            
            errCtx.fillStyle = '#f5f5f5';
            errCtx.fillRect(0, 0, errorCanvas.width, errorCanvas.height);
            errCtx.strokeStyle = '#dddddd';
            errCtx.lineWidth = 2;
            errCtx.strokeRect(5, 5, errorCanvas.width - 10, errorCanvas.height - 10);
            errCtx.fillStyle = '#666666';
            errCtx.font = 'bold 24px Arial';
            errCtx.textAlign = 'center';
            errCtx.textBaseline = 'middle';
            errCtx.fillText(`Page ${pageToShow}`, errorCanvas.width / 2, errorCanvas.height / 2);
            
            setThumbnailData(errorCanvas.toDataURL());
            setLoadingThumbnail(false);
          }
        }
      };
      
      generateThumbnail();
      
      return () => {
        isMounted = false;
      };
    }, [pdf, currentPage, previewPage, showThumbnail, dragging]);
  
    // Handle mouse down on thumb
    const handleMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(true);
      setShowThumbnail(true);
  
      // Store initial position for drag calculation
      const startY = e.clientY;
      const startPosition = thumbPosition;
  
      const handleMouseMove = (moveEvent) => {
        moveEvent.preventDefault();
        if (!scrollbarRef.current) return;
  
        const scrollbarHeight = scrollbarRef.current.clientHeight;
        const maxPosition = scrollbarHeight - thumbHeight;
  
        // Calculate new position
        const deltaY = moveEvent.clientY - startY;
        const newPosition = Math.max(
          0,
          Math.min(maxPosition, startPosition + deltaY)
        );
        setThumbPosition(newPosition);
  
        // Calculate page but use debounced navigation
        const pageRatio = newPosition / maxPosition;
        const pageNumber = Math.max(
          1,
          Math.min(totalPages, Math.round(pageRatio * (totalPages - 1) + 1))
        );
        
        // Update preview page immediately for thumbnail display
        setPreviewPage(pageNumber);
        
        // But debounce the actual navigation
        debouncedScrollToPage(pageNumber);
      };
  
      const handleMouseUp = () => {
        // When lifting hand up, we don't need to flush the debounce
        // Let the debounced call naturally occur after delay
        // Don't trigger onScrollToPage directly here
        
        // Reset dragging state
        setDragging(false);
        
        setTimeout(() => {
          if (!thumbRef.current?.matches(':hover')) {
            setShowThumbnail(false);
          }
        }, 300);
        
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
  
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };
  
    // Handle touch events for mobile
    const handleTouchStart = (e) => {
      e.stopPropagation();
      setDragging(true);
      setShowThumbnail(true);
  
      const touch = e.touches[0];
      const startY = touch.clientY;
      const startPosition = thumbPosition;
  
      const handleTouchMove = (moveEvent) => {
        moveEvent.preventDefault();
        if (!scrollbarRef.current) return;
  
        const touch = moveEvent.touches[0];
        const scrollbarHeight = scrollbarRef.current.clientHeight;
        const maxPosition = scrollbarHeight - thumbHeight;
  
        // Calculate new position
        const deltaY = touch.clientY - startY;
        const newPosition = Math.max(
          0,
          Math.min(maxPosition, startPosition + deltaY)
        );
        setThumbPosition(newPosition);
  
        // Calculate page but use debounced navigation
        const pageRatio = newPosition / maxPosition;
        const pageNumber = Math.max(
          1,
          Math.min(totalPages, Math.round(pageRatio * (totalPages - 1) + 1))
        );
        
        // Update preview page immediately for thumbnail display
        setPreviewPage(pageNumber);
        
        // But debounce the actual navigation
        debouncedScrollToPage(pageNumber);
      };
  
      const handleTouchEnd = () => {
        // Similar to mouse up, don't flush or force navigation
        // Let the debounced call happen naturally
        
        setDragging(false);
        setShowThumbnail(false);
        document.removeEventListener("touchmove", handleTouchMove, {
          passive: false,
        });
        document.removeEventListener("touchend", handleTouchEnd);
        document.removeEventListener("touchcancel", handleTouchEnd);
      };
  
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
      document.addEventListener("touchcancel", handleTouchEnd);
    };
  
    // Handle click on scrollbar track
    const handleTrackClick = (e) => {
      if (
        !interactionEnabled ||
        !scrollbarRef.current ||
        e.target !== scrollbarRef.current
      )
        return;
  
      const scrollbarRect = scrollbarRef.current.getBoundingClientRect();
      const clickPositionY = e.clientY - scrollbarRect.top;
      const scrollbarHeight = scrollbarRef.current.clientHeight;
  
      // Calculate page but go immediately for direct clicks (no debounce)
      const pageRatio = clickPositionY / scrollbarHeight;
      const pageNumber = Math.max(
        1,
        Math.min(totalPages, Math.round(pageRatio * totalPages))
      );
  
      onScrollToPage(pageNumber);
    };
  
    // Handle track touch
    const handleTrackTouch = (e) => {
      if (!interactionEnabled || !scrollbarRef.current) return;
  
      const touch = e.touches[0];
      const scrollbarRect = scrollbarRef.current.getBoundingClientRect();
      const touchPositionY = touch.clientY - scrollbarRect.top;
      const scrollbarHeight = scrollbarRef.current.clientHeight;
  
      // Calculate page but go immediately for direct taps (no debounce)
      const pageRatio = touchPositionY / scrollbarHeight;
      const pageNumber = Math.max(
        1,
        Math.min(totalPages, Math.round(pageRatio * totalPages))
      );
  
      onScrollToPage(pageNumber);
    };
  
    // Generate page marker indicators
    const renderMarkers = () => {
      if (!pdf) return null;
  
      const markers = [];
      const markerCount = Math.min(totalPages, 50); // Limit markers for performance
      const increment = totalPages / markerCount;
  
      for (let i = 0; i < markerCount; i++) {
        const position = (i / (markerCount - 1)) * 100;
        markers.push(
          <div
            key={i}
            className="pdf-scrollbar-marker"
            style={{
              top: `${position}%`,
              width: i % 5 === 0 ? "8px" : "4px", // Larger marker for every 5th position
              height: i % 5 === 0 ? "3px" : "2px",
            }}
          />
        );
      }
  
      return <div className="pdf-scrollbar-markers">{markers}</div>;
    };
  
    return (
      <div
        ref={scrollbarRef}
        className="pdf-scrollbar-container"
        onClick={handleTrackClick}
        onTouchStart={handleTrackTouch}
      >
        {renderMarkers()}
        {pdf && (
          <div
            ref={thumbRef}
            className="pdf-scrollbar-thumb"
            style={{
              height: `${thumbHeight}px`,
              transform: `translateY(${thumbPosition}px)`,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onMouseEnter={() => setShowThumbnail(true)}
            onMouseLeave={() => !dragging && setShowThumbnail(false)}
          >
            {showThumbnail && (
              <div className="pdf-scrollbar-thumbnail-container">
                <div className="pdf-scrollbar-page-info">
                  {dragging ? previewPage : currentPage} / {totalPages}
                </div>
                {thumbnailData ? (
                  <div className="pdf-scrollbar-thumbnail">
                    <img 
                      src={thumbnailData} 
                      alt={`Page ${currentPage} preview`} 
                      className="pdf-thumbnail-image"
                    />
                  </div>
                ) : (
                  <div className="pdf-scrollbar-thumbnail pdf-thumbnail-loading">
                    Loading...
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  