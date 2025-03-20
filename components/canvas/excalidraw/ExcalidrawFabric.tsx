"use client";
import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";
import { Tool } from "@/types/pdf";
import { getAppState, saveAppState } from "@/db/pdf/pdfAnnotations";
import {
  getAppState as getAppStateInfinite,
  saveAppState as saveAppStateInfinite,
} from "@/db/note/canvas";
import { useSettings } from "@/context/SettingsContext";
import {
  convertToExcalidrawElements,
  restoreElements,
} from "@excalidraw/excalidraw";
import html2canvas from "html2canvas";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import ExcalidrawComponent from "./ExcalidrawComponent";

interface SelectionPoint {
  x: number;
  y: number;
}

interface SelectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Data {
  url: object | null;
  selection: SelectionPoint;
  bounds: SelectionBounds;
}

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false }
);

const ExcalidrawFabric = ({
  saveCanvas,
  pageIndex,
  currentDocumentId,
}: {
  saveCanvas?: any;
  pageIndex?: number;
  currentDocumentId?: string;
}) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();
  const { scale, currentPage, setScrollPdf,setData,scrollPdf,activeTool } = useSettings();
  let selectionStart;
  const initialAppState: AppState = {
    zoom: { value: 1 },
    scrollX: 0,
    scrollY: 0,
  };
  const [screenshotUrl, setScreenshotUrl] = useState(null);

  const handleChange = (
    elements: readonly ExcalidrawElement[],
    state: AppState
  ) => {
    if (!excalidrawAPI) return;
    save();
    console.log("changing")

    let shouldUpdateScene = false;
    const newAppState: Partial<AppState> = { ...state };

    if (state.zoom.value !== initialAppState.zoom.value) {
      newAppState.zoom = { value: initialAppState.zoom.value };
      shouldUpdateScene = true;
    }

    if (state.scrollX !== initialAppState.scrollX) {
      newAppState.scrollX = initialAppState.scrollX;
      shouldUpdateScene = true;
    }

    if (state.scrollY !== initialAppState.scrollY) {
      newAppState.scrollY = initialAppState.scrollY;
      shouldUpdateScene = true;
      setScrollPdf(true);
    }

    if (shouldUpdateScene) {
      excalidrawAPI.updateScene({
        appState: newAppState,
      });
      setTimeout(() => {
        setScrollPdf(false);
        console.log("setong scroll to false")
      }, 500);
    }
  };

  const handleTextSelection = (e: MouseEvent) => {
    // Only process if this is the current page's Excalidraw instance
    if (!excalidrawAPI || pageIndex !== currentPage - 1) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const selectedText = selection.toString();
    if (!selectedText.trim()) return;

    const range = selection.getRangeAt(0);
    const rects = range.getClientRects();

    // Get the PDF page element for the current page
    const pageElement = document.querySelector(
      `[data-page-number="${currentPage}"]`
    );
    if (!pageElement) return;

    const pageRect = pageElement.getBoundingClientRect();

    // Calculate the proper scale factor
    const pdfScale = pageRect.width / pageElement.offsetWidth;

    // Get existing elements to preserve them
    const existingElements = excalidrawAPI.getSceneElements();

    // Create highlight elements for each text rectangle
    const newHighlights = Array.from(rects).map((rect) => ({
      type: "rectangle",
      x: rect.left - pageRect.left,
      y: rect.top - pageRect.top,
      width: rect.width,
      height: rect.height,
      backgroundColor: "rgba(255, 255, 0, 0.6)",
      strokeColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 0,
      roughness: 0,
      opacity: 50,
    }));

    // Convert the new highlights to Excalidraw elements
    const newElements = convertToExcalidrawElements(newHighlights);

    // Update the scene with both existing and new elements
    excalidrawAPI.updateScene({
      elements: [...existingElements, ...newElements],
    });

    // Clear selection
    selection.removeAllRanges();
  };

  const save = () => {
    const elements = excalidrawAPI?.getSceneElements();
    const state = excalidrawAPI?.getAppState();
    const files = excalidrawAPI?.getFiles();
    // saveCanvas(elements, state,files,pageIndex);
    saveAppState(currentDocumentId, elements, state, files, pageIndex);
  };

  useEffect(() => {
    async function fetchAndSetCanvas() {
      try {
        const canvasData = await getAppState(currentDocumentId, pageIndex);
        if (canvasData && excalidrawAPI) {
          // Add files first if they exist
          if (canvasData.files) {
            excalidrawAPI.addFiles(
              Object.entries(canvasData.files).map(([id, file]) => ({
                id,
                ...file,
              }))
            );
          }

          // Then update the scene
          excalidrawAPI.updateScene({
            elements: canvasData.elements,
            appState: canvasData.appState,
          });
        }
      } catch (error) {
        console.error("Error fetching canvas:", error);
      }
    }

    fetchAndSetCanvas();
  }, [pageIndex, currentDocumentId, excalidrawAPI]);

  const switchTool = (selectedTool: ActiveTool["type"]) => {
    if (!excalidrawAPI) return;
    
    console.log("Switching tool:", selectedTool);
  
    // Reset tool properties
    const resetToolProperties = () => {
      excalidrawAPI.updateScene({
        appState: {
          currentItemStrokeColor: "#000000",
          currentItemStrokeWidth: 1,
          currentItemOpacity: 100,
        },
      });
    };
  
    // Define active tool properties with safe defaults
    const toolProperties = activeTool || {
      strokeColor: "#000000",
      strokeWidth: 1,
      opacity: 100,
      fillColor: "transparent",
      color: "#000000",
    };
  
    switch (selectedTool) {
      case "pen":
      case "pencil":
      case "highlighter":
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: "freedraw" });
        excalidrawAPI.updateScene({
          appState: {
            currentItemStrokeColor: toolProperties.color,
            currentItemOpacity: toolProperties.opacity,
            currentItemStrokeWidth: toolProperties.strokeWidth,
          },
        });
        break;
  
      case "image":
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: "image" });
        break;
  
      case "arrow":
      case "line":
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: selectedTool });
        excalidrawAPI.updateScene({
          appState: {
            currentItemStrokeColor: toolProperties.strokeColor,
            currentItemStrokeWidth: toolProperties.strokeWidth,
            currentItemOpacity: toolProperties.opacity,
          },
        });
        break;
  
      case "circle":
      case "square":
      case "diamond":
        resetToolProperties();
        console.log(activeTool)
        excalidrawAPI.setActiveTool({ type: selectedTool === "circle" ? "ellipse" : selectedTool });
        excalidrawAPI.updateScene({
          appState: {
            currentItemStrokeColor: toolProperties.strokeColor || "#000000",
            currentItemStrokeWidth: toolProperties.strokeWidth|| 2,
            currentItemOpacity: toolProperties.opacity || 100,
            currentItemBackgroundColor: toolProperties?.fillColor || "transparent",
          },
        });
        break;
  
      case "texthighlighter":
        excalidrawAPI.setActiveTool({ type: "line" });
        excalidrawAPI.updateScene({
          appState: {
            currentItemStrokeColor: toolProperties.color,
            currentItemStrokeWidth: 20,
            currentItemOpacity: 50,
          },
        });
        break;
  
      case "text":
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: "text" });
        excalidrawAPI.updateScene({
          appState: {
            currentItemStrokeColor: toolProperties.color,
          },
        });
        break;
  
      case "objectEraser":
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: "eraser" });
        break;
  
      case "rectangleSelection":
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: "selection" });
        break;
  
      default:
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: "selection" });
    }
  };
  
  useEffect(() => {
    if (!activeTool?.id) return;
    switchTool(activeTool.id);
    console.log(activeTool.id);
  }, [
    activeTool?.id,
    activeTool?.color,
    excalidrawAPI,
    activeTool?.opacity,
    activeTool?.fillColor,
    activeTool?.strokeColor,
    activeTool?.strokeWidth,
  ]);


  // Update event listener effect
