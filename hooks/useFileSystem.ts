import { useEffect, useState } from "react";
import { getFileSystem, saveFileSystem } from "@/db/pdf/fileSystem";

const useFileSystem = (userId) => {
  const [fileSystem, setFileSystem] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    const downloadFileSystem = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dev/getUserFilesystem/${userId}`
        );
        if (!response.ok) throw new Error("Failed to download filesystem");
        const data = await response.json();
        setFileSystem(data.contents || null);
        saveFileSystem(data.contents || []);
      } catch (error) {
        console.error("Error downloading filesystem:", error);
        try {
          const localFileSystem = await getFileSystem();
          setFileSystem(localFileSystem || null);
        } catch (localError) {
          console.error("Error fetching local filesystem:", localError);
          setFileSystem(null);
        }
      } finally {
        setLoading(false);
      }
    };

    downloadFileSystem();
  }, [userId]);

  const uploadFileSystem = async (fileSystem) => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dev/createUserFilesystem`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, contents: fileSystem }),
        }
      );
      if (!response.ok) throw new Error("Failed to upload filesystem");
    } catch (error) {
      console.error("Error uploading filesystem:", error);
    } finally {
      setLoading(false);
    }
  };

  return { fileSystem, setFileSystem, loading, uploadFileSystem };
};

export default useFileSystem;
