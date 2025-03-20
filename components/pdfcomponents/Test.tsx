"use client";
import React, { useEffect, useRef } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PDFViewer, EventBus } from "pdfjs-dist/legacy/web/pdf_viewer.mjs";
import type { PDFViewerOptions } from "pdfjs-dist/types/web/pdf_viewer";
import { AnnotationLayerBuilder } from "pdfjs-dist/web/pdf_viewer.mjs";
// import {} from "pdfjs-dist/web/pdf_viewer.mjs"
interface Props {
    pdfDocument: PDFDocumentProxy;
    pdfScaleValue?: string;
    pdfViewerOptions?: PDFViewerOptions;
    page?: number;
}

export const PDFViewerComponent: React.FC<Props> = ({
    pdfDocument,
    pdfScaleValue = "auto",
    pdfViewerOptions,
    page = 1,
}) => {
    const containerNodeRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<PDFViewer | null>(null);
    let eventBus: EventBus | undefined;



    // Function: Rotate the entire document by 90 degrees
    const rotateDocument = (rotation: number) => {
        if (viewerRef.current) {
            viewerRef.current.pagesRotation = rotation;
        }
    };

    // Function: Scroll to a specific page
    const scrollToPage = (pageNumber: number) => {
        if (viewerRef.current) {
            viewerRef.current.scrollPageIntoView({
                pageNumber,
                allowNegativeOffset: false,
                ignoreDestinationZoom: false,
            });
        }
    };

    // Function: Set page colors for accessibility (background/foreground)
    const setPageColors = (backgroundColor: string, foregroundColor: string) => {
        if (viewerRef.current) {
            viewerRef.current.pageColors = {
                background: backgroundColor,
                foreground: foregroundColor,
            };
        }
    };

    // Function: Set the spread mode to continuous scroll (or others)
    const setSpreadMode = (spreadMode: number) => {
        if (viewerRef.current) {
            viewerRef.current._spreadMode = spreadMode;
        }
    };

    // Function: Scroll mode (e.g., horizontal or vertical)
    const setScrollMode = (scrollMode: number) => {
        if (viewerRef.current) {
            viewerRef.current._scrollMode = scrollMode; // 2 for horizontal
        }
    };

    // Function: Rotate a specific page
    const rotatePage = (pageNumber: number, rotation: number) => {
        const viewer = viewerRef.current;
        if (viewer) {
            const pagesCount = viewer.pagesCount;
            if (pageNumber < 1 || pageNumber > pagesCount) {
                console.error("Invalid page number");
                return;
            }
            const pageView = viewer.getPageView(pageNumber - 1);
            if (pageView) {
                pageView.rotation = rotation;
                viewer.forceRendering(viewer._getVisiblePages());
            }
        }
    };

    // Function: Getcached pages
    const getCaechedPages = () => {
        if (!viewerRef.current) return
        const cachedPages = viewerRef.current.getCachedPageViews();
        console.log(`Cached Pages: ${cachedPages.size}`);
    }

    // Function ...

    const renderVisiblePages = () => {
        if (!viewerRef.current) return
        const visiblePages = viewerRef.current.forceRendering(viewerRef.current._getVisiblePages());
        console.log(`Currently visible pages are rendered.`);

    }

    const getVisiblePages = () => {
        if (!viewerRef.current) return
        const visiblePages = viewerRef.current._getVisiblePages();
        console.log('Visible Pages:', visiblePages);
    }


    // Function: Handle the `pagesinit` event
    const onPagesInit = () => {
        const pdfViewer = viewerRef.current
        if (pdfViewer) {
            console.log("Pages initialized!");
            pdfViewer.currentScaleValue = pdfScaleValue;
            pdfViewer.currentScale = 1;
            // console.log(pdfViewer.getPageView(2));
            // console.log(pdfViewer.getCachedPageViews());
            // console.log(pdfViewer._pageLabels);
            // rotateDocument(90)
            // setSpreadMode(3)
            // setScrollMode(1)
            // rotatePage(1,90)
            // const pagesRendered = pdfViewer.forceRendering();
            // console.log(`Rendering triggered: ${pagesRendered}`);
            // scrollToPage(3)

            //renderVisiblePages()
           


            // pdfViewer.eventBus.on('pagechanging', (evt) => {
            //     // console.log(`Current Page: ${evt.pageNumber}`);
            //     getCaechedPages()
            //     //getVisiblePages()

            // });



            // pdfDocument.getOutline().then(outline => {

            //     // pdfOutlineViewer.render({ outline, pdfDocument });
            //     console.log(outline)
            //   });




        }
    };

    // Function: Initialize the PDF viewer
    const initPDFViewer = async () => {
        const pdfjs = await import("pdfjs-dist/web/pdf_viewer.mjs");
        eventBus = new pdfjs.EventBus();

        if (!containerNodeRef.current) {
            throw new Error("Container reference is missing!");
        }

        if (!viewerRef.current) {
            viewerRef.current = new pdfjs.PDFViewer({
                container: containerNodeRef.current,
                eventBus,
                textLayerMode: 2,
                removePageBorders: false,
                annotationMode: 1,
                ...pdfViewerOptions,
            });
        }

        // Set up the event listener for `pagesinit`
        eventBus.on("pagesinit", onPagesInit);

        viewerRef.current.setDocument(pdfDocument);
    };



    useEffect(() => {
        initPDFViewer().catch((error) => console.error("PDF Viewer initialization failed", error));

        return () => {
            viewerRef.current = null;
        };
    }, [pdfDocument, pdfScaleValue, pdfViewerOptions]);



    return (
        <div className="h-screen overflow-y-auto">
            <div ref={containerNodeRef} className="pdf-container absolute  h-full overflow-y-auto">
                <div className="pdfViewer w-full" />
            </div>
        </div>
    );
};