//   useEffect(() => {
//     if (selectedTool !== "texthighlighter") return;
//  return
//     // Only add the event listener if this is the current page's instance
//     if (pageIndex === currentPage - 1) {
//       document.addEventListener("mouseup", handleTextSelection);

//       return () => {
//         document.removeEventListener("mouseup", handleTextSelection);
//       };
//     }
//   }, [selectedTool, pageIndex, excalidrawAPI, currentPage]);




  // Function 1: Capture Screenshot
  const captureScreenshot = async (selectionStart, selectionEnd) => {
    console.log("Initializing ss");
    if (pageIndex !== currentPage - 1 || !excalidrawAPI) return;

    const pageElement = document.querySelector(
      `[data-page-number="${currentPage}"]`
    );

    if (!pageElement) return;

    const pageRect = pageElement.getBoundingClientRect();

    
    const selectionBounds = {
      x: Math.min(selectionStart.x, selectionEnd.x) - pageRect.left,
      y: Math.min(selectionStart.y, selectionEnd.y) - pageRect.top,
      width: Math.abs(selectionEnd.x - selectionStart.x),
      height: Math.abs(selectionEnd.y - selectionStart.y),
    };

    try {
      const canvas = await html2canvas(pageElement, {
        backgroundColor: null,
        x: selectionBounds.x,
        y: selectionBounds.y,
        width: selectionBounds.width,
        height: selectionBounds.height,
        ignoreElements: (element) => {
          return (
            element.classList.contains("excalidraw-wrapper") ||
            element.classList.contains("excalidraw")
          );
        },
      });

      return new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            console.error("Failed to create Blob from canvas");
            return;
          }

          const reader = new FileReader();
          reader.readAsDataURL(blob);

          reader.onload = function () {
            resolve(reader.result); // Return the image data URL
          };
        }, "image/png");
      });
    } catch (error) {
      console.error("Screenshot capture failed:", error);
      throw error;
    }
  };

  // Function 2: Add Image to Excalidraw
