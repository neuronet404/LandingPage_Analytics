"use client";
import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import {
  AppState,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";
import { getAppState, saveAppState } from "@/db/pdf/pdfAnnotations";

import { useSettings } from "@/context/SettingsContext";
import type { ActiveTool } from "@/context/SettingsContext";
import html2canvas from "html2canvas";
import { ReceiptEuro, X } from "lucide-react";
import "@/components/canvas/excalidraw/CustomExcalidraw.css";
import { useFetchAnnotations } from "@/hooks/useFetchPdfAnnotations";

interface SelectionPoint {
  x: number;
  y: number;
}

interface SelectionBounds {
  width: number;
  height: number;
}

interface Data {
  url: object | null;
  bounds: SelectionBounds;
}

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false }
);

const ExcalidrawFabric = ({
  pageIndex,
  currentDocumentId,
  zoom,
}: {
  pageIndex?: number;
  currentDocumentId?: string;
}) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();
  const {
    currentPage,
    setScrollPdf,
    setData,
    activeTool,
    setActiveTool,
    setisHeadderVisible,
    setispagesZooming,
    setisPagesZoomingFromGesture,
    ispagesZooming,
    scrollPdf,
    isDarkFilter,
    excalidrawScale
  } = useSettings();
  const [ispointerMoving, setispointerMoving] = useState(false);

  useEffect(() => {
    if (!excalidrawAPI) return;
    if (isDarkFilter) {
      excalidrawAPI.updateScene({ appState: { theme: "dark" } });
    } else {
      excalidrawAPI.updateScene({ appState: { theme: "light" } });
    }
  }, [isDarkFilter, ispointerMoving, pageIndex, excalidrawAPI]);

  const initialAppState: AppState = {
    zoom: { value: zoom },
    scrollX: 0,
    scrollY: 0,
  };
  const initialAppState1: AppState = {
    zoom: { value: 1 },
    scrollX: 0,
    scrollY: 0,
  };
  const [screenshotUrl, setScreenshotUrl] = useState(null);

  let storedElements = []; // Store elements before hiding

  useEffect(() => {
    console.log(storedElements);
  }, [storedElements]);
  const hideAllElements = () => {
    if (!excalidrawAPI) return;

    const excalidraw = excalidrawAPI.getSceneElements();
    if (!excalidraw || excalidraw.length === 0) return;

    // Store elements before hiding them
    storedElements = excalidraw.map((el) => ({ ...el }));

    const hiddenElements = excalidraw.map((el) => ({
      ...el,
      isDeleted: true, // Mark elements as deleted
    }));

    excalidrawAPI.updateScene({ elements: hiddenElements });
  };

  // Function to enable all elements
  const enableAllElements = () => {
    if (!excalidrawAPI || storedElements.length === 0) return;

    // Restore elements from stored reference
    const restoredElements = storedElements.map((el) => ({
      ...el,
      isDeleted: false, // Mark elements as visible
    }));

    excalidrawAPI.updateScene({ elements: restoredElements });
  };

  const handleChange = (
    elements: readonly ExcalidrawElement[],
    state: AppState
  ) => {
    if (!excalidrawAPI) return;
    let shouldUpdateScene = false;
    const newAppState: Pick<AppState, keyof AppState> = { ...state };
    const appstate = excalidrawAPI.getAppState();
    // console.log(elements);

    if (activeTool?.id === "rectangleSelection") {
      if (state.zoom.value !== initialAppState1.zoom.value) {
        newAppState.zoom = { value: initialAppState1.zoom.value };
        // hideAllElements()
        // shouldUpdateScene = true;
      }
    } else if (state.zoom.value !== initialAppState.zoom.value) {
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
    }

    if (shouldUpdateScene) {
      excalidrawAPI.updateScene({
        appState: {
          ...appstate,
          ...newAppState,
        },
      });

      setisHeadderVisible(true);
      setispagesZooming(true);
      // setZoom((prev:number)=> prev+0.1)
      setScrollPdf(true);
      setTimeout(() => {
        setispagesZooming(false);
        // setZoom((prev:number) => prev-0.1)
        setScrollPdf(false);
        setisPagesZoomingFromGesture(false);
      }, 50);
    }
  };

  const save = async () => {
    const elements = excalidrawAPI?.getSceneElements();
    const state = excalidrawAPI?.getAppState();
    const files = excalidrawAPI?.getFiles();
    // console.log("saving..");
    await saveAppState(currentDocumentId, elements, state, files, pageIndex);
  };

  useEffect(() => {
    async function fetchAndSetCanvas() {
      try {
        const canvasData = await getAppState(currentDocumentId, pageIndex);
        if (canvasData && excalidrawAPI) {
          if (canvasData.files) {
            excalidrawAPI.addFiles(
              Object.entries(canvasData.files).map(([id, file]) => ({
                id,
                ...file,
              }))
            );
          }
          excalidrawAPI.updateScene({
            elements: canvasData.elements,
            // appState: canvasData.appState,
          });
        }
      } catch (error) {
        // console.error("Error fetching canvas:", error);/
      }
    }

    fetchAndSetCanvas();
  }, [pageIndex, currentDocumentId, excalidrawAPI]);

  let isUndoing = false; // Flag to prevent multiple undo actions

  // Handle undo action
  const undo = (currentPage:number) => {
    console.log("clicking on the ",currentPage)
    const excalidrawEle = document.getElementById(
      `excalidraw-page-${currentPage}`
    );
    console.log(currentPage, excalidrawEle);
    const undoButton = excalidrawEle?.querySelector('[aria-label="Undo"]');
    if (undoButton) {
      undoButton?.click();
    }
  };

  // Handle redo action
  const redo = (currentPage:number) => {
    const excalidrawEle = document.getElementById(
      `excalidraw-page-${currentPage}`
    );
    console.log(currentPage, excalidrawEle);
    const undoButton = excalidrawEle?.querySelector('[aria-label="Redo"]');
    // console.log(undoButton);
    if (undoButton) {
      undoButton?.click();
      // console.log("clicking....");
    }
  };

  const switchTool = (selectedTool: ActiveTool["type"]) => {
    if (!excalidrawAPI) return;

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
            currentItemStrokeWidth: toolProperties.strokeWidth / excalidrawScale,
          },
        });
        break;

      case "image":
        if (currentPage != pageIndex) return;
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: "image" });
        setActiveTool(null);
        break;

      case "arrow":
      case "line":
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: selectedTool });
        excalidrawAPI.updateScene({
          appState: {
            currentItemStrokeColor: toolProperties.strokeColor,
            currentItemStrokeWidth: toolProperties.strokeWidth / excalidrawScale,
            currentItemOpacity: toolProperties.opacity,
          },
        });
        break;

      case "circle":
      case "rectangle":
      case "diamond":
        resetToolProperties();
        // console.log(activeTool);
        // Map the selected tool properly
        const mappedTool =
          selectedTool === "circle"
            ? "ellipse"
            : selectedTool === "rectangle"
            ? "rectangle"
            : selectedTool;
        excalidrawAPI.setActiveTool({ type: mappedTool });
        excalidrawAPI.updateScene({
          appState: {
            currentItemStrokeColor: toolProperties.strokeColor || "#000000",
            currentItemStrokeWidth: (toolProperties.strokeWidth || 2)/ excalidrawScale,
            currentItemOpacity: toolProperties.opacity || 100,
            currentItemBackgroundColor:
              toolProperties?.fillColor || "transparent",
          },
        });
      
        break;

      case "texthighlighter":
        excalidrawAPI.setActiveTool({ type: "line" });
        excalidrawAPI.updateScene({
          appState: {
            currentItemStrokeColor: toolProperties.color,
            currentItemStrokeWidth: 20/ excalidrawScale,
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

      case "undo":
        // console.log(currentPage === pageIndex);
        console.log(`this is current page ${currentPage} and ${pageIndex} this is page index`)
        if (currentPage != pageIndex) return;
        resetToolProperties();
        undo(currentPage);
        setActiveTool(null);
        break;
      case "redo":
        // console.log(currentPage === pageIndex);
        console.log(`this is current page ${currentPage} and ${pageIndex} this is page index`)
        if (currentPage != pageIndex) return;
        resetToolProperties();
        redo(currentPage);
        setActiveTool(null);
        break;

      case "selection":
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: "selection" });
      default:
        resetToolProperties();
        excalidrawAPI.setActiveTool({ type: "selection" });
    }
  };

  useEffect(() => {
    // console.log("scrolling")
  }, [pageIndex, scrollPdf]);

  useEffect(() => {
    if (!activeTool?.id) return;
    switchTool(activeTool.id);
    console.log(activeTool.id);
    // console.log(activeTool.id);
  }, [
    activeTool?.id,
    activeTool?.color,
    excalidrawAPI,
    activeTool?.opacity,
    activeTool?.fillColor,
    activeTool?.strokeColor,
    activeTool?.strokeWidth,
    currentPage,
    pageIndex,
  ]);

  let imageBounds;

  const captureScreenshot = async (selectionStart, selectionEnd) => {
    try {
      if (!selectionStart || !selectionEnd) return;

      const pageElement = document.querySelector(
        `[data-page-number="${pageIndex}"] .react-pdf__Page__canvas`
      );

      if (!pageElement) {
        // console.error("Page element not found");
        return;
      }

      const pageRect = pageElement.getBoundingClientRect();

      // Adjust selection bounds based on zoom
      const selectionBounds = {
        x: Math.max(
          0,
          Math.min(selectionStart.x, selectionEnd.x) + pageRect.left
        ),
        y: Math.max(
          0,
          Math.min(selectionStart.y, selectionEnd.y) + pageRect.top
        ),
        width: Math.abs(selectionEnd.x - selectionStart.x),
        height: Math.abs(selectionEnd.y - selectionStart.y),
      };
      const scale = 1;

      const scaledBounds = {
        x: selectionBounds.x / scale,
        y: selectionBounds.y / scale,
        width: selectionBounds.width / scale,
        height: selectionBounds.height / scale,
      };

      if (scaledBounds.width <= 0 || scaledBounds.height <= 0) {
        // console.error("Invalid dimensions");
        return;
      }

      const canvas = await html2canvas(pageElement, {
        backgroundColor: null,
        x: scaledBounds.x,
        y: scaledBounds.y,
        width: scaledBounds.width,
        height: scaledBounds.height,
        useCORS: true,
      });

      imageBounds = scaledBounds;

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Blob creation failed"));
          } else {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(blob);
          }
        }, "image/png");
      });
    } catch (error) {
      // console.error("Screenshot capture failed:", error);
      throw error;
    }
  };

  let data: Data = {
    url: null,
    bounds: { width: 0, height: 0 },
  };

  let selectionStart = null;

  const handlePointerUpdate = (payload: {
    pointer: { x: number; y: number; tool: "pointer" | "laser" };
    button: "down" | "up";
    pointersMap: Gesture["pointers"];
  }) => {
    save();
    setispointerMoving(true);
    if (!activeTool?.id) {
      if (!excalidrawAPI) return;
      excalidrawAPI.setActiveTool({ type: "selection" });
      return;
    }
    
    if ((activeTool?.id === "Image")) return;
    switchTool(activeTool.id);
    if (!(activeTool?.id === "rectangleSelection")) return;

    // excalidrawAPI?.updateScene({ appState: { zoom: { value: 1 } } });

    const { pointer, button } = payload;
    const pageElement = document.querySelector(
      `[data-page-number="${pageIndex}"]`
    );

    if (!pageElement) return;

    const pageRect = pageElement.getBoundingClientRect();

    if (button === "down") {
      if (selectionStart === null) {
        selectionStart = {
          x: pointer.x - pageRect.left,
          y: pointer.y - pageRect.top,
        };
      }
    } else if (button === "up") {
      if (selectionStart) {
        const selectionEnd = {
          x: pointer.x - pageRect.left,
          y: pointer.y - pageRect.top,
        };

        captureSelection(selectionStart, selectionEnd);
        setActiveTool(null);
        selectionStart = null;
      }
    }
    setispointerMoving(false);
  };

  const captureSelection = async (
    selectionStart: SelectionPoint,
    selectionEnd: SelectionPoint
  ) => {
    const imageDataURL = await captureScreenshot(selectionStart, selectionEnd);

    if (imageDataURL) {
      setScreenshotUrl(imageDataURL);
      data = {
        url: imageDataURL,
        bounds: imageBounds,
      };
      setData(data);
    }
  };

  useEffect(() => {
    const appState = excalidrawAPI?.getAppState();
    if (!appState) return;

    // Update zoom directly using the app state
    excalidrawAPI?.updateScene({
      appState: {
        // ...appState, // Spread the existing state to avoid overwriting
        zoom: { value: zoom }, // Update the zoom value
      },
    });
  }, [zoom]);

  return (
    <div
      className={` w-full h-full ${
        activeTool?.id === "rectangleSelection" ? "" : ""
      }`}
      style={{
        pointerEvents:
          scrollPdf || activeTool?.id === "rectangleSelection"
            ? "none"
            : "auto",
      }}
      id={`excalidraw-page-${pageIndex + 1}`}
    >
      <Excalidraw
        onPointerDown={(e) => {}}
        onPointerUpdate={handlePointerUpdate}
        onChange={handleChange}
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        handleKeyboardGlobally={false}
        objectsSnapModeEnabled={false}
        // gridModeEnabled={true}
        theme="light"
        viewModeEnabled={false}
        initialData={{
          appState: {
            viewBackgroundColor: "transparent",
            currentItemStrokeColor: "#000000",
            currentItemBackgroundColor: "transparent",
            scrollX: 0,
            scrollY: 0,
            theme: "dark",
          },
        }}
      />
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
