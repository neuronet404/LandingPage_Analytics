import TodoList from "@/components/Todo";
import StudyDashboard from "./components/StudyDashboard";
import SubjectFolders from "./components/SubjectFolders";
import TrackerDashboard from "./components/Tracker";
import React from "react";
import DashboardWatcher from "@/components/DashboardWatcher";

const Page = () => {
  return (
    <div className="font-rubik h-screen w-full flex ">
      {/* Main content area - scrollable with hidden scrollbar */}
      
      <div className="flex-1 h-full overflow-y-auto no-scrollbar">
        <div className="p-4 space-y-12">
        
          <TrackerDashboard />
          <SubjectFolders />
          <StudyDashboard />

        </div>
      </div>
    </div>
  );
};

export default Page;
