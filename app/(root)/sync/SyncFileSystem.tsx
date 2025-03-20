"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFileSystem, saveFileSystem } from "@/db/pdf/fileSystem";
import { useSettings } from "@/context/SettingsContext";

const SyncFileSystem = () => {
  const [fileSystem, setFileSystem] = useState([]);
  const [userId, setUserId] = useState("user1234");
  const [loading, setLoading] = useState(false);
  const {syncFileSystem,setsyncFileSystem} = useSettings()

  const handleUpload = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dev/createUserFilesystem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, contents: fileSystem }),
      });
      if (response.ok) {
        // alert("Filesystem uploaded successfully!");
      } else {
        console.error("Failed to upload filesystem");
        // alert("Failed to upload filesystem");
      }
    } catch (error) {
      console.error("Error uploading filesystem:", error);
      // alert("Error uploading filesystem");
    } finally {
      setLoading(false);
      setsyncFileSystem(false)
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dev/getFilesystem/${userId}`);
      if (response.ok) {
        const data = await response.json();
        console.log(data.contents)
        setFileSystem(data.contents || []);
        saveFileSystem(data.contents|| [])
        alert("Filesystem downloaded successfully!");
      } else {
        console.error("Failed to download filesystem");
        alert("Failed to download filesystem");
      }
    } catch (error) {
      console.error("Error downloading filesystem:", error);
      alert("Error downloading filesystem");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFileSystem = async () => {
      try {
        const localFileSystem = await getFileSystem();
        setFileSystem(localFileSystem || []);
      } catch (error) {
        console.error("Error fetching local filesystem:", error);
      }
    };

    
    fetchFileSystem();
  }, [userId]);




  return (
    // <div className="p-4 max-w-lg mx-auto">
    //   <Card>
    //     <CardHeader>
    //       <CardTitle>FileSystem Manager</CardTitle>
    //     </CardHeader>
    //     <CardContent>
    //       <div className="space-y-4">
    //         <div>
    //           <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
    //             User ID
    //           </label>
    //           <Input
    //             id="userId"
    //             value={userId}
    //             onChange={(e) => setUserId(e.target.value)}
    //             placeholder="Enter user ID"
    //           />
    //         </div>
    //         <div className="flex gap-4">
    //           <Button onClick={handleUpload} disabled={loading}>
    //             {loading ? "Uploading..." : "Upload Filesystem"}
    //           </Button>
    //           <Button onClick={handleDownload} disabled={loading}>
    //             {loading ? "Downloading..." : "Download Filesystem"}
    //           </Button>
    //         </div>
    //         <div>
    //           <h4 className="text-lg font-semibold">Current Filesystem:</h4>
    //           <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto">
    //             {JSON.stringify(fileSystem, null, 2)}
    //           </pre>
    //         </div>
    //       </div>
    //     </CardContent>
    //   </Card>
    // </div>
    null
  );
};

export default SyncFileSystem;
