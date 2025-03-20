"use client";
import React, { useState } from "react";
import { MultiStepLoader as Loader } from "../ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";

const loadingStates = [
  {
    text: "Analyzing the document",
  },
  {
    text: "Extracting key information",
  },
  {
    text: "Parsing document structure",
  },
  {
    text: "Indexing document contents",
  },
  {
    text: "Processing extracted data",
  },
  {
    text: "Validating document integrity",
  },
  {
    text: "Enhancing document readability",
  },
  {
    text: "Finalizing document processing",
  },
];

export function MultiStepLoader() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      {/* Core Loader Modal */}
      <Loader loadingStates={loadingStates} loading={loading} duration={2000} />
    </div>
  );
}
