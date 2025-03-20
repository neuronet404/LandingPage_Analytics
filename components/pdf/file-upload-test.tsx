// FileList.jsx
import { useState, useCallback, useEffect, useRef } from "react";
import { MoreVertical, AlertCircle } from "lucide-react";
import { Upload } from "lucide-react";
import { addPdf, getAllPdfs } from "@/db/pdf/pdfFiles";
import FileSystem from "@/app/(root)/components/FileSystem";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import pdfUpload from "@/public/pdf-upload.svg";
import Image from "next/image";

const FileList = ({ files }) => {
  return (
    <div className="w-full h-[300px] py-2 md:px-8 overflow-y-auto mb-6 no-scrollbar">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center justify-between px-4 py-3 hover:backdrop-brightness-95"
        >
          <div className="flex items-center gap-3">
            <div className="text-blue-500">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs brightness-75">{file.uploadTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {file.status === "error" ? (
              <div className="flex items-center text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span className="font-medium">Error</span>
              </div>
            ) : (
              <span className="text-sm brightness-75 font-medium">
                {file.size}
              </span>
            )}
            <button className="p-1 hover:bg-gray-200 rounded-full">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// FileUpload.jsx

const FileUpload = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [files, setFiles] = useState<any>(null);
  const [currentPath, setCurrentPath] = useState("");
  const [documentId, setDocumentId] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [file, setfile] = useState();

  const router = useRouter();

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = async (newFiles) => {
    const id = uuidv4();
    const filesWithProgress = newFiles.map((file) => ({
      id: id,
      name: file.name,
      size: formatFileSize(file.size),
      progress: 0,
      status: "uploading",
      uploadTime: "Just now",
      file, // Include the actual file object
    }));

    setDocumentId(id);
    setfile(filesWithProgress[0]);
    setFileName(newFiles[0].name);

    setUploadingFiles((prev) => [...prev, ...filesWithProgress]);

    // for (const file of filesWithProgress) {
    //   await uploadFile(file);
    // }
  };

  const saveFile = async () => {
    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        // Convert file to base64
        const base64 = event.target.result;

        // Store file in IndexedDB
        await addPdf({
          documentId: file.id,
          name: file.name,
          size: file.size,
          uploadTime: new Date().toLocaleString(),
          base64, // Save the base64-encoded content
          status: "complete",
        });

        // Upload file to the external backend
        // const response = await fetch("http://localhost:5000/upload", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     documentId: file.id,
        //     name: file.name,
        //     size: file.size,
        //     base64, // Send the base64-encoded content
        //   }),
        // });

        // if (!response.ok) {
        //   throw new Error("Failed to upload file to backend");
        // }

        // const result = await response.json();
        // console.log("File uploaded successfully:", result);

        router.push(`/workspace//pdfnote/${file.id}`);

        // Update state to reflect completion
        setUploadingFiles((prev) => prev.filter((f) => f.id !== file.id));
        setFiles((prev) => [
          {
            id: file.id,
            name: file.name,
            size: file.size,
            uploadTime: new Date().toLocaleString(),
            status: "complete",
          },
          ...prev,
        ]);
      } catch (error) {
        console.error("Error uploading file:", error);
        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "error" } : f))
        );
      }
    };

    reader.onerror = () => {
      console.error("Error reading file:", reader.error);
      setUploadingFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: "error" } : f))
      );
    };

    reader.readAsDataURL(file.file);
  };

  // const uploadFile = async (file) => {
  //   const reader = new FileReader();

  //   reader.onload = async (event) => {
  //     try {
  //       // Convert file to base64
  //       const base64 = event.target.result;

  //       // Store file in IndexedDB
  //       await addPdf({
  //         documentId: file.id,
  //         name: file.name,
  //         size: file.size,
  //         uploadTime: new Date().toLocaleString(),
  //         base64, // Save the base64-encoded content
  //         status: "complete",
  //       });

  //       // Update state to reflect completion
  //       setUploadingFiles((prev) => prev.filter((f) => f.id !== file.id));
  //       setFiles((prev) => [
  //         {
  //           id: file.id,
  //           name: file.name,
  //           size: file.size,
  //           uploadTime: new Date().toLocaleString(),
  //           status: "complete",
  //         },
  //         ...prev,
  //       ]);
  //     } catch (error) {
  //       console.error("Error uploading file:", error);
  //       setUploadingFiles((prev) =>
  //         prev.map((f) => (f.id === file.id ? { ...f, status: "error" } : f))
  //       );
  //     }
  //   };

  //   reader.onerror = () => {
  //     console.error("Error reading file:", reader.error);
  //     setUploadingFiles((prev) =>
  //       prev.map((f) => (f.id === file.id ? { ...f, status: "error" } : f))
  //     );
  //   };

  //   reader.readAsDataURL(file.file);
  // };

  // Utility function for formatting file size
  const formatFileSize = (size) => {
    return size < 1024
      ? size + " bytes"
      : size < 1048576
      ? (size / 1024).toFixed(2) + " KB"
      : (size / 1048576).toFixed(2) + " MB";
  };

  // Example function to fetch all files from IndexedDB
  const fetchFilesFromIndexedDB = async () => {
    const pdfs = await getAllPdfs();
    setFiles(pdfs);
  };

  useEffect(() => {
    fetchFilesFromIndexedDB();
  }, []);

  const clearUploads = () => {
    setUploadingFiles([]);
  };

  return (
    <div className="w-full">
      <div className="w-full h-full  rounded-xl flex flex-col items-center justify-center ">
        {activeTab === "upload" && (
          <div className="w-full">
            <input
              type="file"
              id="fileInput"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
            <label
              htmlFor="fileInput"
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full h-full   flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-300"
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <Image src={pdfUpload} alt="pdficon" />
                <span>
                  Drag & drop files or{" "}
                  <span className="text-sky-500 underline font-semibold">
                    Browse
                  </span>
                </span>
              </div>
            </label>

            {/* Uploading Files Progress */}
            {uploadingFiles.length > 0 && (
              <div className="mt-6 space-y-4">
                {uploadingFiles.map((file) => (
                  <div key={file.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-blue-500">
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">{file.size}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {Math.round(file.progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {uploadingFiles.length > 0 && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-[#908e8ea0]  backdrop-blur-sm flex justify-center items-center"
          style={{ zIndex: 100 }}
        >
          <div className="w-full max-w-4xl  flex justify-center items-center rounded-xl p-4 bg-[#ecf1f0] dark:bg-[#444444] border-2">
            <FileSystem
              currentPath={currentPath}
              setCurrentPath={setCurrentPath}
              fileType="pdf"
              file={{
                documentId,
                fileName,
              }}
              saveFile={saveFile}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

