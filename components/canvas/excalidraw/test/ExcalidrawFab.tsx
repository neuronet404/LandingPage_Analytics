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

const ExcalidrawFab= ({
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
    isDarkMode
  } = useSettings();
  const [ispointerMoving, setispointerMoving] = useState(false);

  useEffect(() => {
    if (!excalidrawAPI) return;
    if (isDarkFilter || isDarkMode) {
      excalidrawAPI.updateScene({ appState: { theme: "dark" } });
    } else {
      excalidrawAPI.updateScene({ appState: { theme: "light" } });
    }
  }, [isDarkFilter,ispointerMoving,isDarkMode]);

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
        // newAppState.zoom = { value: initialAppState1.zoom.value };
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


  let isUndoing = false; // Flag to prevent multiple undo actions





  let imageBounds;

  const captureScreenshot = async (selectionStart, selectionEnd) => {
    try {
      if (!selectionStart || !selectionEnd) return;

      const pageElement = document.getElementById(`page-${pageIndex}`);

      if (!pageElement) {
        console.error("Page element not found");
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
    // save();
    console.log("page index is ", pageIndex)
    setispointerMoving(true)
    if (!activeTool?.id) {
      if (!excalidrawAPI) return;
      excalidrawAPI.setActiveTool({ type: "selection" });
      return;
    }
    if (!(activeTool?.id === "rectangleSelection")) return;



    excalidrawAPI?.updateScene({ appState: { zoom: { value: 1 } } });

    const { pointer, button } = payload;
    const pageElement = document.getElementById(`page-${pageIndex}`);
    console.log(pageElement,pageIndex)

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
    setispointerMoving(false)
  };

  const captureSelection = async (
    selectionStart: SelectionPoint,
    selectionEnd: SelectionPoint
  ) => {
    const imageDataURL = await captureScreenshot(selectionStart, selectionEnd);
    console.log(imageDataURL)

    if (imageDataURL) {
      setScreenshotUrl(imageDataURL);
      data = {
        url: imageDataURL,
        bounds: imageBounds,
      };
      console.log(data)
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
      className="w-[100%] h-[100%]"
      style={{ pointerEvents: scrollPdf ? "none" : "auto" }}
    >
      <Excalidraw
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

export default ExcalidrawFab;