//   const addImageToExcalidraw = (
//     imageDataURL,
//     selectionStart,
//     selectionBounds
//   ) => {
//     const imageId = uuidv4();

//     // Add the file to Excalidraw
//     excalidrawAPI.addFiles([
//       {
//         id: imageId,
//         dataURL: imageDataURL,
//         mimeType: "image/png",
//       },
//     ]);
//     console.log(excalidrawAPI.getFiles());

//     const imageEle = {
//       fileId: imageId,
//       type: "image",
//       status: "saved",
//       x: selectionStart.x,
//       y: selectionStart.y,
//       width: selectionBounds.width,
//       height: selectionBounds.height,
//       backgroundColor: "",
//     };

//     // Get the current scene state
//     const elements = [
//       ...excalidrawAPI.getSceneElementsIncludingDeleted(),
//       imageEle,
//     ];

//     const appState = excalidrawAPI.getAppState();

//     // Update the scene
//     excalidrawAPI.updateScene({
//       elements: restoreElements(elements),
//       appState,
//     });

//     fe(imageEle);
//   };




  


  let data: Data = {
    url: null,
    selection: { x: 0, y: 0 },
    bounds: { x: 0, y: 0, width: 0, height: 0 },
  };




  // Add event listeners
  useEffect(() => {
    if (
      selectedTool === "rectangleSelection" &&
      pageIndex === currentPage - 1
    ) {
      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [selectedTool, pageIndex, currentPage]);

//   useEffect(() => {
//     console.log(excalidrawAPI);
//   }, [excalidrawAPI]);

const [zoom, setZoom] = useState(1);



  return (
    <div className="w-full h-full" style={{pointerEvents:scrollPdf?"none":"auto"}}>
      
      <Excalidraw
        onPointerDown={(e) => {
        //   handlePointerDown();
        }}
        onPaste={(data, event) => {
          // Handle the paste event here

          // Return true to indicate that the event was handled
          return true;
        }}

        // onPointerUpdate={() => {
        //   if (!excalidrawAPI) return;
        //   excalidrawAPI.setActiveTool({ type: "freedraw" });
        // }}

        onChange={handleChange}
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        handleKeyboardGlobally={false}
        // zenModeEnabled={true}
        theme="light"
        viewModeEnabled={false}
        initialData={{
          appState: {
            viewBackgroundColor: "transparent",
            currentItemStrokeColor: "#000000",
            currentItemBackgroundColor: "transparent",
            scrollX: 0,
            scrollY: 0,
            theme: "light",
          },
        }}
        // UIOptions={{
        //   canvasActions: {
        //     changeViewBackgroundColor: false,
        //     export: false,
        //     loadScene: false,
        //     saveToActiveFile: false,
        //     saveAsImage: false,
        //     clearCanvas: false,
        //   },
        //   tools: {
        //     image: true,
        //   },
        // }}
      />

      {/* {screenshotUrl && (
        <ScreenshotOverlay
          screenshotUrl={screenshotUrl}
          onClose={() => setScreenshotUrl(null)}
        />
      )} */}
    </div>
  );
};

export default ExcalidrawFabric;

interface ScreenshotOverlayProps {
  screenshotUrl: string;
  onClose: () => void;
}

export const ScreenshotOverlay = ({
  screenshotUrl,
  onClose,
}: ScreenshotOverlayProps) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-4xl w-full mx-4 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="overflow-auto max-h-[80vh]">
          <img
            src={screenshotUrl}
            alt="Selection Screenshot"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};
