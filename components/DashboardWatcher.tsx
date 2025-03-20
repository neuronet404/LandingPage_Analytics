"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import useUserId from "@/hooks/useUserId";
import { useSettings } from "@/context/SettingsContext";

async function deleteFolder(bucketName, userId, key) {
    const url = `${process.env.NEXT_PUBLIC_GENERATION_URL}/delete-folder`;
    
    const payload = {
        bucket_name: bucketName,
        user_id: userId,
        key: key
    };
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error deleting folder:", error);
        return null;
    }
}

export default function DashboardWatcher() {
    const pathname = usePathname();
    const userid = useUserId()
    const {currentDocumentId} = useSettings()
    
    useEffect(() => {
        if (pathname.startsWith("/dashboard") && userid && currentDocumentId ) {
            deleteFolder("pdf-storage-bucket-myacolyte", userid, currentDocumentId)
                .then(response => console.log("Folder deletion response:", response))
                .catch(error => console.error(error));
        }
        console.log( userid,currentDocumentId)
    }, [pathname,userid,currentDocumentId]);
    
    return null;
}