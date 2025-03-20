import { useEffect, useState } from "react";
import { getPdfById, addPdf } from "@/db/pdf/pdfFiles";
import { downloadPdfToLocal } from "@/lib/pdfUtils";
import { pdfjs } from "react-pdf";

interface PdfProps {
  id: string;
  userId: string | undefined;
}

export const useFetchPdf = ({ id, userId }: PdfProps) => {
  const [pdf, setPdf] = useState<any>(null);
  const [pageHeight, setPageHeight] = useState<number | null>(null);
  const [pageWidth, setPageWidth] = useState<number | null>(null);
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);

  useEffect(() => {
    if (!id || !userId) return;

    const fetchPdf = async () => {
      try {
        let pdfData = await getPdfById(id);

        if (!pdfData?.base64) {
          await downloadPdfToLocal(userId, id, async () => {
            pdfData = await getPdfById(id);
            if (!pdfData?.base64) return;
            processPdf(pdfData.base64);
            console.log("Downloading the pdff....")
          });
          
        } else {
          processPdf(pdfData.base64);
        }
      } catch (error) {
        console.error("Error fetching PDF:", error);
        setIsPdfLoaded(false);
      }
    };

    const processPdf = async (base64: string) => {
      const base64String = base64.replace(/^data:application\/pdf;base64,/, "");
      const binaryString = atob(base64String);
      const byteArray = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
      }

      const pdfDocument = await pdfjs.getDocument({ data: byteArray }).promise;
      setPdf(pdfDocument);

      const firstPage = await pdfDocument.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1 });
      setPageHeight(viewport.height);
      setPageWidth(viewport.width);
      setIsPdfLoaded(true);
    };

    fetchPdf();
  }, [id, userId]);

  return { pdf, pageHeight, pageWidth, isPdfLoaded };
};
