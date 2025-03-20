import { useSettings } from "@/context/SettingsContext";
import { saveAppState, getAppState } from "@/db/note/canvas";
import { useEffect, useState } from "react";

export default function SyncNote({currentDocumentId}) {
  const [status, setStatus] = useState("");
  const { SyncPdfAnnotations } = useSettings();
  // Function to handle uploading annotations to the cloud
  const handleUpload = async () => {
    try {
      setStatus("Fetching annotations from local storage...");

      // Fetch the first page (assumes page index starts at 1)
      const pageData = await getAppState(currentDocumentId, 1);
      console.log(pageData);
      if (!pageData) {
        throw new Error("No annotations found in local storage");
      }

      setStatus("Requesting upload URL...");

      // Request pre-signed URL
      const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/dev/createUserNote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "12345", // Replace with dynamic userId if needed
            documentId: currentDocumentId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to request upload URL: ${response.statusText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("Failed to parse upload URL response");
      }

      if (!data.uploadUrl) {
        throw new Error("Upload URL is missing in the server response");
      }

      setStatus("Uploading annotations to the cloud...");

      // Upload annotations
      const uploadResponse = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          annotations: {
            elements: pageData.elements,
            appState: pageData.appState,
            files: pageData.files,
            lastModified: pageData.lastModified,
          },
          updated_at: new Date().toISOString(),
        }),
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(
          `Failed to upload annotations: ${uploadResponse.status} ${errorText}`
        );
      }

      setStatus("Annotations uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error.stack || error);
      setStatus(`Error: ${error.message}`);
    }
  };

  // Function to handle downloading annotations from the cloud
  const handleDownload = async () => {
    try {
      setStatus("Requesting fetch URL...");

      // Request pre-signed URL for fetching
      const response = await fetch(
        `http://localhost:3000/dev/fetchNote?userId=12345&documentId=${currentDocumentId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!data.fetchUrl) {
        throw new Error("Failed to retrieve fetch URL");
      }

      setStatus("Downloading annotations from the cloud...");

      // Fetch annotations from S3 using the pre-signed URL
      const fetchResponse = await fetch(data.fetchUrl);
      if (!fetchResponse.ok) {
        throw new Error("Failed to download annotations");
      }

      const annotationsData = await fetchResponse.json();

      setStatus("Saving annotations to local storage...");

      // Save the downloaded annotations back to local storage
      const { annotations } = annotationsData;
      const { elements, appState, files } = annotations;
      console.log(elements, annotations);
      const success = await saveAppState(
        currentDocumentId,
        elements,
        appState,
        files,
        1 // Assuming page index is 1 for simplicity
      );

      if (!success) {
        throw new Error("Failed to save annotations to local storage");
      }

      setStatus(
        "Annotations downloaded and saved to local storage successfully!"
      );
    } catch (error) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };


  return null;
}
