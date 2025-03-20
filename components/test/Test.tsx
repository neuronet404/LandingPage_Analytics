import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { useInView } from "react-intersection-observer";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import ExcalidrawFabric from "@/components/canvas/excalidraw/test/ExcalidrawFabric";
import { getPdfById } from "@/db/pdf/pdfFiles";
import { useSettings } from "@/context/SettingsContext";
import { Slider } from "../ui/slider";
import { debounce } from "lodash";
import { List } from "react-virtualized";
import { TwoFingerScroll } from "@/components/pdfcomponents/TwoFingerScroll";
import PDFPageContainer from "./PDFPageContainer";
import _ from "lodash";
import { ThumbnailDiv } from "./ThumbnailDiv";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

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
};

const PDFViewer = ({ url }) => {
  const [numPages, setNumPages] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [localZoom, setLocalZoom] = useState(1);
  const [fitToWidth, setFitToWidth] = useState(true);
  const [pageHeight, setPageHeight] = useState(900);
  const [pageWidth, setPageWidth] = useState();
  const [scrollTop, setScrollTop] = useState(0);
  const {setisHeadderVisible} = useSettings()

  const {
    viewMode,
    setScale,
    setPages,
    setcurrentView,
    isExpanded,
    setisExpanded,
    setCurrentPage,
    setpageDimensions,
    pageDimensions,
    first
  } = useSettings();
  const listRef = useRef(null);

  useEffect(() => {
    setcurrentView("read");
  }, [first]);

  const onLoadPageSuccess = useCallback((page) => {
    if (page?.originalHeight) {
      setPageHeight(page.originalHeight);
      setPageWidth(page.originalWidth);

        setpageDimensions({
          height: page.originalHeight,
          width: page.originalWidth,
        });

    }
  }, []);

  const renderRow = useCallback(
    ({ index, key, style }) => {
      const pageNumber1 = index * 2 + 1;
      const pageNumber2 = index * 2 + 2;

      return (
        <div
          key={key}
          style={{ height: style.height, top: style.top }}
          className={`flex justify-center items-center w-[100%] absolute`}
        >
          {viewMode === ViewMode.DOUBLE ? (
            <>
              {pageNumber1 <= numPages && (
                <PDFPageContainer
                  key={`page-${pageNumber1}`}
                  pageNumber={pageNumber1}
                  zoom={zoom}
                  setZoom={setZoom}
                  onLoadSuccess={onLoadPageSuccess}
                />
              )}
              {pageNumber2 <= numPages && (
                <PDFPageContainer
                  key={`page-${pageNumber2}`}
                  pageNumber={pageNumber2}
                  zoom={zoom}
                  setZoom={setZoom}
                  onLoadSuccess={onLoadPageSuccess}
                />
              )}
            </>
          ) : (
            <PDFPageContainer
              key={`page-${pageNumber1}`}
              pageNumber={pageNumber1}
              zoom={zoom}
              setZoom={setZoom}
              onLoadSuccess={onLoadPageSuccess}
            />
          )}
        </div>
      );
    },
    [viewMode, zoom, numPages, onLoadPageSuccess]
  );

  const debouncedSetZoom = useCallback(
    debounce((value) => {
      setZoom(value);
      setScale(value);
    }, 200),
    []
  );



  // Define a variable to track the previous scroll position
let previousScrollTop = 0;

// Create a debounced function for updating the header visibility state
const debouncedSetHeaderVisibility = _.debounce((isVisible, setisHeadderVisible) => {
  setisHeadderVisible(isVisible);
}, 200); // Adjust the debounce delay as needed (e.g., 200ms)

const handlePageChange = useCallback((params) => {
  const { scrollTop } = params;

  // Determine if scrolling up or down
  if (scrollTop > previousScrollTop) {
    debouncedSetHeaderVisibility(false, setisHeadderVisible);
  } else if (scrollTop < previousScrollTop) {

    debouncedSetHeaderVisibility(true, setisHeadderVisible);
  }

  // Update the previousScrollTop value for the next scroll event
  previousScrollTop = scrollTop;
}, []);



useEffect(() => {
  if (pageWidth && isExpanded) {
    const scale = window.innerWidth / pageWidth;
    const scaleVal = viewMode === ViewMode.DOUBLE ? scale / 2 : scale;
    setZoom(scaleVal);
  } else if (pageWidth && !isExpanded) {
    const scale = window.innerWidth / pageWidth;
    const scaleVal = viewMode === ViewMode.DOUBLE ? scale / 2 : scale;
    setZoom(scaleVal / 2);
  }
}, [pageWidth, isExpanded, viewMode]);


useEffect(() => {
   if (pageWidth) {
    const scale = window.innerWidth / pageWidth;
    const scaleVal = viewMode === ViewMode.DOUBLE ? scale / 2 : scale;
    setZoom(scaleVal);
  }
}, []);


  useEffect(() => {
    const savedPage = 1;
    if (savedPage) {
      setTimeout(() => {
        const element = document.querySelector(`[data-page-number="1"]`);
        console.log(element);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [numPages, viewMode]); //

  const handleZoomChange = (value) => {
    setLocalZoom(value[0]);
    debouncedSetZoom(value[0]);
  };

  return (
    <div className="flex h-full w-full overflow-hidden scrollbar-hidden">
      <div className="flex-1 flex flex-col">
        <div
          className="flex-1 overflow-auto relative w-full items-center justify-center"
          id="scrollableElement"
          ref={listRef}
        >
          <TwoFingerScroll>
            <Document
              file={url}
              onLoadSuccess={(doc) => {
                setNumPages(doc.numPages);
                setPages(doc.numPages);
              }}
              loading={<Loading message="Loading PDF..." />}
              error={<ErrorComponent message="Failed to load PDF" />}
            >
              {numPages && (
                <List
                  width={window.innerWidth}
                  height={window.innerHeight}
                  rowCount={
                    viewMode === ViewMode.DOUBLE
                      ? Math.ceil(numPages / 2)
                      : numPages / 2
                  }
                  rowHeight={(pageHeight * zoom) + (20 * zoom)}
                  rowRenderer={renderRow}
                  overscanRowCount={0}
                  onScroll={handlePageChange}
                  className="custom-scrollbar"
                />
              )}
            </Document>

          </TwoFingerScroll>

{/* <PageSlider/> */}
        </div>
      </div>
    </div>
  );
};

const PdfViewer = ({ id }) => {
  const [pdfData, setPdfData] = useState<string | null>(null);


  const handleFetchPdf = async () => {
    try {
      const pdf = await getPdfById(id);
      if (pdf?.base64) {
        setPdfData(pdf.base64);
      }
    } catch (error) {
      console.error("Error fetching PDF:", error);
    }
  };

  useEffect(() => {
    handleFetchPdf();
  }, []);

  return (
    <div className="w-full h-full overflow-hidden">
      {pdfData && <PDFViewer url={pdfData} />}
    </div>
  );
};

export default PdfViewer;
