import { getAllPdfs,  addPdf, deletePdf } from "@/db/pdf/pdfFiles";
import { markPdfAsSynced } from "@/db/pdf/fileSystem";
import { deleteAnnotations } from "./pdfAnnotaionsUtils";
import { deleteUserNote } from "./noteUtils";

interface Pdf {
  documentId: string;
  name?: string;
  size?: number;
  uploadTime?: string;
  base64?: string;
  isSynced: boolean;
}

interface Progress {
  completed: number;
  total: number;
}

export const fetchPdfs = async (
  setUnsyncedPdfs: (pdfs: Pdf[]) => void,
  setSyncedPdfs: (pdfs: Pdf[]) => void,
  setProgress: (progress: Progress) => void
) => {
  try {
    const allPdfs = await getAllPdfs();
    const unsynced = allPdfs.filter((pdf) => !pdf.isSynced);
    const synced = allPdfs.filter((pdf) => pdf.isSynced);

    setUnsyncedPdfs(unsynced);
    setSyncedPdfs(synced);
    setProgress({ completed: 0, total: unsynced.length });
  } catch (error) {
    console.error("Error fetching PDFs:", error);
  }
};

export const fetchCloudPdfs = async (
  userId: string,
  setCloudPdfs: (pdfs: string[]) => void
) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dev/getAllDocuments?userId=${userId}`);
    if (response.ok) {
      const cloudDocs = await response.json();
      setCloudPdfs(cloudDocs.documentIds);
    } else {
      console.error("Error fetching cloud PDFs:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching cloud PDFs:", error);
  }
};

export const syncPdfsToServer = async (
  userId: string,
  unsyncedPdfs: Pdf[],
  setProgress: (progress: Progress) => void,
  fetchPdfs: () => void
) => {
  let syncing = true;
  try {
    let completed = 0;

    for (const pdf of unsyncedPdfs) {
      const { documentId, base64 } = pdf;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dev/uploadpdf`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, documentId }),
        });

        if (!response.ok) {
          console.error(`Failed to get signed URL for documentId: ${documentId}`);
          continue;
        }

        const { uploadURL } = await response.json();
        const binary = atob(base64!.split(",")[1]);
        const arrayBuffer = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          arrayBuffer[i] = binary.charCodeAt(i);
        }

        const uploadResponse = await fetch(uploadURL, {
          method: "PUT",
          headers: { "Content-Type": "application/pdf" },
          body: arrayBuffer,
        });

        if (uploadResponse.ok) {
          await markPdfAsSynced(documentId);
          completed++;
          setProgress((prev) => ({ ...prev, completed }));
        } else {
          console.error(`Failed to upload PDF for documentId: ${documentId}`);
        }
      } catch (error) {
        console.error(`Error syncing documentId: ${documentId}`, error);
      }
    }

    fetchPdfs();
  } catch (error) {
    console.error("Error during sync operation:", error);
  } finally {
    syncing = false;
  }
};

export const deletePdfFromCloud = async (
  userId: string,
  documentId: string,
) => {
  try {

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dev/deletePDF?userId=${userId}&documentId=${documentId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      console.log(`PDF ${documentId} deleted from cloud.`);
    } else {
      console.error(`Failed to delete PDF ${documentId} from cloud.`);
    }
  } catch (error) {
    console.error(`Error deleting PDF ${documentId} from cloud:`, error);
  }
};

export const downloadPdfToLocal = async (
  userId: string,
  pdfId: string,
  fetchPdfs: () => void
) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dev/getpdf?userId=${userId}&documentId=${pdfId}`);
    if (!response.ok) {
      console.error(`Failed to get download URL for documentId: ${pdfId}`);
      return;
    }

    const { downloadURL } = await response.json();
    const downloadResponse = await fetch(downloadURL);
    if (!downloadResponse.ok) {
      console.error(`Failed to download PDF for documentId: ${pdfId}`);
      return;
    }

    const blob = await downloadResponse.blob();
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await addPdf({
        documentId: pdfId,
        name: `Document-${pdfId}`,
        size: blob.size,
        uploadTime: new Date().toLocaleString(),
        base64,
        isSynced: true,
      });
      fetchPdfs();
    };

    reader.readAsDataURL(blob);
  } catch (error) {
    console.error(`Error downloading PDF documentId: ${pdfId}`, error);
  }
};

export const deletePdfFromLocal = async (
  documentId: string,
  fetchPdfs: () => void
) => {
  try {
    await deletePdf(documentId);
    fetchPdfs();
    console.log(`PDF ${documentId} deleted from local storage.`);
  } catch (error) {
    console.error(`Error deleting PDF ${documentId} from local storage:`, error);
  }
};






