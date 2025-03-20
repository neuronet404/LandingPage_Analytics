import React from "react";
import { FileText } from "lucide-react";

import { Progress } from "@/components/ui/progress";

const StudyDashboard = () => {
  return (
    // This container takes full viewport height and allows scrolling internally.
    <div className="h-auto overflow-auto">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 ">
        {/* Collaborative Study Section */}
        <div className="w-full h-full">
          <h2 className="text-xl sm:text-2xl font-semibold text-emerald-700 pb-2 sm:pb-4 mb-4">
            Collaborative Study
          </h2>
          <div className="relative h-[500px]">
            {/* Translucent Overlay */}
            {/* <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-3xl md:text-4xl font-bold text-white tracking-wider">
                  COMING SOON
                </h3>
                <p className="mt-1 text-gray-200 text-lg">
                  Stay tuned for exciting updates!
                </p>
              </div>
            </div> */}
            <DocumentList />
          </div>
        </div>
        <ContinueReading />
      </div>
    </div>
  );
};
export const ContinueReading = () => {
  return (
    <div className="w-full h-full relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-emerald-700 dark:text-emerald-500 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Continue Reading
        </h2>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
          <select className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-600 dark:text-gray-300 py-1 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600">
            <option>Last Accessed</option>
            <option>Progress</option>
            <option>Unit Number</option>
          </select>
        </div>
      </div>
      <ProgressList />
    </div>
  );
};

const ProgressList = () => {
  const units = [
    { 
      id: 5, 
      title: "Medical Apparatus & Equipment",
      description: "Learning about common medical devices used in clinical settings",
      lastAccessed: "2 days ago", 
      totalModules: 14,
      completedModules: 3,
      progress: 25, 
      color: "#F97316" // orange-500
    },
    { 
      id: 1, 
      title: "Anatomy Fundamentals",
      description: "Understanding human body systems and structures",
      lastAccessed: "Yesterday", 
      totalModules: 20,
      completedModules: 12,
      progress: 60, 
      color: "#EF4444" // red-500
    },
    { 
      id: 2, 
      title: "Patient Assessment Techniques",
      description: "Methods for evaluating patient conditions and symptoms",
      lastAccessed: "4 days ago", 
      totalModules: 16,
      completedModules: 7,
      progress: 45, 
      color: "#3B82F6" // blue-500
    },
    { 
      id: 6, 
      title: "Pharmacology Basics",
      description: "Introduction to drug classifications and mechanisms",
      lastAccessed: "1 week ago", 
      totalModules: 18,
      completedModules: 2,
      progress: 15, 
      color: "#8B5CF6" // purple-500
    },
  ];

  return (
    <div className="bg-white dark:bg-[#444444] rounded-2xl w-full h-[500px] shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
      {/* Main content area with fixed height and hidden scrollbar using Tailwind utilities */}
      <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-1">
        <div className="space-y-1">
          {units.map((unit) => (
            <div key={unit.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group">
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="flex items-center justify-center h-8 w-8 rounded-full text-white text-sm font-medium" 
                        style={{ backgroundColor: unit.color }}
                      >
                        {unit.id}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          Unit {unit.id} - {unit.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {unit.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Last accessed {unit.lastAccessed}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>{unit.completedModules} of {unit.totalModules} modules completed</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full sm:w-52">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{unit.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${unit.progress}%`, 
                            backgroundColor: unit.color 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* <button 
                      className="hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      aria-label="Continue reading"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button> */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Fixed footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {units.length} of 12 units
          </span>
          <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors text-sm">
            View All Courses
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 -mr-0.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const PlusIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

const DocumentRow = ({ number, more }) => {
  const getCircleColor = (num) => {
    const colors = {
      1: "bg-green-100 text-green-600",
      3: "bg-green-100 text-green-600",
      4: "bg-green-100 text-green-600",
    };
    return colors[num] || "bg-green-100 text-green-600";
  };

  return (
    <div className="py-2 sm:py-4 px-2 sm:px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-indigo-600 font-semibold text-sm">
              Guyton and hall
            </span>
            <span className="text-gray-500 text-sm">- physiology</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
          <PlusIcon className="w-3 h-3 text-gray-500" />
        </button>

        <div className="flex items-center">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white bg-gray-200"
              />
            ))}
          </div>
          <span className="ml-2 text-gray-500 text-xs sm:text-sm">+2 more</span>
        </div>

        <div
          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${getCircleColor(
            number
          )} flex items-center justify-center text-xs sm:text-sm font-medium`}
        >
          {number}
        </div>
      </div>
    </div>
  );
};

export const DocumentList = () => {
  const documents = [
    { 
      title: "Clinical Pathology Report", 
      date: "Mar 18, 2025", 
      type: "PDF", 
      size: "4.2 MB",
      status: "completed" 
    },
    { 
      title: "Cardiology Study Notes", 
      date: "Mar 15, 2025", 
      type: "DOCX", 
      size: "1.8 MB",
      status: "pending" 
    },
    { 
      title: "Pharmacology Reference Guide", 
      date: "Mar 10, 2025", 
      type: "PDF", 
      size: "12.5 MB",
      status: "completed" 
    },
    { 
      title: "Neuroanatomy Lecture Slides", 
      date: "Mar 5, 2025", 
      type: "PPT", 
      size: "8.3 MB",
      status: "completed" 
    },
  ];

  // File type icons
  const getFileIcon = (type) => {
    switch(type) {
      case 'PDF':
        return (
          <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'DOCX':
        return (
          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'PPT':
        return (
          <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600 dark:text-orange-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4a.5.5 0 01-.5-.5v-9A.5.5 0 014 5h12a.5.5 0 01.5.5v9a.5.5 0 01-.5.5z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="rounded-lg bg-gray-100 dark:bg-gray-700 p-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#444444] rounded-2xl w-full h-full shadow-lg overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          Recent Documents
        </h2>
      </div>
      
      <div className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {documents.map((doc, index) => (
            <li key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
              <div className="flex items-center px-4 sm:px-6 py-4">
                <div className="mr-4">
                  {getFileIcon(doc.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{doc.title}</p>
                    <div className="ml-2 flex-shrink-0">
                      {doc.status === 'completed' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{doc.date}</span>
                    <span className="mx-1">•</span>
                    <span>{doc.type}</span>
                    <span className="mx-1">•</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {documents.length} of 12 documents
          </span>
          <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            View All Documents
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 -mr-0.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};


export default StudyDashboard;
