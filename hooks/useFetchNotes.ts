import { useState, useCallback } from "react";
import { uploadAnnotations, downloadAnnotations } from "@/lib/noteUtils";

export const useFetchNotes = (currentDocumentId,userId) => {
  const [status, setStatus] = useState("");
  const [isDownloaded, setIsDownloaded] = useState(false);

  const upload = useCallback(async () => {
    setStatus("Uploading annotations...");
    try {
      setIsDownloaded(true)
      const message = await uploadAnnotations(currentDocumentId,userId);
      setStatus(message);
      setIsDownloaded(false)
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  }, [currentDocumentId,userId]);

  const download = useCallback(async () => {
    setStatus("Downloading annotations...");
    try {
      const message = await downloadAnnotations(currentDocumentId,userId);
      setStatus(message);
      setIsDownloaded(true);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  }, [currentDocumentId,userId]);

  return { status, isDownloaded, upload, download };
};
