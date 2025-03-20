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
        <div className="bg-white dark:bg-[#262626] rounded-xl p-3 shadow-sm w-[90%] max-w-[320px] h-auto min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1 w-full">
              {/* Avatar Group */}
              <div className="flex -space-x-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-orange-100 border dark:border-white border-black"></div>
                <div className="w-7 h-7 rounded-full bg-blue-100 border dark:border-white border-black"></div>
                <div className="w-7 h-7 rounded-full bg-green-100 border dark:border-white border-black"></div>
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                Brainstorming
              </h2>
              <p className="text-sm text-gray-500 leading-tight">
                Brainstorming brings team members' diverse experience into play.
              </p>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Research Card - Rotated slightly */}
        <div className="relative w-[90%] max-w-[320px] h-auto min-h-[120px]">
          <div className="absolute inset-0 bg-purple-200 rounded-xl transform w-full h-full"></div>
          <div className="bg-white dark:bg-[#262626] rounded-xl p-3 shadow-sm relative rotate-12 w-full h-full">
            <div className="flex justify-between items-start">
              <div className="space-y-1 w-full">
                {/* Avatar Group */}
                <div className="flex -space-x-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-yellow-100 border dark:border-white border-black"></div>
                  <div className="w-7 h-7 rounded-full bg-pink-100 border dark:border-white border-black"></div>
                </div>
                <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                  Research
                </h2>
                <p className="text-sm text-gray-500 leading-tight">
                  User research helps you to create an optimal product for
                  users.
                </p>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCards;
