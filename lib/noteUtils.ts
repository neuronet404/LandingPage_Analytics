import { saveAppState, getAppState } from "@/db/note/canvas";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export const uploadAnnotations = async (currentDocumentId,userId) => {
  try {
    // Fetch local annotations
    const pageData = await getAppState(currentDocumentId, 1);
    if (!pageData) throw new Error("No annotations found in local storage");

    // Request upload URL
    const response = await fetch(`${API_URL}/dev/createUserNote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId, documentId: currentDocumentId }),
    });
    if (!response.ok) throw new Error("Failed to request upload URL");

    const data = await response.json();
    if (!data.uploadUrl) throw new Error("Upload URL missing in response");

    // Upload annotations
    const uploadResponse = await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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

    if (!uploadResponse.ok) throw new Error("Failed to upload annotations");
    return "Annotations uploaded successfully!";
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const downloadAnnotations = async (currentDocumentId,userId) => {
  try {
    // Request fetch URL
    const response = await fetch(
      `${API_URL}/dev/fetchUserNote?userId=${userId}&documentId=${currentDocumentId}`
    );
    const data = await response.json();
    if (!data.fetchUrl) throw new Error("Failed to retrieve fetch URL");

    // Fetch annotations
    const fetchResponse = await fetch(data.fetchUrl);
    if (!fetchResponse.ok) throw new Error("Failed to download annotations");

    const annotationsData = await fetchResponse.json();
    const { elements, appState, files } = annotationsData.annotations;

    // Save annotations locally
    const success = await saveAppState(currentDocumentId, elements, appState, files, 1);
    if (!success) throw new Error("Failed to save annotations locally");

    return "Annotations downloaded and saved successfully!";
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const deleteUserNote = async (currentDocumentId, userId) => {
  try {
    const response = await fetch(
      `${API_URL}/dev/deleteUserNote?userId=${userId}&documentId=${currentDocumentId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) throw new Error("Failed to delete the note");

    const result = await response.json();
    return result.message;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw new Error(error.message);
  }
};
