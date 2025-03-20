"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { Note } from "@/types/pdf";
import React from "react";

export interface ActiveTool {
  id: string;
  icon?: JSX.Element;
  type?:
    | "pencil"
    | "line"
    | "arrow"
    | "image"
    | "pencil"
    | "pen"
    | "color"
    | "marker"
    | "highlighter"
    | "pixelEraser"
    | "objectEraser"
    | "rectangleSelection"
    | "freeformSelection"
    | "text"
    | "circle"
    | "square"
    | "triangle"
    | "star"
    | "diamond"
    | "shapes"
    | "arrow"
    | "texthighlighter"
    | "line"
    | "star"
    | "hexagon"
    | null;
  style?: React.CSSProperties;
  color?: string;
  text?: string;
  className?: string;
  strokeWidth?: number;
  opacity?: number;
  fillColor?: string;
  strokeColor?: string;
}
type Modes = "read" | "write" | "chat";

interface SettingsContextType {
  scrollMode: "vertical" | "horizontal" | "two-page";
  toggleScrollMode: () => void;
  scrollToPage: (pageNumber: number) => void;
  rotateSinglePage: (pageNumber: number) => void;
  rotateAllPages: () => void;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setPages: Dispatch<SetStateAction<number>>;
  pages: number;
  updatePageRects: (pageNumber: number | null) => DOMRect[];
  pageRects: DOMRect[];
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  selectedText: string;
  setSelectedText: React.Dispatch<React.SetStateAction<string>>;
  first: Boolean;
  setfirst: any;
  scale: number;
  setScale: any;
  currentDocumentId: string;
  setcurrentDocumentId: any;
  isInfinite: boolean;
  setIsInfinite: any;
  theme: string;
  setTheme: any;
  isVisible: boolean;
  setIsVisible: any;
  scrollPdf: boolean;
  setScrollPdf: any;
  data: Data;
  setData: any;
  isPagesLoaded: boolean;
  setIsPagesLoaded: any;
  selectedView: ViewOption;
  setSelectedView: any;
  activeTool: ActiveTool;
  setActiveTool: any;
  viewMode: any;
  setViewMode: any;
  isHeadderVisible: boolean;
  setisHeadderVisible: any;
  isDarkFilter: boolean;
  setisDarkFilter: any;
  ispagesZooming: boolean;
  setispagesZooming: any;
  isPagesZoomingFromGesture: boolean;
  setisPagesZoomingFromGesture: any;
  isSearchVisible: boolean;
  setisSearchVisible: any;
  isExpanded: boolean;
  setisExpanded: any;
  currentView: Modes;
  setcurrentView: any;
  pageDimensions: PageDimensions;
  setpageDimensions: React.Dispatch<React.SetStateAction<PageDimensions>>;

  isDarkMode: boolean;
  setisDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  SyncPdfAnnotations: boolean;
  setSyncPdfAnnotations: any;
  syncFileSystem: boolean;
  setsyncFileSystem: any;
  currentDocument: CurrentDocument;
  setcurrentDocument: React.Dispatch<React.SetStateAction<CurrentDocument>>;
  isPdfLoaded: boolean;
  setisPdfLoaded: any;
  isTrainingProgress: boolean;
  setisTrainingProgress: any;
  isUploadProgress: boolean;
  setisUploadProgress: any;
  excalidrawScale:boolean; setexcalidrawScale:any
}
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

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

interface SettingsProviderProps {
  children: ReactNode;
}

const ViewMode = {
  SINGLE: "single",
  DOUBLE: "double",
  CAROUSEL: "carousel",
};
interface View {
  view: "write" | "read";
}
interface PageDimensions {
  height: number;
  width: number;
}

interface CurrentDocument {
  title: string;
  id: string;
}

