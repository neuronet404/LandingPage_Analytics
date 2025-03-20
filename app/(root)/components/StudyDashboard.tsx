import React from 'react';
import { Clock, Layers, Book, ChevronRight, FileText, CheckCircle, Clock3 } from 'lucide-react';

// Simplified data
const units = [
  { 
    id: 5, 
    title: "Medical Apparatus",
    lastAccessed: "2 days ago", 
    completedModules: 3,
    totalModules: 14,
    progress: 25, 
    color: "#F97316"
  },
  { 
    id: 1, 
    title: "Anatomy Fundamentals",
    lastAccessed: "Yesterday", 
    completedModules: 12,
    totalModules: 20,
    progress: 60, 
    color: "#EF4444"
  },
  { 
    id: 2, 
    title: "Patient Assessment",
    lastAccessed: "4 days ago", 
    completedModules: 7,
    totalModules: 16,
    progress: 45, 
    color: "#3B82F6"
  }
];

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
    title: "Pharmacology Guide", 
    date: "Mar 10, 2025", 
    type: "PDF", 
    size: "12.5 MB",
    status: "completed" 
  }
];

// Keep original component name
const StudyDashboard = () => {
  return (
    <div className="h-auto min-h-screen overflow-auto ">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Collaborative Study Section */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-lg sm:text-xl font-semibold text-emerald-700 mb-3">
            Collaborative Study
          </h2>
          <div className="h-[400px] sm:h-[450px]">
            <DocumentList />
          </div>
        </div>
        <div className="w-full lg:w-1/2">
          <ContinueReading />
        </div>
      </div>
    </div>
  );
};

// Keep original component name 
export const ContinueReading = () => {
  return (
    <div className="w-full h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-emerald-700 flex items-center gap-2">
          <Book size={20} />
          Continue Reading
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-500">Sort by:</span>
          <select className="bg-white dark:bg-gray-700 border rounded-md text-xs sm:text-sm p-1 px-2">
            <option>Last Accessed</option>
            <option>Progress</option>
          </select>
        </div>
      </div>
      <ProgressList />
    </div>
  );
};

const ProgressList = () => {
  return (
    <div className="bg-white dark:bg-[#444444] rounded-2xl w-full h-[400px] sm:h-[450px] shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col p-3 sm:p-4">
      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-1">
          {units.map((unit) => (
            <div key={unit.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group">
              <div className="p-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="flex items-center justify-center h-6 w-6 rounded-full text-white text-xs font-medium" 
                        style={{ backgroundColor: unit.color }}
                      >
                        {unit.id}
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                        Unit {unit.id} - {unit.title}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-3 sm:gap-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{unit.lastAccessed}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Layers size={14} />
                        <span>{unit.completedModules} of {unit.totalModules} modules</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-32 mt-2 sm:mt-0">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium">{unit.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${unit.progress}%`, 
                            backgroundColor: unit.color 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Fixed footer */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing {units.length} of 12 units
          </span>
          <button className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-white bg-emerald-600 hover:bg-emerald-700 text-xs">
            View All
            <ChevronRight size={14} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const DocumentList = () => {
  // File type icons mapping
  const getFileIcon = (type) => {
    const iconSize = 16;
    
    switch(type) {
      case 'PDF':
        return (
          <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-1.5 flex items-center justify-center">
            <FileText size={iconSize} className="text-red-600 dark:text-red-400" />
          </div>
        );
      case 'DOCX':
        return (
          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-1.5 flex items-center justify-center">
            <FileText size={iconSize} className="text-blue-600 dark:text-blue-400" />
          </div>
        );
      default:
        return (
          <div className="rounded-lg bg-gray-100 dark:bg-gray-700 p-1.5 flex items-center justify-center">
            <FileText size={iconSize} className="text-gray-600 dark:text-gray-400" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#444444] rounded-2xl w-full h-full shadow-lg overflow-hidden">
      <div className="p-3 sm:p-4 border-b">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <Book size={18} className="text-indigo-500" />
          Recent Documents
        </h2>
      </div>
      
      <div className="overflow-y-auto max-h-[300px] sm:max-h-[350px]">
        <ul className="divide-y">
          {documents.map((doc, index) => (
            <li key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center px-3 py-3">
                <div className="mr-3">
                  {getFileIcon(doc.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{doc.title}</p>
                    <div className="mt-1 sm:mt-0 sm:ml-2 flex-shrink-0">
                      {doc.status === 'completed' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle size={12} className="mr-1" />
                          Done
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          <Clock3 size={12} className="mr-1" />
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
                <div className="ml-2">
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing {documents.length} documents
          </span>
          <button className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            View All
            <ChevronRight size={14} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyDashboard;