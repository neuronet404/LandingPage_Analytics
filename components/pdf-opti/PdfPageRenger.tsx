"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import "pdfjs-dist/build/pdf.worker.min";
import { SettingsProvider, useSettings } from "@/context/SettingsContext";
import _, { debounce } from "lodash";
import { ChevronDown, ChevronUp, Copy, Trash2 } from "lucide-react"; // Import Lucide React icons

import "pdfjs-dist/web/pdf_viewer.css";
import { TextLayer } from "pdfjs-dist";
import Image from "next/image";
import pdfsearch from "@/public/pdfsearch.svg";

import ExcalidrawFab from "../canvas/excalidraw/test/ExcalidrawFab";
import ExcalidrawFabric from "../canvas/excalidraw/test/ExcalidrawFabric";

// Component 1: PDF Page Renderer
const PdfPageRender = ({ pdf, pageIndex, currentDocumentId, scale }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);
  const { scrollPdf, activeTool, currentPage,setexcalidrawScale , isDarkFilter} = useSettings();
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [highlightedAreas, setHighlightedAreas] = useState([]);

  // Track container dimensions separately to ensure highlights are positioned correctly after zoom
  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        setContainerDimensions({
          width: containerRef?.current?.offsetWidth,
          height: containerRef?.current?.offsetHeight,
        });
      };

      // Update dimensions initially and after render completes
      updateDimensions();

      // Create a ResizeObserver to detect container size changes
      const resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(containerRef.current);

      return () => {
        if (containerRef.current) {
          resizeObserver.unobserve(containerRef.current);
        }
      };
    }
  }, [scale]); // Re-run when scale changes

  // Load previously highlighted areas from localStorage
  useEffect(() => {
    const savedHighlights = localStorage.getItem(
      `pdf-highlights-${currentDocumentId}-${pageIndex}`
    );
    if (savedHighlights) {
      try {
        const parsedHighlights = JSON.parse(savedHighlights);
        // Filter to ensure we only use highlights for this specific page
        const filteredHighlights = parsedHighlights.filter(
          (h) => h.pageIndex === pageIndex
        );
        setHighlightedAreas(filteredHighlights);
      } catch (error) {
        console.error("Error parsing saved highlights:", error);
        localStorage.removeItem(
          `pdf-highlights-${currentDocumentId}-${pageIndex}`
        );
        setHighlightedAreas([]);
      }
    } else {
      setHighlightedAreas([]);
    }
  }, [currentDocumentId, pageIndex]);

  // Save highlights to localStorage whenever they change
  useEffect(() => {
    if (highlightedAreas.length > 0) {
      localStorage.setItem(
        `pdf-highlights-${currentDocumentId}-${pageIndex}`,
        JSON.stringify(highlightedAreas)
      );
    }
  }, [highlightedAreas, currentDocumentId, pageIndex]);

  useEffect(() => {
    let isCancelled = false;
    setexcalidrawScale(scale)

    const render = async () => {
      if (!canvasRef.current || !pdf || !containerRef.current) return;

      try {
        const page = await pdf.getPage(pageIndex + 1);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        const devicePixelRatio = window.devicePixelRatio || 1;

        canvas.width = viewport.width * devicePixelRatio;
        canvas.height = viewport.height * devicePixelRatio;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        canvas.id = `page-${pageIndex}`;

        if (containerRef.current) {
          containerRef.current.style.width = `${viewport.width}px`;
          containerRef.current.style.height = `${viewport.height}px`;
        }

        context.scale(devicePixelRatio, devicePixelRatio);

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        renderTaskRef.current = page.render({
          canvasContext: context,
          viewport,
        });

        // Render the PDF page
        await renderTaskRef.current.promise;
      } catch (error) {
        if (isCancelled) return;
        console.error("PDF render error:", error);
      }
    };

    render();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdf, pageIndex, scale]);

  return (
    <div
      ref={containerRef}
      className="relative border shadow-lg pdf-canvas-container"
    >
      <canvas ref={canvasRef} className={`block ${isDarkFilter?"invert":""}`} />

      {/* <PdfTextLayer
        pdf={pdf}
        pageIndex={pageIndex}
        scale={scale}
        containerDimensions={containerDimensions}
        containerRef={containerRef}
        highlightedAreas={highlightedAreas}
        setHighlightedAreas={setHighlightedAreas}
      /> */}

      <div className="absolute top-0 left-0 w-full h-full pointer-events-auto">
        <ExcalidrawFabric
          pageIndex={pageIndex}
          zoom={scale}
          currentDocumentId={currentDocumentId}
        />
      </div>
      {activeTool?.id === "rectangleSelection" &&
        (pageIndex === currentPage ||
          pageIndex === currentPage - 1 ||
          pageIndex === currentPage + 1) && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-auto">
            {/* First Excalidraw layer */}
            <ExcalidrawFab
              pageIndex={pageIndex}
              zoom={scale}
              currentDocumentId={currentDocumentId}
            />
          </div>
        )}
      {/* Annotation count */}
      {/* {highlightedAreas.length > 0 && (
        <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
          {highlightedAreas.length} highlight
          {highlightedAreas.length !== 1 ? "s" : ""}
        </div>
      )} */}
    </div>
  );
};

