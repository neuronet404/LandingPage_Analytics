"use client";
import React from "react";
import FileUpload from "@/components/pdf/file-upload";
import { ContinueReading } from "../../components/StudyDashboard";
import SubjectsFiles from "@/components/pdf/SubjectFiles";
import FileGridSystem from "@/components/pdf/File";

const Page = () => {
  return (
    <div className="w-full">
      {/* Main content wrapper with TodoList sidebar */}
      <div className="flex flex-col lg:flex-row">
        {/* Left and center content */}
        <div className="flex-1">
          <div className="mb-20">
            <FileUpload />
          </div>

          {/* Responsive grid for SubjectsFiles and ContinueReading */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-16">
            <div className="w-full h-full">
              {/* <SubjectsFiles fileType="pdf" /> */}
              <FileGridSystem fileType="pdf" />
            </div>
            <div className="w-full h-full">
              <ContinueReading />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
