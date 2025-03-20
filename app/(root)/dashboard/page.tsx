"use client"
import TodoList from "@/components/Todo";
import StudyDashboard from "../components/StudyDashboard";
import SubjectFolders from "../components/SubjectFolders";
import TrackerDashboard from "../components/Tracker";
import React from "react";
import { downloadAnnotations, uploadAnnotations } from "@/lib/pdfAnnotaionsUtils";
import { Button } from "@/components/ui/button";
import DashboardWatcher from "@/components/DashboardWatcher";


const Page = () => {
  return (
    <div className="font-rubik w-full flex">
      {/* Main content area - scrollable with hidden scrollbar */}
      <div className="flex-1 h-full overflow-y-auto">
        <div className="space-y-12">
          <DashboardWatcher />
          <TrackerDashboard />
          <SubjectFolders />
          <StudyDashboard />
        </div>
      </div>
      {/* <SyncPdfs/> */}
      {/* <Button variant={"ghost"} onClick={()=>{uploadAnnotations(user?.id,"1643dcbf-7ed5-41ce-be5a-dda11197d535")}}>Upload</Button>
      <Button onClick={()=>{downloadAnnotations(user?.id,"1643dcbf-7ed5-41ce-be5a-dda11197d535")}}>Download</Button> */}
    </div>
  );
};

export default Page;
