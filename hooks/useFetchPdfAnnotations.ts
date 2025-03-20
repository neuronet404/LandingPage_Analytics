import { useEffect, useState,useCallback } from "react";
import { hasAnnotations } from "@/db/pdf/pdfAnnotations";
import { downloadAnnotations, uploadAnnotations } from "@/lib/pdfAnnotaionsUtils";

interface AnnotationsProps {
  userId: string | undefined;
  documentId: string | undefined;
}




export const useFetchAnnotations = ({ userId, documentId }: AnnotationsProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchAnnotations = useCallback(async () => {
    if (!userId || !documentId) return;

    try {
      let annotationData = await hasAnnotations(documentId);
      // if (!annotationData) {
        await downloadAnnotations(userId, documentId);
      // }
      setIsLoaded(false);
    } catch (error) {
      console.error("Error fetching annotations:", error);
      setIsLoaded(false);
    }
  }, [userId, documentId]);

  const handleUploadAnnotations = useCallback(async () => {
    try {
      setIsLoaded(true);
      await uploadAnnotations(userId, documentId);
      setIsLoaded(false)
    } catch (error) {
      console.error("Error uploading annotations:", error);
    }
  }, [userId, documentId]);

  return { isLoaded, fetchAnnotations, uploadAnnotations: handleUploadAnnotations };
};
