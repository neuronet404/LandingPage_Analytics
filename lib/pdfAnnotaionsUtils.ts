
import { getAllPages, saveAllPages } from "@/db/pdf/pdfAnnotations";

export const uploadAnnotations = async (userId: string, documentId: string): Promise<string> => {
 try {
 
       // Fetch all pages
       const pages = await getAllPages(documentId);
       if (!pages || pages.length === 0) {
         throw new Error("No annotations found in local storage");
       }
 
 
       // Request pre-signed URL
       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dev/createPdfAnnotation`, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({
           userId: userId, // Replace with dynamic userId if needed
           documentId: documentId,
         }),
       });
 
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
 
 
       // Upload annotations
       const uploadResponse = await fetch(data.uploadUrl, {
         method: "PUT",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({
           annotations: pages,
           updated_at: new Date().toISOString(),
         }),
       });
 
       if (!uploadResponse.ok) {
         const errorText = await uploadResponse.text();
         throw new Error(
           `Failed to upload annotations: ${uploadResponse.status} ${errorText}`
         );
       }
 
     } catch (error) {
       console.error("Upload error:", error.stack || error);
     }
};

export const downloadAnnotations = async (userId: string, documentId: string): Promise<string> => {
  try {
    if (!userId || !documentId) throw new Error("Missing userId or documentId");

    // Request pre-signed URL for downloading
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dev/fetchPdfAnnotation?userId=${userId}&documentId=${documentId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pre-signed URL: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data?.fetchUrl) throw new Error("Failed to retrieve fetch URL");

    // Fetch annotations from S3
    const fetchResponse = await fetch(data.fetchUrl);
    if (!fetchResponse.ok) throw new Error("Failed to download annotations");

    const annotationsData = await fetchResponse.json();
    console.log(annotationsData)

    // Save annotations to local storage
    const { elements, appState, files } = annotationsData.annotations;
    const success = await saveAllPages(documentId, annotationsData.annotations);
    
    if (!success) throw new Error("Failed to save annotations to local storage");

    return "Annotations downloaded and saved successfully!";
  } catch (error: any) {
    console.error("Download error:", error);
    throw new Error(error.message || "Unknown error occurred");
  }
};


export const deleteAnnotations = async (userId: string, documentId: string): Promise<string> => {
  try {
    if (!userId || !documentId) throw new Error("Missing userId or documentId");

    // Request deletion of annotations
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/dev/deletePdfAnnotation?userId=${userId}&documentId=${documentId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete annotations: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data.message);

    return "Annotations deleted successfully!";
  } catch (error: any) {
    console.error("Delete error:", error);
    throw new Error(error.message || "Unknown error occurred");
  }
};
