"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

const deleteFolder = async () => {
  try {
    const response = await fetch("https://generation.acolytee.in/delete-folder", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucket_name: "pdf-storage-bucket-myacolyte",
        user_id: "222",
        key: "111",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete folder");
    }
    console.log("Folder deleted successfully");
  } catch (error) {
    console.error("Error:", error);
  }
};


const WorkspaceGuard = () => {
    const router = useRouter();
    const prevPath = useRef(router.asPath);
  
    useEffect(() => {
      const handleRouteChange = (url) => {
        if (prevPath.current !== url) {
          console.log(`Path changed: ${prevPath.current} -> ${url}`);
          prevPath.current = url;
        }
      };
  
      router.events.on("routeChangeComplete", handleRouteChange);
      return () => {
        router.events.off("routeChangeComplete", handleRouteChange);
      };
    }, [router]);
  
    return null;
  };

export default WorkspaceGuard;
