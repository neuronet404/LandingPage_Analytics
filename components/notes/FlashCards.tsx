import React from "react";
import { Search, Plus, MoreHorizontal } from "lucide-react";

const FlashCards = () => {
  return (
    <div className="w-full  h-full font-rubik">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-emerald-700">
          My Flash Cards
        </h1>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Search size={20} />
          </button>
          <button className="p-2 bg-emerald-50 text-emerald-700 rounded-full">
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Cards Container */}
      <div className="space-y-4 w-full h-[400px] sm:h-[450px] bg-[#ecf1f0] dark:bg-[#444444] rounded-xl flex items-center justify-center flex-col relative">
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

        {/* Brainstorming Card */}
        <div className="bg-white dark:bg-[#262626] rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300 w-[90%] max-w-[320px] h-auto min-h-[120px] border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div className="space-y-2.5 w-full">
              {/* Avatar Group */}
              <div className="flex -space-x-3 mb-3">
                  
                  <div className="w-7 h-7 rounded-full bg-pink-100 border-2 dark:border-white border-white shadow-sm flex items-center justify-center text-xs font-medium text-pink-600">
                    PD
                  </div>
                  <div className="w-7 h-7 rounded-full bg-yellow-100 border-2 dark:border-white border-white shadow-sm flex items-center justify-center text-xs font-medium text-yellow-600">
                    AL
                  </div>
                  <div className="w-7 h-7 rounded-full bg-purple-100 border-2 dark:border-white border-white shadow-sm flex items-center justify-center text-xs font-medium text-purple-600">
                    +3
                  </div>
                </div>


              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                    BRADYCARDIA
                  </h2>
                  {/* <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                    Active
                  </span> */}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight">
                Abnormally slow heart rate (less than 60 BPM)
                </p>
              </div>

              <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>Last edited 2 days ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <span>8 comments</span>
                </div>
              </div>
            </div>

            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Research Card - Rotated slightly */}
        <div className="relative w-[90%] max-w-[320px] h-auto min-h-[120px] mt-6">
          <div className="absolute inset-0 bg-purple-200 rounded-xl transform w-full h-full"></div>
          <div className="bg-white dark:bg-[#262626] rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 relative rotate-12 w-full h-full border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div className="space-y-2.5 w-full">
                {/* Avatar Group */}
                <div className="flex -space-x-3 mb-3">
                  <div className="w-7 h-7 rounded-full bg-yellow-100 border-2 dark:border-white border-white shadow-sm flex items-center justify-center text-xs font-medium text-yellow-600">
                    AL
                  </div>
                  <div className="w-7 h-7 rounded-full bg-pink-100 border-2 dark:border-white border-white shadow-sm flex items-center justify-center text-xs font-medium text-pink-600">
                    PD
                  </div>
                  <div className="w-7 h-7 rounded-full bg-purple-100 border-2 dark:border-white border-white shadow-sm flex items-center justify-center text-xs font-medium text-purple-600">
                    +3
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                    HEPATOMEGALY
                    </h2>
                    {/* <span className="text-xs px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                      In Review
                    </span> */}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight">
                  Abnormal enlargement of the liver
                  </p>
                </div>

                <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>Last edited yesterday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                    </svg>
                    <span>3 attachments</span>
                  </div>
                </div>
              </div>

              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
      );
};

      export default FlashCards;
