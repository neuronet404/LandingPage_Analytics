"use client"
import React, { useEffect, useState } from 'react';
import { Slider } from "@/components/ui/slider";
import stroke from "@/public/stroke.svg"
import Image from 'next/image';
import { useSettings } from '@/context/SettingsContext';

const StrokeWidthIcon = () => (
  <Image alt="stroke" src={stroke}/>
);


const PenMenu = ({ selectedTool, onToolUpdate }) => {
  const [strokeWidth, setStrokeWidth] = useState(selectedTool?.strokeWidth || 3);
  const [opacity, setOpacity] = useState(selectedTool?.opacity || 75);

  useEffect(() => {
    setStrokeWidth(selectedTool?.strokeWidth || 3);
    setOpacity(selectedTool?.opacity || 75);
  }, [selectedTool]);

  // Handle stroke width change
  const onStrokeChange = (value) => {
    const newStrokeWidth = value[0];
    setStrokeWidth(newStrokeWidth);
    onToolUpdate({ ...selectedTool, strokeWidth: newStrokeWidth });
  };

  // Handle opacity change
  const onOpacityChange = (value) => {
    const newOpacity = value[0];
    setOpacity(newOpacity);
    onToolUpdate({ ...selectedTool, opacity: newOpacity });
  };

  return (
    <div className="bg-white rounded-full py-1.5 px-3 flex items-center gap-4 w-full relative">
      {/* Stroke Width */}
      <div className="flex items-center gap-1.5">
        <span className="text-gray-700 text-xs">Stroke</span>
        <div className="bg-gray-100 rounded px-1.5 py-0.5 flex items-center gap-0.5">
          {StrokeWidthIcon()}
          <span className="text-gray-700 text-xs font-medium">{strokeWidth}</span>
        </div>
        <div className="w-20">
          <Slider
            value={[strokeWidth]}
            max={10}
            min={1}
            step={1}
            onValueChange={onStrokeChange}
            className="w-full"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-gray-200" />

      {/* Opacity */}
      <div className="flex items-center gap-2 flex-1 w-32">
        <span className="text-gray-700 text-xs">Opacity</span>
        <div className="flex-1">
          <Slider
            value={[opacity]}
            max={100}
            step={1}
            onValueChange={onOpacityChange}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default PenMenu;