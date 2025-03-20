'use client'

import { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"
import Image from 'next/image'
import singlepage from '../../public/singlepage.svg'
import twopages from '../../public/twopages.svg'
import threepages from '../../public/threepages.svg'
import { useSettings } from '@/context/SettingsContext'



export default function PDFViewSelector() {
  const {selectedView, setSelectedView} = useSettings()

 

  return (
    <div className="group absolute m-5 w-[48px] h-[207px]" style={{zIndex:100}}>
      <div className="group-hover:flex hidden absolute m-5 w-[48px] h-[207px] bg-white rounded-md shadow-xl flex-col items-center justify-between gap-10 p-4">
        <button
          onClick={() => setSelectedView(1)}
          className={cn(
            "w-6 h-6 flex items-center justify-center transition-colors rounded",
            selectedView === 1 
              ? "bg-blue-100 text-blue-600" 
              : "text-gray-400 hover:bg-gray-100"
          )}
          aria-label="Single page view"
        >
          <Image src={singlepage} alt="Single page"/>
        </button>

        <button
          onClick={() => setSelectedView(2)}
          className={cn(
            "w-6 h-6 flex items-center justify-center transition-colors rounded",
            selectedView === 2 
              ? "bg-blue-100 text-blue-600" 
              : "text-gray-400 hover:bg-gray-100"
          )}
          aria-label="Horizontal scroll view"
        >
          <Image src={twopages} alt="Horizontal scroll"/>
        </button>

        <button
          onClick={() => setSelectedView(3)}
          className={cn(
            "w-6 h-6 flex items-center justify-center transition-colors rounded",
            selectedView === 3
              ? "bg-blue-100 text-blue-600" 
              : "text-gray-400 hover:bg-gray-100"
          )}
          aria-label="Vertical scroll view"
        >
          <Image src={threepages} alt="Vertical scroll"/>
        </button>
      </div>
    </div>
  )
}