type ViewOption = 1 | 2 | 3;
export function SettingsProvider({ children }: SettingsProviderProps) {
  const [scrollMode, setScrollMode] = useState<
    "vertical" | "horizontal" | "two-page"
  >("vertical");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [pageRects, setpageRects] = useState<DOMRect[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [first, setfirst] = useState(false);
  const [scale, setScale] = useState<number>(0.9);
  const [currentDocumentId, setcurrentDocumentId] = useState<string>("");
  const [isInfinite, setIsInfinite] = useState<boolean>(false);
  const [theme, setTheme] = useState("light");
  const [isVisible, setIsVisible] = useState(true);
  const [scrollPdf, setScrollPdf] = useState(false);
  const [data, setData] = useState<Data>();
  const [isPagesLoaded, setIsPagesLoaded] = useState(false);
  const [selectedView, setSelectedView] = useState<ViewOption>(1);
  const [activeTool, setActiveTool] = useState<ActiveTool>();
  const [selectedColor, setSelectedColor] = useState("#000");
  const [viewMode, setViewMode] = useState(ViewMode.SINGLE);
  const [isHeadderVisible, setisHeadderVisible] = useState(true);
  const [isDarkFilter, setisDarkFilter] = useState(false);
  const [ispagesZooming, setispagesZooming] = useState();
  const [isPagesZoomingFromGesture, setisPagesZoomingFromGesture] =
    useState(false);
  const [isSearchVisible, setisSearchVisible] = useState(false);
  const [isExpanded, setisExpanded] = useState(false);
  const [currentView, setcurrentView] = useState<View>();
  const [pageDimensions, setpageDimensions] = useState<PageDimensions>();
  const [isDarkMode, setisDarkMode] = useState<boolean>(false);
  const [SyncPdfAnnotations, setSyncPdfAnnotations] = useState(false);
  const [syncFileSystem, setsyncFileSystem] = useState(false);
  const [currentDocument, setcurrentDocument] = useState<CurrentDocument>();
  const [isPdfLoaded, setisPdfLoaded] = useState(false);
  const [isTrainingProgress, setisTrainingProgress] = useState(false);
  const [isUploadProgress, setisUploadProgress] = useState(false);
  const [excalidrawScale, setexcalidrawScale] = useState(1)
  const [globalDarkMode, setglobalDarkMode] = useState(false)

  return (
    <SettingsContext.Provider
      value={{
        scrollMode,
        currentPage,
        setCurrentPage,
        pages,
        setPages,
        pageRects,
        notes,
        setNotes,
        selectedText,
        setSelectedText,
        first,
        setfirst,
        scale,
        setScale,
        currentDocumentId,
        setcurrentDocumentId,
        isInfinite,
        setIsInfinite,
        theme,
        setTheme,
        isVisible,
        setIsVisible,
        scrollPdf,
        setScrollPdf,
        data,
        setData,
        isPagesLoaded,
        setIsPagesLoaded,
        selectedView,
        setSelectedView,
        activeTool,
        setActiveTool,
        selectedColor,
        setSelectedColor,
        viewMode,
        setViewMode,
        isHeadderVisible,
        setisHeadderVisible,
        isDarkFilter,
        setisDarkFilter,
        ispagesZooming,
        setispagesZooming,
        isPagesZoomingFromGesture,
        setisPagesZoomingFromGesture,
        isSearchVisible,
        setisSearchVisible,
        isExpanded,
        setisExpanded,
        currentView,
        setcurrentView,
        pageDimensions,
        setpageDimensions,
        isDarkMode,
        setisDarkMode,
        SyncPdfAnnotations,
        setSyncPdfAnnotations,
        syncFileSystem,
        setsyncFileSystem,
        currentDocument,
        setcurrentDocument,
        isPdfLoaded,
        setisPdfLoaded,
        isTrainingProgress,
        setisTrainingProgress,
        isUploadProgress,
        setisUploadProgress,
        excalidrawScale,
        setexcalidrawScale,
        globalDarkMode, setglobalDarkMode
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
