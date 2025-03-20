"use client";
import { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import { getPdfById } from "@/db/pdf/pdfFiles";
import { markPdfAsSynced, markPdfAsTrained } from "@/db/pdf/fileSystem";
import { getFileSystem } from "@/db/pdf/fileSystem";
import useUserId from "@/hooks/useUserId";
import { X } from "lucide-react";

// UI Component
export const TrainAiNotificationUI = ({ 
  onClose, 
  onConfirm, 
  isTrained, 
  loading 
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="flex max-w-md w-full">
        <div className="flex-shrink-0 self-start mt-2 mr-0 z-10 bg-white rounded-full p-4">
          <div className="rounded-full bg-purple-700 flex items-center justify-center overflow-hidden">
            <object
              data="/person.svg"
              type="image/svg+xml"
              style={{ pointerEvents: "none", width: "150px", height: "150px" }}
            />
          </div>
        </div>

        <div className="flex-1 -ml-8">
          <div className="bg-[#E8E1F9] px-8 py-4 rounded-3xl relative h-[188px] w-[465px]">
            <button
              onClick={onClose}
              className="absolute top-4 right-6 text-gray-500 hover:text-gray-700 border-[#d1c7e7] border-2 rounded-full p-1"
            >
              <X size={15} />
            </button>

            <div className="ml-5">
              <h3 className="text-lg font-medium text-purple-800 mb-3">
                Train AI with Your PDF
              </h3>

              <div className="border-t border-[#553C9A] my-2"></div>

              <div className="flex justify-between items-center">
                <p className="text-gray-700 text-base font-medium">
                  Do you want to train AI with this document? This will improve
                  AI's response accuracy.
                </p>

                <div className="bg-white p-2 absolute bottom-0 right-0 rounded-full">
                  <button
                    className="bg-[#553C9A] text-white p-2 rounded-full font-medium hover:bg-purple-800 transition-colors"
                    onClick={onConfirm}
                    disabled={loading}
                  >
                    {isTrained ? "ReTrain" : "Train"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Functional Container Component
export const TrainAiNotification = ({ openTrainModal, setopenTrainModal }) => {
  const { currentDocumentId, setisTrainingProgress, setisUploadProgress,isTrainingProgress } = useSettings();
  const [loading, setLoading] = useState(false);
  const [isTrained, setIsTrained] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const userId = useUserId();

  useEffect(() => {
    const isPdfTrained = async () => {
      try {
        const fileSystem = await getFileSystem();
    
        const findFile = (items) => {
          for (const item of items) {
            if (item.id === currentDocumentId) {
              setIsTrained(item.isTrained === true);
              return item.isTrained === true;
            }
            if (item.children) {
              const found = findFile(item.children);
              if (found !== null) return found;
            }
          }
          setopenTrainModal(false);
          return false;
        };
    
        return findFile(fileSystem);
      } catch (error) {
        console.error('Failed to check if PDF is trained:', error);
        return false;
      }
    };
    
    isPdfTrained();
  }, [currentDocumentId, setopenTrainModal,isTrained,isTrainingProgress]);

  useEffect(() => {
    // Close modal when training completes
    if (isTrained) {
      setopenTrainModal(false);
    }
  }, [isTrained, setopenTrainModal]);

  const handleClose = () => {
    setopenTrainModal(false);
    console.log("clicked on the close");
  };

  const processDocument = async (bucketName, userId, key) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_INGESTION_URL}/process-document`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bucket_name: bucketName,
            user_id: userId,
            key: `${key}.pdf`,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`Error: ${res.status} - ${res.statusText}`);
      }
      // await markPdfAsTrained(key)

      return await res.json();
    } catch (error) {
      console.error("Error processing document:", error);
      return null;
    }
    finally {
      // Trigger document processing
      // setisTrainingProgress(false);
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleConfirm = async () => {
    console.log(syncing, currentDocumentId);
    if (syncing || !currentDocumentId) {
      console.log("Provide a valid Document ID.");
      return;
    }

    setSyncing(true);
    setisUploadProgress(true);
    // Trigger document processing
    setisTrainingProgress(true);
    
    try {
      const pdf = await getPdfById(currentDocumentId);
      if (!pdf) {
        setSyncing(false);
        return;
      }

      const { base64, documentId, isSynced } = pdf;

      if (isSynced) {
        console.log("PDF already synced. Proceeding to processing...");
      } else {
        // Get upload URL
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dev/uploadpdf`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, documentId }),
          }
        );

        if (!response.ok) {
          setSyncing(false);
          return;
        }

        const { uploadURL } = await response.json();

        // Convert base64 to binary
        const binary = atob(base64.split(",")[1]);
        const arrayBuffer = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          arrayBuffer[i] = binary.charCodeAt(i);
        }

        // Upload PDF
        const uploadResponse = await fetch(uploadURL, {
          method: "PUT",
          headers: { "Content-Type": "application/pdf" },
          body: arrayBuffer,
        });

        if (!uploadResponse.ok) {
          console.error("PDF upload failed.");
          setSyncing(false);
          return;
        }

        // Mark PDF as synced
        await markPdfAsSynced(currentDocumentId);
        console.log("PDF uploaded and marked as synced.");

        // 4-second delay before processing
        console.log("Waiting 4 seconds before processing...");
        await delay(4000);
      }

      console.log("Processing document...");
      const processResponse = await processDocument(
        "pdf-storage-bucket-myacolyte",
        userId,
        documentId
      );

      if (processResponse) {
        setIsTrained(true);
      }
    } catch (error) {
      console.error("Error in syncPdf:", error);
    } finally {
      setSyncing(false);
      setopenTrainModal(false);
    }
  };

  // If the modal should be closed, return null
  if (!openTrainModal) return null;

  // Render the UI component with the necessary props
  return (
    <TrainAiNotificationUI
      onClose={handleClose}
      onConfirm={handleConfirm}
      isTrained={isTrained}
      loading={loading}
    />
  );
};

