import React, { useEffect } from "react";
import { getPdfById } from "@/db/pdf/pdfFiles";

const PdfSync = ({ id }) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPdfById(id);
        console.log("Fetched data:", data);
      } catch (error) {
        console.error("Error fetching PDF:", error);
      }
    };

    // Call fetchData once
    fetchData();

    // Set up the interval to log to the console every 10 seconds
    const interval = setInterval(() => {
      console.log("This message is logged every 10 seconds.");
    }, 10000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, [id]); // Dependency array ensures this runs only when id changes

  return null;
};

export default PdfSync;
