"use client";

import { useSettings } from "@/context/SettingsContext";
import { markPdfAsTrained } from "@/db/pdf/fileSystem";
import useUserId from "@/hooks/useUserId";
import { useEffect, useState } from "react";

export default function CheckIndices() {
    const userId = useUserId();
 

    const { isTrainingProgress, setisTrainingProgress, pages, currentDocumentId } = useSettings();

    // Estimated time before starting checks (3 min per 100 pages)
    const estimatedTime = Math.ceil((pages / 100) * 180000); // 3 minutes per 100 pages
    const pollingInterval = 5000; // Check every 5 seconds after estimated time is reached

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));// Function to check indices
    const checkIndices = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dev/checkIndices`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    path: `${userId}/indices/${currentDocumentId}/`,
                }),
            });

            const data = await response.json();

            if (data.exists) {
                
                await markPdfAsTrained(currentDocumentId);
                await delay(4000)
                setisTrainingProgress(false);
            }else{
                // setisTrainingProgress(true);
            }
        } catch (error) {
            console.error("Error checking indices:", error);
        }
    };

    // Run once on component mount (for refresh scenario)
    useEffect(() => {
        if(!userId || !currentDocumentId) return
        checkIndices(); // Run check on refresh
    }, [currentDocumentId,userId]);

    useEffect(() => {
        if (!isTrainingProgress) return;

        let isMounted = true;

        const startChecking = setTimeout(() => {
            const pollIndices = async () => {
                if (!isMounted) return;
                await checkIndices();
                setTimeout(pollIndices, pollingInterval);
            };

            pollIndices();
        }, estimatedTime);

        return () => {
            isMounted = false;
            clearTimeout(startChecking);
        };
    }, [isTrainingProgress, pages, setisTrainingProgress]);

    return null; // Component doesn't render anything
}