// Component 2: PDF Text Layer
const PdfTextLayer = ({
  pdf,
  pageIndex,
  scale,
  containerDimensions,
  containerRef,
  highlightedAreas,
  setHighlightedAreas,
}) => {
  const textLayerRef = useRef(null);
  const [selectionMenu, setSelectionMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
    range: null,
  });
  const [editMenu, setEditMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    highlightId: null,
  });

  // Render text layer
  useEffect(() => {
    let isCancelled = false;

    const renderTextLayer = async () => {
      if (!pdf || !textLayerRef.current) return;

      try {
        const page = await pdf.getPage(pageIndex + 1);
        const viewport = page.getViewport({ scale });

        // Setup text layer
        const textLayer = textLayerRef.current;
        textLayer.innerHTML = "";
        textLayer.style.width = `${viewport.width}px`;
        textLayer.style.height = `${viewport.height}px`;
        textLayer.style.setProperty("--scale-factor", viewport.scale);

        // After rendering the page, render the text layer
        const textContent = await page.getTextContent();
        const textLayerInstance = new TextLayer({
          textContentSource: textContent,
          container: textLayer,
          viewport: viewport,
          textDivs: [],
        });

        await textLayerInstance.render();
      } catch (error) {
        if (isCancelled) return;
        console.error("Text layer render error:", error);
      }
    };

    renderTextLayer();

    return () => {
      isCancelled = true;
    };
  }, [pdf, pageIndex, scale]);

  // Handle text selection to show annotation menu
  const handleTextSelection = useCallback(() => {
    // Add a small delay to ensure selection is complete
    setTimeout(() => {
      // Do NOT hide existing edit menu if it's visible
      // This allows the highlight edit menu to stay open
      if (!editMenu.visible) {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) {
          setSelectionMenu({
            visible: false,
            x: 0,
            y: 0,
            text: "",
            range: null,
          });
          return;
        }

        const range = selection.getRangeAt(0);
        const selectedText = selection.toString().trim();

        if (selectedText && textLayerRef.current) {
          // Check if the selection is within the text layer or its descendants
          let isSelectionInTextLayer = false;
          let node = range.startContainer;

          while (node) {
            if (node === textLayerRef.current) {
              isSelectionInTextLayer = true;
              break;
            }
            node = node.parentNode;
          }

          if (!isSelectionInTextLayer) {
            setSelectionMenu({
              visible: false,
              x: 0,
              y: 0,
              text: "",
              range: null,
            });
            return;
          }

          // Check if we're in the middle of a zoom/scale operation
          const isZooming = document.body.classList.contains("zooming");
          if (isZooming) {
            setSelectionMenu({
              visible: false,
              x: 0,
              y: 0,
              text: "",
              range: null,
            });
            return;
          }

          // Get client rects of the selection
          const rects = range.getClientRects();
          if (rects.length === 0) {
            setSelectionMenu({
              visible: false,
              x: 0,
              y: 0,
              text: "",
              range: null,
            });
            return;
          }

          // Use the last rect to position the menu above it
          const lastRect = rects[rects.length - 1];

          // Show the selection menu
          setSelectionMenu({
            visible: true,
            x: lastRect.left + lastRect.width / 2, // Center the menu over the selection
            y: lastRect.top - 10, // Position menu above the selection
            text: selectedText,
            range: range,
          });
        } else {
          setSelectionMenu({
            visible: false,
            x: 0,
            y: 0,
            text: "",
            range: null,
          });
        }
      }
    }, 50); // Small delay to ensure selection is complete
  }, [editMenu.visible]);

  // Close menus when clicking outside
  const handleOutsideClick = useCallback((event) => {
    // Add a check to see if we're clicking on a button or inside a menu
    const isClickingOnMenu = event.target.closest(".annotation-menu");
    const isClickingOnHighlight = event.target.closest(".annotation-span");
    const isClickingOnButton =
      event.target.tagName === "BUTTON" ||
      event.target.closest("button") ||
      event.target.tagName === "svg" ||
      event.target.tagName === "path";

    // Only close menus if we're not clicking on a menu, highlight, or button
    if (!isClickingOnMenu && !isClickingOnHighlight && !isClickingOnButton) {
      setSelectionMenu({ visible: false, x: 0, y: 0, text: "", range: null });
      setEditMenu({ visible: false, x: 0, y: 0, highlightId: null });
    }
  }, []);

  // Check if selection overlaps with existing highlights
  const doesSelectionOverlapHighlights = useCallback(
    (selectionRects, existingHighlights) => {
      if (!textLayerRef.current) return false;

      const containerRect = textLayerRef.current.getBoundingClientRect();

      for (const highlight of existingHighlights) {
        // Skip highlights from different pages
        if (highlight.pageIndex !== pageIndex) continue;

        let highlightRect;

        // Calculate highlight position based on normalized coords
        if (highlight.normalizedRect) {
          const { width, height } = containerDimensions;
          highlightRect = {
            top:
              (highlight.normalizedRect.top * height) / 100 + containerRect.top,
            left:
              (highlight.normalizedRect.left * width) / 100 +
              containerRect.left,
            bottom:
              (highlight.normalizedRect.top * height) / 100 +
              (highlight.normalizedRect.height * height) / 100 +
              containerRect.top,
            right:
              (highlight.normalizedRect.left * width) / 100 +
              (highlight.normalizedRect.width * width) / 100 +
              containerRect.left,
          };
        } else if (highlight.originalScale && highlight.rect) {
          const scaleRatio = scale / highlight.originalScale;
          highlightRect = {
            top: highlight.rect.top * scaleRatio + containerRect.top,
            left: highlight.rect.left * scaleRatio + containerRect.left,
            bottom:
              (highlight.rect.top + highlight.rect.height) * scaleRatio +
              containerRect.top,
            right:
              (highlight.rect.left + highlight.rect.width) * scaleRatio +
              containerRect.left,
          };
        } else if (highlight.rect) {
          highlightRect = {
            top: highlight.rect.top + containerRect.top,
            left: highlight.rect.left + containerRect.left,
            bottom:
              highlight.rect.top + highlight.rect.height + containerRect.top,
            right:
              highlight.rect.left + highlight.rect.width + containerRect.left,
          };
        } else {
          continue; // Skip this highlight if we can't determine its position
        }

        // Check if any selection rect overlaps with this highlight rect
        for (const selRect of selectionRects) {
          // Check for intersection
          if (
            selRect.left <= highlightRect.right &&
            selRect.right >= highlightRect.left &&
            selRect.top <= highlightRect.bottom &&
            selRect.bottom >= highlightRect.top
          ) {
            // Significant overlap (more than 50% area)
            const overlapWidth =
              Math.min(selRect.right, highlightRect.right) -
              Math.max(selRect.left, highlightRect.left);
            const overlapHeight =
              Math.min(selRect.bottom, highlightRect.bottom) -
              Math.max(selRect.top, highlightRect.top);
            const overlapArea = overlapWidth * overlapHeight;

            const selArea = selRect.width * selRect.height;
            const highlightArea =
              (highlightRect.right - highlightRect.left) *
              (highlightRect.bottom - highlightRect.top);

            // If overlap is more than 50% of either rectangle, consider it an overlap
            if (overlapArea > 0.5 * Math.min(selArea, highlightArea)) {
              return true;
            }
          }
        }
      }

      return false;
    },
    [containerDimensions, pageIndex, scale]
  );

  // Create a new highlight
  const createHighlight = useCallback(
    (color = "rgba(255, 255, 0, 0.3)") => {
      if (
        !selectionMenu.range ||
        !selectionMenu.text ||
        !textLayerRef.current
      ) {
        console.warn("Cannot create highlight: missing required data");
        return;
      }

      const range = selectionMenu.range;
      const selectedText = selectionMenu.text;

      // Get client rects of the selection
      const clientRects = Array.from(range.getClientRects());
      if (clientRects.length === 0) {
        console.warn("Cannot create highlight: no selection rects found");
        return;
      }

      // Check if selection overlaps with existing highlights
      if (doesSelectionOverlapHighlights(clientRects, highlightedAreas)) {
        console.warn(
          "Cannot create highlight: selection overlaps with existing highlights"
        );

        // Show a temporary warning
        const warningEl = document.createElement("div");
        warningEl.className =
          "text-red-500 text-sm absolute bg-white p-2 rounded shadow-lg z-50";
        warningEl.style.top = `${selectionMenu.y - 40}px`;
        warningEl.style.left = `${selectionMenu.x}px`;
        warningEl.style.transform = "translate(-50%, 0)";
        warningEl.textContent = "This text is already highlighted";
        document.body.appendChild(warningEl);

        // Remove warning after 2 seconds
        setTimeout(() => {
          if (document.body.contains(warningEl)) {
            document.body.removeChild(warningEl);
          }
        }, 2000);

        // Close the menu
        setSelectionMenu({ visible: false, x: 0, y: 0, text: "", range: null });
        // Clear selection
        window.getSelection().removeAllRanges();
        return;
      }

      // Convert client rects to our container's coordinate system
      const containerRect = textLayerRef.current.getBoundingClientRect();

      // Get current container dimensions for normalization
      const containerWidth =
        containerDimensions.width || containerRef.current?.offsetWidth || 1;
      const containerHeight =
        containerDimensions.height || containerRef.current?.offsetHeight || 1;

      // Merge adjacent or overlapping rects to create a single highlight
      // Sort by y position (top to bottom)
      clientRects.sort((a, b) => a.top - b.top);

      const mergedRects = [];
      let currentLineTop = null;
      let currentMergedRect = null;

      // Merge rects on the same text line
      const LINE_THRESHOLD = 5; // Pixels threshold to consider rects on the same line

      for (const rect of clientRects) {
        // If this is the first rect or rect is on a new line
        if (
          currentLineTop === null ||
          Math.abs(rect.top - currentLineTop) > LINE_THRESHOLD
        ) {
          // If we have a pending merged rect, save it
          if (currentMergedRect) {
            mergedRects.push(currentMergedRect);
          }

          // Start a new merged rect
          currentMergedRect = {
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right,
            width: rect.width,
            height: rect.height,
          };

          currentLineTop = rect.top;
        }
        // If rect is on the same line, expand current merged rect
        else {
          currentMergedRect.left = Math.min(currentMergedRect.left, rect.left);
          currentMergedRect.right = Math.max(
            currentMergedRect.right,
            rect.right
          );
          currentMergedRect.bottom = Math.max(
            currentMergedRect.bottom,
            rect.bottom
          );
          currentMergedRect.width =
            currentMergedRect.right - currentMergedRect.left;
          currentMergedRect.height =
            currentMergedRect.bottom - currentMergedRect.top;
        }
      }

      // Add the last merged rect
      if (currentMergedRect) {
        mergedRects.push(currentMergedRect);
      }

      // Now convert the merged rects to our highlight format
      const highlightRects = mergedRects.map((rect) => {
        // Create position that accounts for the current scale
        const highlightRect = {
          top: rect.top - containerRect.top,
          left: rect.left - containerRect.left,
          width: rect.width,
          height: rect.height,
        };

        // Ensure all properties are valid numbers
        Object.keys(highlightRect).forEach((key) => {
          if (isNaN(highlightRect[key])) {
            console.warn(
              `Invalid ${key} value in highlight rect:`,
              highlightRect[key]
            );
            highlightRect[key] = 0;
          }
        });

        return highlightRect;
      });

      const newHighlights = highlightRects.map((rect) => {
        // Create normalized coordinates for zoom independence
        const normalizedRect = {
          top: (rect.top / containerHeight) * 100,
          left: (rect.left / containerWidth) * 100,
          width: (rect.width / containerWidth) * 100,
          height: (rect.height / containerHeight) * 100,
        };

        return {
          rect, // Original rect for immediate display
          normalizedRect, // Store normalized position for zoom independence
          text: selectedText,
          color: color,
          timestamp: new Date().toISOString(),
          originalScale: scale, // Store the current scale when highlight was created
          pageIndex,
        };
      });

      // Add to state
      setHighlightedAreas((prev) => [...prev, ...newHighlights]);

      // Close the menu
      setSelectionMenu({ visible: false, x: 0, y: 0, text: "", range: null });

      // Clear selection after highlighting
      window.getSelection().removeAllRanges();
    },
    [
      selectionMenu,
      containerDimensions,
      scale,
      pageIndex,
      setHighlightedAreas,
      containerRef,
      highlightedAreas,
      doesSelectionOverlapHighlights,
    ]
  );

  // Attach the mouseup event listener to capture text selection
  useEffect(() => {
    const onMouseUp = (e) => {
      // Only handle mouseup if it's not on a menu
      if (!e.target.closest(".annotation-menu")) {
        handleTextSelection();
      }
    };

    if (textLayerRef.current) {
      textLayerRef.current.addEventListener("mouseup", onMouseUp);

      // Add document click listener to close menus when clicking outside
      document.addEventListener("click", handleOutsideClick);

      return () => {
        if (textLayerRef.current) {
          textLayerRef.current.removeEventListener("mouseup", onMouseUp);
        }
        document.removeEventListener("click", handleOutsideClick);
      };
    }
  }, [handleTextSelection, handleOutsideClick]);

  // Pass all the needed props to the HighlightsLayer component
  const highlightProps = {
    textLayerRef,
    highlightedAreas,
    setHighlightedAreas,
    containerDimensions,
    scale,
    selectionMenu,
    setSelectionMenu,
    editMenu,
    setEditMenu,
    pageIndex,
    createHighlight,
  };

  return (
    <>
      <div
        ref={textLayerRef}
        className={`textLayer textLayer-${pageIndex}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          overflow: "hidden",
          lineHeight: 1.0,
          opacity: 1,
          pointerEvents: "auto", // Allow text selection
        }}
      ></div>

      <HighlightsLayer {...highlightProps} />
    </>
  );
};

// Component 3: Highlights Layer and Menus
const HighlightsLayer = ({
  textLayerRef,
  highlightedAreas,
  setHighlightedAreas,
  containerDimensions,
  scale,
  selectionMenu,
  setSelectionMenu,
  editMenu,
  setEditMenu,
  pageIndex,
  createHighlight,
}) => {
  // Function to apply highlights to the text layer
  const applyHighlights = useCallback(() => {
    if (!textLayerRef.current) return;

    // First, remove any existing highlight spans
    const existingHighlights =
      textLayerRef.current.querySelectorAll(".annotation-span");
    existingHighlights.forEach((highlight) => highlight.remove());

    // Wait until container dimensions are set and valid
    if (containerDimensions.width === 0 || containerDimensions.height === 0) {
      return; // Don't proceed if dimensions aren't valid yet
    }

    // Filter highlights for current page only
    const currentPageHighlights = highlightedAreas.filter(
      (h) => h.pageIndex === pageIndex
    );

    // Then apply all stored highlights for the current page
    currentPageHighlights.forEach((highlight, index) => {
      // Find the absolute index in the overall highlights array
      const absoluteIndex = highlightedAreas.findIndex(
        (h) =>
          h.timestamp === highlight.timestamp &&
          h.text === highlight.text &&
          h.pageIndex === highlight.pageIndex
      );

      if (absoluteIndex === -1) return; // Skip if highlight is not found

      const span = document.createElement("div");
      span.className = "annotation-span annotation-highlight";
      span.setAttribute("data-annotation-id", absoluteIndex);
      span.style.position = "absolute";
      span.style.backgroundColor = highlight.color || "rgba(255, 255, 0, 0.3)";

      // Check for normalized rectangle coordinates first (preferred method)
      if (highlight.normalizedRect) {
        // Always use normalized coordinates (percentages) for consistency
        const { width, height } = containerDimensions;

        span.style.top = `${(highlight.normalizedRect.top * height) / 100}px`;
        span.style.left = `${(highlight.normalizedRect.left * width) / 100}px`;
        span.style.width = `${
          (highlight.normalizedRect.width * width) / 100
        }px`;
        span.style.height = `${
          (highlight.normalizedRect.height * height) / 100
        }px`;
      }
      // Check for original scale and rect as fallback
      else if (highlight.originalScale && highlight.rect) {
        // Fallback to scale ratio method for backward compatibility
        const scaleRatio = scale / highlight.originalScale;
        span.style.top = `${highlight.rect.top * scaleRatio}px`;
        span.style.left = `${highlight.rect.left * scaleRatio}px`;
        span.style.width = `${highlight.rect.width * scaleRatio}px`;
        span.style.height = `${highlight.rect.height * scaleRatio}px`;
      }
      // Just check for rect as last resort
      else if (highlight.rect) {
        // Use original values if no scale information (oldest method)
        span.style.top = `${highlight.rect.top}px`;
        span.style.left = `${highlight.rect.left}px`;
        span.style.width = `${highlight.rect.width}px`;
        span.style.height = `${highlight.rect.height}px`;
      }
      // If no positioning data is available, skip this highlight
      else {
        console.warn("Highlight is missing positioning data:", highlight);
        return; // Skip this highlight and continue with the next one
      }

      span.style.cursor = "pointer"; // Show pointer cursor for clicking
      span.setAttribute("data-text", highlight.text || "");

      // Add click handler via attribute to handle editing
      span.addEventListener("click", (e) => {
        e.stopPropagation();
        handleAnnotationClick(absoluteIndex, e);
      });

      textLayerRef.current.appendChild(span);
    });
  }, [highlightedAreas, containerDimensions, scale, textLayerRef, pageIndex]);

  // Handle clicking on an existing annotation
  const handleAnnotationClick = useCallback(
    (highlightId, event) => {
      // Prevent event bubbling
      event.stopPropagation();
      event.preventDefault();

      // Hide selection menu if it's visible
      setSelectionMenu({ visible: false, x: 0, y: 0, text: "", range: null });

      // Show edit menu
      setEditMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        highlightId,
      });
    },
    [setSelectionMenu, setEditMenu]
  );

  // Change annotation color
  const updateHighlightColor = useCallback(
    (color, e) => {
      e && e.stopPropagation(); // Stop event propagation if event is provided

      if (editMenu.highlightId === null) return;

      setHighlightedAreas((prev) => {
        const updated = [...prev];
        updated[editMenu.highlightId].color = color;
        return updated;
      });

      // Keep the menu open after changing color
      // Don't close the menu: setEditMenu({ visible: false, x: 0, y: 0, highlightId: null });
    },
    [editMenu, setHighlightedAreas]
  );

  // Copy highlighted text
  const copyHighlightedText = useCallback(
    (e) => {
      e.stopPropagation(); // Stop event from propagating
      e.preventDefault(); // Prevent default behavior

      if (editMenu.highlightId === null) return;

      const highlight = highlightedAreas[editMenu.highlightId];
      if (highlight && highlight.text) {
        navigator.clipboard
          .writeText(highlight.text)
          .then(() => {
            console.log("Text copied to clipboard");
            // Show some visual feedback without closing menu
            const button = e.currentTarget;
            if (button) {
              // Add a temporary flash to indicate success
              button.classList.add("bg-blue-100");
              setTimeout(() => {
                button.classList.remove("bg-blue-100");
              }, 300);
            }
            // Do NOT close the menu
            // setEditMenu({ visible: false, x: 0, y: 0, highlightId: null });
          })
          .catch((err) => {
            console.error("Failed to copy text: ", err);
          });
      }
    },
    [editMenu, highlightedAreas]
  );

  // Delete a highlight
  const deleteHighlight = useCallback(
    (e) => {
      e.stopPropagation(); // Stop event from propagating

      if (editMenu.highlightId === null) return;

      setHighlightedAreas((prev) =>
        prev.filter((_, index) => index !== editMenu.highlightId)
      );

      // Close the menu
      setEditMenu({ visible: false, x: 0, y: 0, highlightId: null });
    },
    [editMenu, setHighlightedAreas, setEditMenu]
  );

  // Re-apply highlights when they change, scale changes, or container dimensions change
  useEffect(() => {
    // Use requestAnimationFrame to ensure rendering happens after DOM updates
    const rafId = requestAnimationFrame(() => {
      applyHighlights();
    });

    return () => cancelAnimationFrame(rafId);
  }, [applyHighlights, scale, containerDimensions]);

  return (
    <>
      {/* Selection Menu */}
      {selectionMenu.visible && (
        <div
          className="annotation-menu absolute bg-white shadow-lg rounded p-1 z-50 flex"
          style={{
            top: `${selectionMenu.y}px`,
            left: `${selectionMenu.x}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          {/* Yellow highlight */}
          <button
            className="p-2 hover:bg-yellow-100 rounded"
            onClick={() => createHighlight("rgba(255, 255, 0, 0.3)")}
          >
            <span className="block w-5 h-5 bg-yellow-200 border border-yellow-400 rounded"></span>
          </button>

          {/* Green highlight */}
          <button
            className="p-2 hover:bg-green-100 rounded"
            onClick={() => createHighlight("rgba(0, 255, 0, 0.3)")}
          >
            <span className="block w-5 h-5 bg-green-200 border border-green-400 rounded"></span>
          </button>

          {/* Blue highlight */}
          <button
            className="p-2 hover:bg-blue-100 rounded"
            onClick={() => createHighlight("rgba(0, 0, 255, 0.3)")}
          >
            <span className="block w-5 h-5 bg-blue-200 border border-blue-400 rounded"></span>
          </button>
        </div>
      )}

      {/* Edit Menu */}
      {editMenu.visible && (
        <div
          className="annotation-menu absolute bg-white shadow-lg rounded p-1 z-50 flex flex-col"
          style={{
            top: `${editMenu.y}px`,
            left: `${editMenu.x}px`,
            transform: "translate(0, -100%)",
          }}
        >
          <div className="flex">
            {/* Yellow highlight */}
            <button
              className="p-2 hover:bg-yellow-100 rounded"
              onClick={(e) => updateHighlightColor("rgba(255, 255, 0, 0.3)", e)}
            >
              <span className="block w-5 h-5 bg-yellow-200 border border-yellow-400 rounded"></span>
            </button>

            {/* Green highlight */}
            <button
              className="p-2 hover:bg-green-100 rounded"
              onClick={(e) => updateHighlightColor("rgba(0, 255, 0, 0.3)", e)}
            >
              <span className="block w-5 h-5 bg-green-200 border border-green-400 rounded"></span>
            </button>

            {/* Blue highlight */}
            <button
              className="p-2 hover:bg-blue-100 rounded"
              onClick={(e) => updateHighlightColor("rgba(0, 0, 255, 0.3)", e)}
            >
              <span className="block w-5 h-5 bg-blue-200 border border-blue-400 rounded"></span>
            </button>
          </div>

          <div className="flex border-t">
            {/* Copy text */}
            <button
              className="p-2 hover:bg-gray-100 rounded flex-1 text-xs"
              onClick={copyHighlightedText}
            >
              Copy
            </button>

            {/* Delete */}
            <button
              className="p-2 hover:bg-red-100 rounded flex-1 text-xs text-red-600"
              onClick={deleteHighlight}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const PdfSearchComponent = ({
  pdf,
  scale,
  documentId,
  scrollToPage,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const searchBarRef = useRef(null);
  const { scrollPdf, currentPage, isSearchVisible } = useSettings();

  // Keep track of search text in PDF pages
  const [pageTextContent, setPageTextContent] = useState({});

  // Function to extract and cache text content from PDF pages
  const cachePageContent = useCallback(
    async (pageIndex) => {
      if (pageTextContent[pageIndex] !== undefined)
        return pageTextContent[pageIndex];

      try {
        const page = await pdf.getPage(pageIndex + 1);
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map((item) => item.str).join(" ");

        setPageTextContent((prev) => ({
          ...prev,
          [pageIndex]: textItems,
        }));

        return textItems;
      } catch (error) {
        console.error(`Error extracting text from page ${pageIndex}:`, error);
        return "";
      }
    },
    [pdf, pageTextContent]
  );

  // Preload text content for all pages
  useEffect(() => {
    if (!pdf) return;

    const loadAllPages = async () => {
      const totalPageCount = pdf.numPages;
      for (let i = 0; i < totalPageCount; i++) {
        await cachePageContent(i);
      }
    };

    loadAllPages();
  }, [pdf, cachePageContent]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term) => {
      performSearch(term);
    }, 300),
    [pdf]
  );

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setCurrentResultIndex(-1);
    // Remove any active highlights here if needed
  }, []);

  // Function to handle form submission
  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (searchTerm.trim().length >= 2) {
        performSearch(searchTerm);
      }
    },
    [searchTerm]
  );

  // Function to perform search across all pages
  const performSearch = useCallback(
    async (term = searchTerm) => {
      if (!pdf || term.trim().length < 2) {
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const results = [];
      const searchFor = term.toLowerCase();

      try {
        const totalPageCount = pdf.numPages;

        for (let pageIndex = 0; pageIndex < totalPageCount; pageIndex++) {
          const pageText = await cachePageContent(pageIndex);
          const pageTextLower = pageText.toLowerCase();
          let startIndex = 0;

          while (startIndex < pageTextLower.length) {
            const foundIndex = pageTextLower.indexOf(searchFor, startIndex);
            if (foundIndex === -1) break;

            results.push({
              pageIndex,
              matchIndex: foundIndex,
              text: pageText.substr(foundIndex, searchFor.length),
              beforeText: pageText.substr(
                Math.max(0, foundIndex - 30),
                Math.min(30, foundIndex)
              ),
              afterText: pageText.substr(foundIndex + searchFor.length, 30),
              contextText: pageText.substr(
                Math.max(0, foundIndex - 30),
                Math.min(30, foundIndex) + searchFor.length + 30
              ),
            });

            startIndex = foundIndex + searchFor.length;
          }
        }

        setSearchResults(results);
        setCurrentResultIndex(results.length > 0 ? 0 : -1);
      } catch (error) {
        console.error("Error searching PDF:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [pdf, searchTerm, cachePageContent]
  );

  // Function to navigate to the specific search result
  const navigateToResult = useCallback(
    (resultIndex) => {
      if (resultIndex < 0 || resultIndex >= searchResults.length) return;

      const result = searchResults[resultIndex];
      setCurrentResultIndex(resultIndex);

      // Change to the page containing the result
      if (currentPage !== result.pageIndex) {
        scrollToPage(result.pageIndex);
      }

      // Create a temporary highlight for the search result
      setTimeout(() => {
        // Create a highlight for the found text
        const textDivs = document.querySelectorAll(
          `.textLayer-${result.pageIndex}`
        );
        let foundTextElement = null;

        // Look for the text element containing our search result
        for (const div of textDivs) {
          if (div.textContent.includes(result.text)) {
            foundTextElement = div;
            break;
          }
        }

        if (foundTextElement) {
          // Scroll to the element
          //   foundTextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Highlight the element temporarily
          const originalBackground = foundTextElement.style.backgroundColor;
          foundTextElement.style.backgroundColor = "rgba(255, 165, 0, 0.5)";
          foundTextElement.style.borderRadius = "2px";
          foundTextElement.style.transition = "background-color 0.5s";

          // Store the original highlight in localStorage to persist
          const currentHighlights = JSON.parse(
            localStorage.getItem(
              `pdf-highlights-${documentId}-${result.pageIndex}`
            ) || "[]"
          );

          // Get the element's position
          const rect = foundTextElement.getBoundingClientRect();
          const container = document.querySelector(`.pdf-canvas-container`);
          const containerRect = container
            ? container.getBoundingClientRect()
            : { top: 0, left: 0 };

          // Create normalized coordinates for the highlight
          const normalizedRect = {
            top:
              ((rect.top - containerRect.top) / container.offsetHeight) * 100,
            left:
              ((rect.left - containerRect.left) / container.offsetWidth) * 100,
            width: (rect.width / container.offsetWidth) * 100,
            height: (rect.height / container.offsetHeight) * 100,
          };

          // Create highlight object
          const searchHighlight = {
            rect: {
              top: rect.top - containerRect.top,
              left: rect.left - containerRect.left,
              width: rect.width,
              height: rect.height,
            },
            normalizedRect,
            text: result.text,
            color: "rgba(255, 165, 0, 0.5)",
            timestamp: new Date().toISOString(),
            originalScale: scale,
            pageIndex: result.pageIndex,
            isSearchResult: true,
          };

          // Add it to highlights and save
          const updatedHighlights = [...currentHighlights, searchHighlight];
          localStorage.setItem(
            `pdf-highlights-${documentId}-${result.pageIndex}`,
            JSON.stringify(updatedHighlights)
          );

          // Force a re-render of the page to show the highlight
          const event = new CustomEvent("pdf-highlight-update", {
            detail: { pageIndex: result.pageIndex },
          });
          document.dispatchEvent(event);

          // Remove the temporary visual highlight after 2 seconds
          setTimeout(() => {
            foundTextElement.style.backgroundColor = originalBackground;
          }, 2000);
        }
      }, 300); // Short delay to ensure the page has rendered
    },
    [
      searchResults,
      currentResultIndex,
      scrollToPage,
      currentPage,
      documentId,
      scale,
    ]
  );

  // Navigate to next result
  const goToNextResult = useCallback(() => {
    if (searchResults.length === 0) return;

    const nextIndex = (currentResultIndex + 1) % searchResults.length;
    navigateToResult(nextIndex);
  }, [searchResults, currentResultIndex, navigateToResult]);

  // Navigate to previous result
  const goToPrevResult = useCallback(() => {
    if (searchResults.length === 0) return;

    const prevIndex =
      (currentResultIndex - 1 + searchResults.length) % searchResults.length;
    navigateToResult(prevIndex);
  }, [searchResults, currentResultIndex, navigateToResult]);

  // Auto-navigate to first result when results change
  useEffect(() => {
    if (searchResults.length > 0 && currentResultIndex === 0) {
      navigateToResult(0);
    }
  }, [searchResults, navigateToResult, currentResultIndex]);

  // Keyboard shortcuts for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if focus is in an input field
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        // If it's our search input and Enter is pressed
        if (e.target === searchInputRef.current && e.key === "Enter") {
          e.preventDefault();
          if (e.shiftKey) {
            goToPrevResult();
          } else {
            goToNextResult();
          }
        }
        return;
      }

      // Global keyboard shortcuts when focus is not in input field
      if (e.key === "f" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [goToNextResult, goToPrevResult]);

  return (
    <>
      {isSearchVisible && (
        <div>
          <div
            ref={searchBarRef}
            className="fixed top-32 left-0 right-0 flex justify-center z-50 mt-4"
          >
            <form className="w-[850px] relative group" onSubmit={handleSearch}>
              <div className="relative w-full h-[43px] group-hover:h-[68px] bg-white rounded-[18px] shadow-lg border border-gray-300 overflow-hidden transition-all duration-300 ease-in-out">
                {/* Search Icon */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 ml-4">
                  <Image
                    src={pdfsearch}
                    alt="Search Icon"
                    width={16}
                    height={16}
                  />
                </div>

                {/* Search Input */}
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value) {
                      debouncedSearch(e.target.value);
                    } else {
                      clearSearch();
                    }
                  }}
                  placeholder="Search in document..."
                  className="w-full py-2 pl-16 pr-32 font-rubik text-[20px] text-black focus:outline-none h-[43px] transition-colors duration-300"
                />

                {/* Navigation Controls */}
                {searchResults.length > 0 && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {currentResultIndex + 1} of {searchResults.length}
                    </span>
                    <button
                      type="button"
                      onClick={goToPrevResult}
                      className="p-1 hover:bg-gray-100 rounded"
                      aria-label="Previous match"
                    >
                      <ChevronUp className="w-4 h-4 text-black" />
                    </button>
                    <button
                      type="button"
                      onClick={goToNextResult}
                      className="p-1 hover:bg-gray-100 rounded"
                      aria-label="Next match"
                    >
                      <ChevronDown className="w-4 h-4 text-black" />
                    </button>
                  </div>
                )}

                {/* Additional Placeholder Area */}
                <div className="absolute top-[40px] pl-16 w-full text-black text-[15px] px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Ask acolyte?
                </div>
              </div>
            </form>
          </div>

          {/* Add global styles for highlights */}
          <style jsx global>{`
            .pdf-search-highlight {
              position: absolute;
              pointer-events: none;
              transition: background-color 0.2s ease;
              z-index: 1;
            }
            .current-highlight {
              box-shadow: 0 0 4px rgba(255, 152, 0, 0.5);
            }
            .textLayer {
              position: relative;
            }
          `}</style>
        </div>
      )}
    </>
  );
};

// Export the main component
export default PdfPageRender;
